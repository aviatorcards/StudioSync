# Inventory Management Module

The Inventory Management module provides comprehensive tracking for studio equipment, instruments, accessories, and other physical items. It includes checkout/lending functionality and practice room reservations.

## Overview

StudioSync's inventory system helps music studios:

- Track all equipment and instruments
- Monitor item condition and value
- Manage lending to students
- Reserve practice rooms
- Schedule maintenance
- Monitor item availability

## Inventory Items

### Item Categories

Items are organized into categories:

- **Instruments**: Guitars, pianos, violins, drums, etc.
- **Equipment**: Amplifiers, microphones, music stands, etc.
- **Sheet Music**: Physical sheet music and method books
- **Accessories**: Strings, reeds, drumsticks, cables, etc.
- **Other**: Miscellaneous studio items

### Item Information

Each inventory item tracks:

**Basic Details:**
- Name and description
- Category
- Total quantity
- Available quantity (not checked out)
- Location in studio
- Serial number (optional)

**Condition & Value:**
- Condition rating (Excellent, Good, Fair, Needs Repair)
- Current status (Available, Checked Out, In Maintenance, Retired)
- Purchase value
- Purchase date
- Last maintenance date

**Lending Settings:**
- Whether item is borrowable by students
- Maximum checkout duration (default 7 days)
- Quantity restrictions

## Checkout System

### Student Checkouts

Students can request to borrow inventory items:

**Checkout Process:**

1. **Request**: Student requests item checkout
2. **Approval**: Teacher/admin approves or denies
3. **Check Out**: Item marked as checked out, quantity updated
4. **Return**: Item returned, status updated
5. **Review**: Condition inspected upon return

### Checkout Status

- **Pending**: Awaiting approval
- **Approved**: Currently checked out to student
- **Returned**: Item has been returned
- **Overdue**: Past due date
- **Cancelled**: Request was cancelled

### Checkout Details

Each checkout record includes:

- Student information
- Item and quantity
- Checkout date
- Due date
- Return date (when returned)
- Approval information (who approved, when)
- Notes (special instructions, damage reports)

### Overdue Management

The system automatically:
- Identifies overdue items
- Marks checkouts as overdue when due date passes
- Can send notifications to students with overdue items
- Tracks unreturned items

## Practice Rooms

### Room Management

Studios can manage practice rooms available for student use:

**Room Details:**
- Room name/number
- Capacity (maximum occupants)
- Description
- Available equipment (piano, amp, drums, etc.)
- Hourly rate (can be $0 for free rooms)

### Room Reservations

Students can reserve practice rooms:

**Reservation Information:**
- Room selection
- Date and time (start/end)
- Duration (automatically calculated)
- Total cost (calculated from hourly rate)
- Payment status
- Reservation status

**Reservation Statuses:**
- **Pending**: Awaiting confirmation
- **Confirmed**: Reservation approved
- **Cancelled**: Reservation cancelled
- **Completed**: Past reservation
- **No-show**: Student didn't show up

### Conflict Prevention

The system prevents double-booking by:
- Validating time slots don't overlap
- Checking existing confirmed reservations
- Showing availability in real-time

### Cost Calculation

Room costs are automatically calculated:
```
Duration (hours) × Hourly Rate = Total Cost
```

Example: 2-hour reservation at $15/hour = $30

## Inventory Valuation

### Total Inventory Value

Track the total value of all studio equipment:

- Sum of all item values
- Useful for insurance purposes
- Depreciation tracking (manual)

### Value by Category

View inventory value broken down by:
- Instruments
- Equipment
- Accessories
- Sheet music
- Other

### Low Stock Alerts

The system identifies items with low availability:
- Items with ≤2 available quantity
- Helpful for reordering supplies
- Prevents over-lending

## Maintenance Tracking

### Maintenance Records

For each item, track:
- Last maintenance date
- Maintenance notes
- Maintenance history (via admin notes)

### Item Condition

Monitor item condition over time:
- **Excellent**: Like new
- **Good**: Normal wear
- **Fair**: Shows wear, fully functional
- **Needs Repair**: Requires maintenance

### Maintenance Status

Items can be marked "In Maintenance":
- Temporarily unavailable
- Not available for checkout
- Excluded from available count

## Permissions & Access

### Student Access

Students can:
- View available items
- Request item checkouts
- View their checkout history
- Reserve practice rooms (if enabled)
- See room availability

### Teacher Access

Teachers can:
- Approve/deny checkout requests
- View all checkouts
- Manage their studio's inventory
- Add/edit room reservations
- Mark items returned

### Admin Access

Admins can:
- Add/edit/delete inventory items
- Override checkout approvals
- Manage practice rooms
- View inventory reports
- Update item values and condition

## Best Practices

### Inventory Management

1. **Regular Audits**: Periodically verify physical inventory
2. **Condition Updates**: Update item condition after each checkout
3. **Maintenance Scheduling**: Plan regular maintenance for high-value items
4. **Clear Policies**: Establish checkout duration and late fees

### Checkout Workflow

1. **Approval Process**: Require admin/teacher approval for valuable items
2. **Damage Inspection**: Inspect items before and after checkout
3. **Documentation**: Use notes field to document condition issues
4. **Reminders**: Send notifications before due dates

### Practice Rooms

1. **Clear Rates**: Communicate room costs to students
2. **Buffer Time**: Consider adding buffer between reservations for cleaning
3. **Cancellation Policy**: Establish cancellation deadline
4. **No-show Handling**: Track and address repeated no-shows

## Reports & Analytics

The inventory system provides insights into:

- **Utilization**: Which items are checked out most frequently
- **Availability**: Current item availability
- **Overdue Items**: List of overdue checkouts
- **Room Usage**: Practice room reservation frequency
- **Value Tracking**: Total inventory value by category

## Integration with Other Modules

### Billing Integration

- Practice room costs can be added to student invoices
- Late fees for overdue items can be billed
- Equipment rental charges

### Messaging Integration

- Notifications for checkout approvals
- Overdue reminders
- Room reservation confirmations

### Resource Library Integration

- Physical items in inventory can be cross-referenced with digital resources
- Sheet music can exist in both digital (resources) and physical (inventory) forms

## Related Documentation

- [Inventory Checkout System](../INVENTORY_CHECKOUT_SYSTEM.md) - Detailed checkout workflow
- [Inventory Value Enhancement](../INVENTORY_VALUE_ENHANCEMENT.md) - Value tracking features
- [Billing Module](billing.md) - Invoice integration
