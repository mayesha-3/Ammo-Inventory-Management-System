# Ammunition Inventory Management - Complete CRUD Implementation

## Overview
This document outlines the complete CRUD (Create, Read, Update, Delete) implementation for ammunition inventory management in the admin dashboard.

## Implementation Details

### Backend Endpoints (ammo/src/routes/users.ts)
All endpoints are properly protected with role-based access control (`requireRole(["admin", "moderator"])`)

#### 1. **GET /users/ammo/all** - Retrieve All Ammunition
- **Purpose**: Fetch complete list of all ammunition in inventory
- **Authentication**: Required (HTTP-only cookie)
- **Authorization**: Admin/Moderator only
- **Response**: 
  ```json
  {
    "ammo": [
      {
        "id": 1,
        "caliber": "9mm",
        "quantity": 1000,
        "supplierId": null,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
  ```

#### 2. **POST /users/ammo/create** - Create New Ammunition
- **Purpose**: Add new ammunition to inventory
- **Authentication**: Required (HTTP-only cookie)
- **Authorization**: Admin/Moderator only
- **Request Body**:
  ```json
  {
    "caliber": "9mm",
    "quantity": 1000,
    "supplierId": null
  }
  ```
- **Response**: Returns created ammo object with ID and timestamp

#### 3. **PATCH /users/ammo/:id** - Update Ammunition
- **Purpose**: Modify existing ammunition details (caliber and/or quantity)
- **Authentication**: Required (HTTP-only cookie)
- **Authorization**: Admin/Moderator only
- **Request Body**:
  ```json
  {
    "caliber": "9mm",
    "quantity": 1500
  }
  ```
- **Response**: Returns updated ammo object

#### 4. **DELETE /users/ammo/:id** - Delete Ammunition
- **Purpose**: Remove ammunition from inventory
- **Authentication**: Required (HTTP-only cookie)
- **Authorization**: Admin/Moderator only
- **Response**: Returns success message

---

### Frontend API Service (inventory/frontend/src/services/api.ts)

```typescript
// Get all ammunition for admin users
export const getAmmoForAdmin = () => 
  API.get("/users/ammo/all");

// Create new ammunition
export const createAmmo = (data: { 
  caliber: string; 
  quantity: number; 
  supplierId?: number 
}) =>
  API.post("/users/ammo/create", data);

// Update existing ammunition
export const updateAmmo = (id: number, data: { 
  caliber?: string; 
  quantity?: number 
}) =>
  API.patch(`/users/ammo/${id}`, data);

// Delete ammunition
export const deleteAmmo = (id: number) =>
  API.delete(`/users/ammo/${id}`);
```

---

### Frontend State Management (dashboard.tsx)

#### State Variables
```typescript
const [ammos, setAmmos] = useState<any[]>([]); // List of all ammo
const [editingAmmoId, setEditingAmmoId] = useState<number | null>(null); // Currently editing ammo ID
const [editCaliber, setEditCaliber] = useState(""); // Edit mode caliber value
const [editQuantity, setEditQuantity] = useState(""); // Edit mode quantity value
const [newAmmoCaliber, setNewAmmoCaliber] = useState(""); // New ammo caliber input
const [newAmmoQuantity, setNewAmmoQuantity] = useState(""); // New ammo quantity input
```

#### Handler Functions

1. **handleAddAmmo()** - Create new ammunition
   - Validates both caliber and quantity fields
   - Makes API call to create ammo
   - Refreshes ammunition list on success
   - Shows success alert to user
   - Clears form fields

2. **handleUpdateAmmo(id)** - Update existing ammunition
   - Validates edit fields
   - Makes PATCH API call with ID and new data
   - Refreshes ammunition list on success
   - Exits edit mode

3. **handleDeleteAmmo(id)** - Delete ammunition
   - Confirms deletion via browser confirmation dialog
   - Makes DELETE API call
   - Refreshes ammunition list on success
   - Shows success alert

4. **startEditingAmmo(ammo)** - Enter edit mode
   - Sets editingAmmoId to trigger UI switch
   - Populates editCaliber and editQuantity with current values

5. **cancelEditingAmmo()** - Exit edit mode
   - Clears all edit state variables
   - Returns to display mode

---

### Admin Dashboard UI Components

#### Sub-tabs Navigation
```
Users | Orders | Ammo
```

#### Ammo Tab Interface

**1. Add New Ammunition Form**
- Caliber input field (text, e.g., "9mm", ".45 ACP")
- Quantity input field (number of rounds)
- "Add Ammo" button
- Disabled during loading

