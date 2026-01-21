# Admin Dashboard - Complete Feature Overview

## Three Admin Management Tabs

### 1. 👥 Users Tab
**Purpose**: Manage all user accounts in the system

**Features**:
- View paginated list of all users
- Display columns: ID, Name, Email, PIN, Role
- Sorted user data
- Admin/Moderator view only

**Available Data**:
- User ID
- Full name
- Email address
- PIN number
- User role (user/moderator/admin)

---

### 2. 📋 Orders Tab
**Purpose**: Manage ammunition orders from users

**Features**:
- View all pending, approved, and completed orders
- Approve/Reject pending orders (green/red buttons)
- Mark approved orders as completed (blue button)
- Display columns: Order ID, User ID, Caliber, Quantity, Status, Actions

**Order Status Workflow**:
```
pending (user submission)
  ↓
Approve → approved (admin approves)
  OR
Reject → rejected (admin rejects)
  ↓
Mark Complete → completed (order fulfilled)
```

**Status Color Coding**:
- 🟡 Pending: Yellow badge
- 🟢 Approved: Green badge
- 🔴 Rejected: Red badge
- 🔵 Completed: Blue badge

---

### 3. 📦 Ammo Tab (NEW)
**Purpose**: Manage ammunition inventory database

**Features**:

#### View All Ammo
- Table displaying all ammunition in inventory
- Columns: ID, Caliber, Quantity, Created, Actions
- Real-time quantity formatting (with commas for large numbers)
- Creation timestamp for each item

#### Add New Ammunition
- Caliber input field
- Quantity input field (in rounds)
- "Add Ammo" button
- Automatic form reset after success
- Input validation before submission

#### Edit Ammunition
- Click "Edit" button on any row
- Row converts to edit mode with input fields
- Modify caliber and/or quantity
- Click "Save" to commit changes
- Click "Cancel" to discard changes
- Automatic refresh after successful update

#### Delete Ammunition
- Click "Delete" button on any row
- Confirmation dialog for safety
- Removes item from inventory after confirmation
- Automatic refresh after deletion

---

## Complete Admin Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│         ADMIN DASHBOARD                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Sub-tabs: [Users] [Orders] [Ammo]                 │
│  ─────────────────────────────────────             │
│                                                     │
│  If Users tab selected:                            │
│  ┌───────────────────────────────────────────────┐ │
│  │ User Management                               │ │
│  ├─────────────────────────────────────────────┤ │
│  │ ID | Name | Email | PIN | Role              │ │
│  │ ────────────────────────────────────────    │ │
│  │ 1  | John | john@email.com | 1234 | user  │ │
│  │ 2  | Jane | jane@email.com | 5678 | admin │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  If Orders tab selected:                           │
│  ┌───────────────────────────────────────────────┐ │
│  │ Order Management                              │ │
│  ├─────────────────────────────────────────────┤ │
│  │ # | User | Caliber | Qty | Status | Actions│ │
│  │ ────────────────────────────────────────    │ │
│  │ 1 | 2 | 9mm | 500 | [Pending]|[✓][✗]     │ │
│  │ 2 | 1 | .45 | 250 | [Approved]|[✓]       │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  If Ammo tab selected:                             │
│  ┌───────────────────────────────────────────────┐ │
│  │ Add New Ammunition                            │ │
│  │ ┌─────────────────┬──────────┬──────────────┐│ │
│  │ │ Caliber: [___]  │ Qty: [__]│ [Add Ammo] ││ │
│  │ └─────────────────┴──────────┴──────────────┘│ │
│  │                                               │ │
│  │ Ammo Inventory Management                     │ │
│  │ ┌───────────────────────────────────────────┐│ │
│  │ │ ID | Caliber | Quantity | Created | Acts.││ │
│  │ │ ─────────────────────────────────────────││ │
│  │ │ 1 | 9mm | 1,000 rounds | 1/15 | [E][D]  ││ │
│  │ │ 2 | .45 | 500 rounds | 1/14 | [E][D]   ││ │
│  │ │ 3 | 5.56 | 2,500 rounds | 1/13 | [E][D]││ │
│  │ └───────────────────────────────────────────┘│ │
│  │                                               │ │
│  │ Edit Mode (when row in edit):                │ │
│  │ │ ID | [Caliber Field] | [Qty Field] |[S][C]│ │
│  │ └───────────────────────────────────────────┘│ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Admin Permissions Matrix

