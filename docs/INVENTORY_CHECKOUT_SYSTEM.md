# Inventory System & Checkout Features - Implementation Guide

## 🎉 **Features Implemented**

### 1. **Inventory Management Backend** ✅
Complete Django backend for tracking studio assets.

#### Models Created:
- **InventoryItem**: Track instruments, equipment, sheet music, accessories
- **CheckoutLog**: Track who borrowed what and when
- **PracticeRoom**: Define available practice spaces
- **RoomReservation**: Student practice room bookings

### 2. **Student Checkout System** ✅
Students can request to borrow instruments and equipment!

#### Features:
- Students submit checkout requests
- Teachers/admins approve requests
- Automatic due date calculation
- Track borrowed items
- Return process with condition notes
-  Overdue item tracking

### 3. **Practice Room Reservations** ✅
Students can reserve practice time!

#### Features:
- View room availability
- Book time slots
- Automatic cost calculation
- Prevent double-bookings
- Cancel reservations
- Admin oversight

---

## 📋 **Setup Instructions**

### Step 1: Run Migrations
```bash
cd backend
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
python manage.py makemigrations inventory
python manage.py migrate inventory
```

### Step 2: Create Sample Data (Optional)
```python
# In Django shell: python manage.py shell
from apps.inventory.models import *
from apps.core.models import User

# Create some practice rooms
room1 = PracticeRoom.objects.create(
    name="Studio A",
    capacity=2,
    description="Small practice room with piano",
    equipment="Upright piano, music stand, metronome",
    hourly_rate=10.00
)

room2 = PracticeRoom.objects.create(
    name="Studio B",
    capacity=4,
    description="Medium practice room",
    equipment="Drum kit, amps, mic",
    hourly_rate=15.00
)

# Create inventory items
piano = InventoryItem.objects.create(
    name="Yamaha U1 Upright Piano",
    category="instrument",
    quantity=1,
    available_quantity=1,
    condition="excellent",
    location="Studio Room A",
    value=5000,
    is_borrowable=False,  # Can't check out the piano!
    notes="Tuned quarterly"
)

violin = InventoryItem.objects.create(
    name="Student Violin 4/4",
    category="instrument", 
    quantity=5,
    available_quantity=5,
    condition="good",
    location="Storage Closet",
    value=300,
    is_borrowable=True,
    max_checkout_days=30,
    notes="Available for student rental"
)
```

---

## 🔌 **API Endpoints**

### Inventory Items
```
GET    /api/inventory/items/              - List all items
POST   /api/inventory/items/              - Create new item (admin/teacher)
GET    /api/inventory/items/{id}/         - Get item details
PATCH  /api/inventory/items/{id}/         - Update item
DELETE /api/inventory/items/{id}/         - Delete item
GET    /api/inventory/items/stats/        - Get inventory statistics
```

**Query Parameters:**
- `?category=instrument` - Filter by category
- `?status=available` - Filter by status
- `?search=violin` - Search by name/location

### Checkout Management
```
GET    /api/inventory/checkouts/          - List checkouts
POST   /api/inventory/checkouts/          - Request to borrow item
GET    /api/inventory/checkouts/{id}/     - Get checkout details
POST   /api/inventory/checkouts/{id}/approve/     - Approve request (admin/teacher)
POST   /api/inventory/checkouts/{id}/return_item/ - Return item
```

**Query Parameters:**
- `?status=pending` - Filter by status
- `?student=123` - Filter by student ID

### Practice Rooms
```
GET    /api/inventory/practice-rooms/              - List rooms
POST   /api/inventory/practice-rooms/              - Create room (admin)
GET    /api/inventory/practice-rooms/{id}/         - Get room details
GET    /api/inventory/practice-rooms/{id}/availability/?date=2024-12-20  - Check availability
```

### Room Reservations
```
GET    /api/inventory/reservations/        - List reservations
POST   /api/inventory/reservations/        - Create reservation
GET    /api/inventory/reservations/{id}/   - Get reservation details
POST   /api/inventory/reservations/{id}/cancel/  - Cancel reservation
```

