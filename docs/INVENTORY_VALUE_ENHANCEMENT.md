# Inventory Model Enhancement - Migration Guide

## Changes to InventoryItem Model

### New Fields Added:

```python
# Detailed instrument information
manufacturer = models.CharField(max_length=200, blank=True, help_text="Brand/Maker")
model = models.CharField(max_length=200, blank=True, help_text="Model name/number")
year_made = models.IntegerField(null=True, blank=True, help_text="Year of manufacture")

# Enhanced value tracking
purchase_price = models.DecimalField(
    max_digits=10, 
    decimal_places=2, 
    default=0,
    help_text="Original purchase price"
)
current_value = models.DecimalField(
    max_digits=10, 
    decimal_places=2, 
    default=0,
    help_text="Current estimated value"
)
depreciation_rate = models.DecimalField(
    max_digits=5,
    decimal_places=2,
    default=10.00,
    help_text="Annual depreciation percentage (e.g., 10.00 for 10%)"
)
```

### Fields to Remove:
- `value` (replaced by `purchase_price` and `current_value`)

### New Properties/Methods:

```python
@property
def age_in_years(self):
    """Calculate age of item in years"""
    from datetime import date
    if self.purchase_date:
        today = date.today()
        return (today - self.purchase_date).days / 365.25
    return 0

@property
def estimated_value(self):
    """Calculate estimated current value based on depreciation"""
    if self.purchase_price and self.purchase_date:
        years = self.age_in_years
        if years > 0:
            # Simple straight-line depreciation
            depreciation = self.purchase_price * (self.depreciation_rate / 100) * years
            estimated = max(0, self.purchase_price - depreciation)
            return round(estimated, 2)
    return self.current_value or self.purchase_price

def update_current_value(self):
    """Update current_value field with estimated value"""
    self.current_value = self.estimated_value
    self.save(update_fields=['current_value'])

@property
def value_change(self):
    """Calculate change in value since purchase"""
    if self.purchase_price:
        return self.current_value - self.purchase_price
    return 0

@property
def value_change_percentage(self):
    """Calculate percentage change in value"""
    if self.purchase_price and self.purchase_price > 0:
        return ((self.current_value - self.purchase_price) / self.purchase_price) * 100
    return 0
```

## Migration Steps:

1. **Add new fields to model** (keep old `value` field temporarily)
2. **Run makemigrations**:
   ```bash
   python manage.py makemigrations inventory
   ```

3. **Create data migration** to copy `value` to `purchase_price`:
   ```bash
   python manage.py makemigrations inventory --empty --name copy_value_to_purchase_price
   ```

4. **Edit the migration file**:
   ```python
   def copy_values(apps, schema_editor):
       InventoryItem = apps.get_model('inventory', 'InventoryItem')
       for item in InventoryItem.objects.all():
           item.purchase_price = item.value
           item.current_value = item.value
           item.save()
   
   class Migration(migrations.Migration):
       dependencies = [
           ('inventory', 'XXXX_previous_migration'),
       ]
       
       operations = [
           migrations.RunPython(copy_values),
       ]
   ```

5. **Run migrations**:
   ```bash
   python manage.py migrate inventory
   ```

6. **Remove old `value` field** from model
7. **Run makemigrations and migrate again**

## Frontend Updates Needed:

### Inventory Table Columns:
```typescript
columns = [
  'Item',
  'Category',
  'Manufacturer/Model',  // NEW
  'Quantity',
  'Condition',
  'Location',
  'Purchase Price',      // NEW
  'Current Value',       // NEW
  'Date Added',          // NEW (use created_at)
  'Actions'
]
```

### Add Item Form Fields:
```typescript
{
  name: string
  category: string
  manufacturer: string     // NEW
  model: string           // NEW
  year_made: number       // NEW
  quantity: number
  condition: string
  location: string
  purchase_price: number  // NEW
  purchase_date: date     // NEW
  depreciation_rate: number // NEW (default 10%)
  serial_number: string
  notes: string
  is_borrowable: boolean
  max_checkout_days: number
}
```

### Value Display:
```tsx
<div className="value-info">
  <div>Purchase Price: ${item.purchase_price}</div>
  <div>Current Value: ${item.current_value}</div>
  <div className={item.value_change >= 0 ? 'positive' : 'negative'}>
    Change: ${item.value_change} ({item.value_change_percentage}%)
  </div>
  <div>Age: {item.age_in_years} years</div>
</div>
```

## Future: Third-Party API Integration

### Potential APIs for Instrument Values:

1. **Reverb Price Guide API** (if they have one)
   - Real-time market values for musical instruments
   - Historical pricing data

2. **Blue Book of Guitar Values** (subscription-based)
   - Comprehensive guitar valuations
   - Condition-based pricing

3. **Custom API** (Build our own):
   ```python
   class InstrumentValueAPI:
       """
       Scrape or aggregate instrument values from multiple sources
       """
       @staticmethod
       def get_estimated_value(manufacturer, model, year, condition):
           # Check multiple sources
           # Return average estimated value
           pass
   ```

4. **Manual Value Updates**:
   - Allow admins to manually update current_value
   - Track value history over time
   - Set custom depreciation rates per item

## Depreciation Strategies:

### 1. Straight-Line (Current Implementation):
```python
annual_depreciation = purchase_price * (rate / 100)
current_value = purchase_price - (annual_depreciation * years)
```

### 2. Declining Balance (More realistic for instruments):
```python
current_value = purchase_price * ((1 - rate/100) ** years)
```

### 3. Custom/No Depreciation:
- Vintage instruments may appreciate
- Set depreciation_rate to 0 or negative for appreciation
- Allow manual value adjustments

## Example Usage:

```python
# Create an instrument
guitar = InventoryItem.objects.create(
    name="Fender Stratocaster",
    category="instrument",
    manufacturer="Fender",
    model="American Professional II Stratocaster",
    year_made=2020,
    purchase_price=1499.99,
    purchase_date=date(2020, 6, 15),
    depreciation_rate=5.0,  # 5% per year
    condition="excellent",
    location="Studio A - Cabinet 3"
)

# Get current value (auto-calculated)
print(f"Estimated value: ${guitar.estimated_value}")
# Output: Estimated value: $1124.99 (after ~5 years at 5% depreciation)

# Update current value to estimated
guitar.update_current_value()

# Check value change
print(f"Value change: ${guitar.value_change} ({guitar.value_change_percentage}%)")
```

## Admin Dashboard Enhancements:

### Total Value Calculation:
```python
total_purchase_value = InventoryItem.objects.aggregate(
    total=Sum('purchase_price')
)['total']

total_current_value = InventoryItem.objects.aggregate(
    total=Sum('current_value')
)['total']

total_depreciation = total_purchase_value - total_current_value
```

### Value Alerts:
- Items that have depreciated significantly
- Items that may need revaluation
- Vintage items that may have appreciated

This enhancement will make the inventory system much more robust for tracking instrument values over time!