| Operation | Users Tab | Orders Tab | Ammo Tab |
|-----------|-----------|-----------|---------|
| View All Items | ✅ | ✅ | ✅ |
| Add New Item | ❌ | ❌ | ✅ |
| Edit Item | ❌ | ✅ | ✅ |
| Approve/Reject | ❌ | ✅ | ❌ |
| Mark Complete | ❌ | ✅ | ❌ |
| Delete Item | ❌ | ❌ | ✅ |
| Role Required | Admin/Moderator | Admin/Moderator | Admin/Moderator |

---

## Data Flow for Each Tab

### Users Tab Flow
```
1. Admin loads dashboard
2. fetchDashboardData() calls api.getAllUsers()
3. Backend returns paginated user list
4. Table renders with user data
5. No editing - display only
```

### Orders Tab Flow
```
1. Admin loads dashboard
2. fetchDashboardData() calls api.getAllOrders()
3. Backend returns all orders (all statuses)
4. Table renders with orders
5. Admin clicks Approve/Reject/Complete buttons
6. handleApproveOrder() sends PATCH request
7. Status updates in database
8. Table automatically refreshes
```

### Ammo Tab Flow

#### Add Ammo
```
1. Admin enters caliber and quantity
2. Clicks "Add Ammo" button
3. handleAddAmmo() validates inputs
4. API call to api.createAmmo()
5. Backend inserts into ammoInventory table
6. Frontend refreshes ammo list
7. New item appears in table
8. Success alert shown
```

#### Edit Ammo
```
1. Admin clicks "Edit" button on a row
2. startEditingAmmo() sets editingAmmoId
3. Row switches to edit mode (inputs appear)
4. Admin modifies caliber and/or quantity
5. Admin clicks "Save"
6. handleUpdateAmmo() validates and sends PATCH
7. Backend updates row in ammoInventory table
8. Frontend refreshes ammo list
9. Row returns to display mode
10. Success alert shown
```

#### Delete Ammo
```
1. Admin clicks "Delete" button
2. Browser confirmation dialog appears
3. Admin confirms deletion
4. handleDeleteAmmo() sends DELETE request
5. Backend removes row from ammoInventory table
6. Frontend refreshes ammo list
7. Deleted item removed from table
8. Success alert shown
```

---

## Integration with Main Dashboard

The admin dashboard is accessible from the main dashboard's navigation:

```
Main Dashboard
├── Overview Tab (public - shows own issuances)
├── Order Tab (public - place ammo orders)
├── History Tab (public - view own orders)
├── Inventory Tab (public - view available ammo)
└── [Admin Tab] ← When logged in as admin/moderator
    ├── Users Sub-tab
    ├── Orders Sub-tab
    └── Ammo Sub-tab ← NEW
```

---

## Key Technical Details

### Authentication & Authorization
- All operations require valid JWT token in HTTP-only cookie
- JWT verified before accessing any endpoint
- Role checked: only admin/moderator can access these endpoints
- Token expires after 7 days
- Invalid/expired token returns 401 Unauthorized

### Database Operations
- All operations use Drizzle ORM queries
- Transactions ensure data consistency
- Error handling with try-catch blocks
- Validation with Zod schemas
- Created/updated timestamps tracked automatically

### Frontend State
- Independent state for each tab's operations
- Loading states prevent race conditions
- Error states displayed to user
- Form inputs reset after successful submission
- Edit mode isolated to prevent conflicts

### UI Responsiveness
- Disabled buttons during API operations
- Loading indicators (text changes to "...ing")
- Confirmation dialogs for destructive operations
- Real-time table updates after operations
- Proper error messages for failures

---

## Admin Workflow Example

### Daily Inventory Management
```
1. Log in as admin@ammo.com
2. Navigate to dashboard
3. Click "Ammo" tab
4. Review current inventory
5. Add new shipment:
   - Caliber: "9mm"
   - Quantity: "5000"
   - Click "Add Ammo"
6. Edit existing stock:
   - Click "Edit" on 9mm row
   - Update quantity to reflect usage
   - Click "Save"
7. Remove discontinued:
   - Click "Delete" on obsolete row
   - Confirm in dialog
8. View incoming orders in "Orders" tab
9. Approve/Complete orders as fulfilled
```

---

## Conclusion

The admin dashboard provides complete ammunition inventory management with:
- ✅ Comprehensive CRUD operations
- ✅ User management overview
- ✅ Order fulfillment workflow
- ✅ Real-time data synchronization
- ✅ Professional UI/UX design
- ✅ Secure role-based access control
- ✅ Comprehensive error handling
- ✅ Data validation at multiple levels

**Status**: READY FOR PRODUCTION USE