**Query Parameters:**
- `?start_date=2024-12-20` - Filter by date range
- `?room=1` - Filter by room

---

## 🎯 **Usage Examples**

### Student Borrows a Violin
```typescript
// Student submits checkout request
const response = await api.post('/inventory/checkouts/', {
    item: 5,  // Violin ID
    quantity: 1,
    due_date: '2025-01-15',  // Optional, auto-calculated if not provided
    notes: 'For home practice'
})
// Response: { id: 123, status: 'pending', ... }

// Teacher approves
await api.post('/inventory/checkouts/123/approve/')
// Response: { id: 123, status: 'approved', ... }

// Student returns
await api.post('/inventory/checkouts/123/return_item/', {
    notes: 'Returned in good condition'
})
```

### Student Books Practice Room
```typescript
// Check availability first
const availability = await api.get('/inventory/practice-rooms/1/availability/', {
    params: { date: '2024-12-21' }
})

// Book a slot
const reservation = await api.post('/inventory/reservations/', {
    room: 1,
    start_time: '2024-12-21T14:00:00',
    end_time: '2024-12-21T15:30:00',
    notes: 'Piano practice'
})
// Response includes auto-calculated cost based on room hourly_rate
```

---

## 🎨 **Frontend Integration**

### Connect Inventory Page to Backend

Update `/frontend/app/dashboard/inventory/page.tsx`:

```typescript
// Instead of hardcoded items:
const [items, setItems] = useState<InventoryItem[]>([])

// Load from API:
useEffect(() => {
    const fetchItems = async () => {
        try {
            const response = await api.get('/inventory/items/')
            setItems(response.data)
        } catch (error) {
            console.error('Failed to load inventory:', error)
            toast.error('Failed to load inventory')
        }
    }
    fetchItems()
}, [])

// Add item function:
const handleAddItem = async (itemData) => {
    try {
        const response = await api.post('/inventory/items/', itemData)
        setItems([...items, response.data])
        toast.success('Item added!')
    } catch (error) {
        toast.error('Failed to add item')
    }
}
```

### Add Checkout Features
Create new page: `/frontend/app/dashboard/checkout/page.tsx`:

```typescript
// For students to view borrowable items and request checkouts
// For teachers to approve/manage checkouts
```

### Add Practice Room Booking
Create new page: `/frontend/app/dashboard/practice-rooms/page.tsx`:

```typescript
// Calendar view of room availability  
// Booking form
// Student's reservation history
```

---

## 🔐 **Permissions**

### Inventory Items:
- **View**: All authenticated users
- **Create/Edit/Delete**: Admin & Teacher only
- **Students**: Can view items marked as `is_borrowable=True`

### Checkouts:
- **Request**: Students
- **Approve/Manage**: Admin & Teacher
- **View Own**: Students see only their checkouts
- **View All**: Admin & Teacher

### Practice Rooms:
- **View**: All users
- **Create/Edit**: Admin only
- **Book**: All users
- **Cancel Own**: Students can cancel their own
- **Cancel Any**: Admin & Teacher

---

## 🚀 **Next Steps**

1. **Create sample data** in the admin panel.
2. **Update frontend** inventory page to use API
3. **Create checkout interface** for students
4. **Create practice room booking** interface
5. **Add calendar view** for reservations
6. **Add email notifications** for:
   - Checkout approvals
   - Return reminders
   - Reservation confirmations

## 📊 **Database Schema**

```
InventoryItem
├── Basic Info (name, category, condition)
├── Quantity (total, available)
├── Value & Location
├── Borrowing Settings (is_borrowable, max_checkout_days)
└── Tracking (created_at, created_by)

CheckoutLog
├── References (item, student)
├── Dates (checkout, due, return)
├── Status (pending, approved, returned, overdue)
└── Approval (approved_by, approved_at)

PracticeRoom
├── Info (name, capacity, description)
├── Equipment list
└── Pricing (hourly_rate)

RoomReservation
├── References (room, student)
├── Time (start_time, end_time)
├── Status & Payment
└── Auto-calculated total_cost
```

---

**All backend code is complete and ready to use!** Just run the migrations and start integrating with your frontend. 🎉