**2. Ammunition Inventory Table**
- **Columns**: 
  - ID (Primary key)
  - Caliber (Type of ammunition)
  - Quantity (Number of rounds in stock)
  - Created (Date/time ammunition was added)
  - Actions (Edit/Delete buttons)

- **Features**:
  - Edit mode row switching: When editing, caliber and quantity become input fields with Save/Cancel buttons
  - Edit button (orange/amber) - Enters edit mode for that row
  - Delete button (red) - Removes ammunition after confirmation
  - Save button (blue) - Commits edits
  - Cancel button (gray) - Discards edits

**3. Display Format**
- Quantity displays with comma formatting (e.g., "1,000 rounds")
- Created date displays in locale format
- Timestamps from `createdAt` field

---

## Data Flow

### Adding Ammunition
```
User fills "Add New Ammo" form
         ↓
User clicks "Add Ammo" button
         ↓
handleAddAmmo() validates inputs
         ↓
API call: POST /users/ammo/create
         ↓
Backend validates and inserts into ammoInventory table
         ↓
Frontend receives success response
         ↓
Dashboard re-fetches all ammo via getAmmoForAdmin()
         ↓
UI displays updated list
         ↓
Form fields cleared, success alert shown
```

### Updating Ammunition
```
User clicks "Edit" button on ammo row
         ↓
startEditingAmmo() switches UI to edit mode
         ↓
User modifies caliber/quantity input fields
         ↓
User clicks "Save" button
         ↓
handleUpdateAmmo() validates new values
         ↓
API call: PATCH /users/ammo/:id
         ↓
Backend updates ammoInventory table
         ↓
Frontend receives updated ammo object
         ↓
Dashboard re-fetches all ammo
         ↓
UI displays updated list, edit mode exits
         ↓
Success alert shown
```

### Deleting Ammunition
```
User clicks "Delete" button
         ↓
Browser confirmation dialog shown
         ↓
If confirmed, handleDeleteAmmo() executed
         ↓
API call: DELETE /users/ammo/:id
         ↓
Backend deletes from ammoInventory table
         ↓
Frontend receives success response
         ↓
Dashboard re-fetches all ammo
         ↓
UI displays updated list without deleted item
         ↓
Success alert shown
```

---

## Error Handling

All CRUD operations include comprehensive error handling:

- **Input Validation**: Checks for empty/invalid fields before API calls
- **Network Errors**: Catches and displays API failures
- **Server Errors**: Displays 404 for not found, 500 for server errors
- **Loading States**: Disables buttons during API operations
- **User Feedback**: Shows alerts on success/failure

Example error handling:
```typescript
try {
  setLoading(true);
  setError("");
  await api.createAmmo({...});
  alert("Ammunition added successfully!");
  // ... refresh data
} catch (err: any) {
  setError("Failed to add ammo: " + err.message);
} finally {
  setLoading(false);
}
```

---

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT token in HTTP-only cookie
2. **Role-Based Access Control**: Only admin/moderator users can perform CRUD operations
3. **Backend Validation**: All data validated with Zod schemas before database operations
4. **Password Security**: Admin credentials hashed with bcrypt (cost factor 10)
5. **CORS & Credentials**: Frontend sends credentials with requests, backend validates origin

---

## Testing Checklist

- ✅ Admin can view all ammunition in inventory table
- ✅ Admin can add new ammunition with caliber and quantity
- ✅ Admin can edit existing ammunition (caliber and/or quantity)
- ✅ Admin can delete ammunition with confirmation
- ✅ Inline edit mode switches UI between display and input
- ✅ All form inputs validate before API calls
- ✅ Loading states disable buttons during operations
- ✅ Success/error alerts displayed to user
- ✅ Ammunition list refreshes after each operation
- ✅ Created date displays correctly formatted
- ✅ Quantity displays with comma formatting
- ✅ Backend enforces admin/moderator role for all endpoints

---

## Admin Credentials

- **Email**: admin@ammo.com
- **Password**: Admin@123
- **Role**: admin

---

## Database Schema

**Table**: `ammo_inventory`
```sql
- id (Primary Key)
- caliber (VARCHAR) - e.g., "9mm", ".45 ACP"
- quantity (INTEGER) - number of rounds
- supplierId (INTEGER, nullable) - optional supplier reference
- createdAt (TIMESTAMP) - auto-generated on insert
```

---

## Browser Storage & Session

- JWT token stored in HTTP-only cookie
- Token expires after 7 days
- Login required to access admin dashboard
- All CRUD operations checked for valid authentication

