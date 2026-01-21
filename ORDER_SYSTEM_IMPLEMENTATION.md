# Order System Implementation Guide

## Overview
This document outlines the newly implemented stock ordering system for your AMMO inventory management application. Users can now order ammunition from existing stock, and admins can approve orders with automatic stock reduction.

---

## Features Implemented

### 1. **Order from Stock (User-Facing)**
**Endpoint:** `POST /users/order/stock`

Users can now order ammunition directly from the existing inventory.

**Request Body:**
```json
{
  "ammoId": 1,
  "quantity": 100
}
```

**Response:**
```json
{
  "id": 5,
  "ammoId": 1,
  "caliber": "9mm",
  "quantity": 100,
  "status": "pending",
  "createdAt": "2025-01-21T10:30:00Z"
}
```

**Features:**
- Users select ammunition from the Inventory page
- Opens a modal dialog with quantity input
- Maximum quantity validated against available stock
- Order automatically set to "pending" status
- Awaits admin approval before stock is deducted

---

### 2. **Admin Approval with Stock Reduction**
**Endpoint:** `PATCH /users/orders/:id`

Admins can approve pending orders, which automatically reduces stock.

**Request Body (for approval):**
```json
{
  "status": "approved",
  "ammoId": 1,
  "issuedQuantity": 50
}
```

**Features:**
- Admin selects which inventory item to issue from (by caliber match)
- Can approve partial quantities (e.g., 50 out of 100 requested)
- Stock is automatically deducted from `ammo_inventory.quantity`
- Validation ensures sufficient stock is available
- Returns 400 error if insufficient stock

**Response:**
```json
{
  "id": 5,
  "status": "approved",
  "message": "Order approved and stock reduced by 50 rounds"
}
```

---

## Frontend Changes

### 1. **InventoryPage Component** (`/inventory/frontend/src/pages/InventoryPage.tsx`)

**New Features:**
- **"Order Now" Button** on each ammunition card
- **Order Modal Dialog** with:
  - Selected item display
  - Quantity input field (1 to available quantity)
  - Cancel/Place Order buttons
  - Success/error notifications

**State Variables Added:**
```typescript
const [orderingItem, setOrderingItem] = useState<any>(null);
const [orderQuantity, setOrderQuantity] = useState<number>(1);
const [orderSubmitting, setOrderSubmitting] = useState(false);
const [orderSuccess, setOrderSuccess] = useState("");
```

**Function Added:**
```typescript
const handleOrderAmmo = async () => {
  // Places order via API
  // Shows success message
  // Clears modal
}
```

### 2. **Dashboard Admin Panel** (`/inventory/frontend/src/pages/dashboard.tsx`)

**New Admin Approval Features:**
- **Modal for Order Approval** with:
  - Order details display
  - Dropdown to select inventory item by caliber
  - Quantity input for issued amount
  - Approve/Cancel buttons
  - Validation and error handling

**New State Variables:**
```typescript
const [approvingOrder, setApprovingOrder] = useState<any>(null);
const [approvalQuantity, setApprovalQuantity] = useState<number>(0);
const [selectedAmmoForApproval, setSelectedAmmoForApproval] = useState<number | null>(null);
```

**New Functions:**
```typescript
const handleApproveOrder = (orderId, status) => {
  // Opens modal if status is "approved"
  // Updates directly for "rejected" or "completed"
}

const handleConfirmApproval = async () => {
  // Submits approval with selected ammo and quantity
  // Automatically reduces stock
  // Refreshes dashboard
}
```

---

## Backend Changes

### 1. **New Endpoint: Order from Stock**
**File:** `/ammo/src/routes/users.ts`

```typescript
const orderFromStockRoute = createRoute({
  method: "post",
  path: "/order/stock",
  // ... validates ammoId and quantity
  // ... creates order with ammoId reference
})
```

### 2. **Enhanced Endpoint: Update Order Status**
**File:** `/ammo/src/routes/users.ts`

Updated the `updateOrderStatusRoute` to:
- Check if status is "approved"
- Validate ammoId and issuedQuantity are provided
- Fetch the ammo inventory item
- Check stock availability
- Reduce inventory quantity by issued amount
- Update order with new fields

```typescript
if (body.status === "approved") {
  const ammoId = body.ammoId;
  const issuedQty = body.issuedQuantity || currentOrder.quantity;
  
  // Get ammo and validate stock
  // Reduce quantity: ammo.quantity - issuedQty
  // Update order with ammoId and issuedQuantity
}
```

### 3. **Updated API Service**
**File:** `/inventory/frontend/src/services/api.ts`

**New Function:**
```typescript
export const orderFromStock = (data: { ammoId: number; quantity: number }) =>
  API.post("/users/order/stock", data);
```

**Enhanced Function:**
```typescript
export const updateOrderStatus = (
  orderId: number, 
  status: string, 
  issuedQuantity?: number, 
  ammoId?: number
) => API.patch(`/users/orders/${orderId}`, { status, issuedQuantity, ammoId });
```

---

## Database Schema

### ammoOrders Table (Current)
```sql
CREATE TABLE "ammo_orders" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  caliber VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

**Future Enhancement:** Add optional columns:
```sql
-- ammo_id INTEGER REFERENCES "ammo_inventory"(id)
-- issued_quantity INTEGER DEFAULT 0
-- updated_at TIMESTAMP DEFAULT now()
```

---

## User Workflow

### For Regular Users:
1. Navigate to **Inventory** tab
2. Find ammunition they need
3. Click **"Order Now"** button
4. Enter desired quantity
5. Click **"Place Order"**
6. Order shows as **pending**
7. Wait for admin approval

### For Admins:
1. Navigate to **Admin** → **Orders** tab
2. View all pending orders
3. Click **"Approve"** on pending order
4. Modal opens showing:
   - Order details
   - Available inventory matching caliber
   - Quantity selector
5. Select inventory item
6. Enter issued quantity (can be partial)
7. Click **"Approve & Issue"**
8. Stock automatically reduced
9. Order status changes to **approved**

---

## Validation & Error Handling

### User-Side:
- Quantity must be ≥ 1
- Quantity cannot exceed available stock
- Ammo ID must be valid
- Must be authenticated

### Admin-Side:
- Status must be valid enum
- For approval: ammoId and issuedQuantity required
- Issued quantity cannot exceed available stock
- Issued quantity cannot exceed requested quantity
- Returns error: `"Insufficient stock. Available: X, Requested: Y"`

---

## Testing Checklist

- [ ] User can see "Order Now" button on Inventory page
- [ ] Order modal displays correctly
- [ ] Quantity input has proper min/max validation
- [ ] Order submission creates pending order
- [ ] Admin sees orders in admin panel
- [ ] Admin approval modal shows correctly
- [ ] Stock is reduced after approval
- [ ] Partial approval works (approve less than requested)
- [ ] Error message shows if insufficient stock
- [ ] Order status updates in real-time

---

## Next Steps (Optional Enhancements)

1. **Database Migration:** Add `ammo_id`, `issued_quantity`, `updated_at` columns to `ammo_orders`
2. **Order History:** Show user their order history with status
3. **Notifications:** Email/in-app notifications when order is approved/rejected
4. **Order Search:** Admin search/filter orders by date, user, status
5. **Stock Alerts:** Notify admins when stock drops below threshold
6. **Audit Log:** Track all stock changes with timestamps and user

---

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/users/order` | Order ammo not in stock | User |
| POST | `/users/order/stock` | Order ammo from stock | User |
| GET | `/users/orders` | View all orders | Admin |
| PATCH | `/users/orders/:id` | Update order status | Admin |
| GET | `/users/inventory` | Get inventory | User |
| GET | `/users/ammo/all` | Get all ammo (admin) | Admin |

---

## Troubleshooting

**Problem:** Order won't place
- Check: Ammo ID is valid
- Check: Quantity is > 0 and ≤ available
- Check: User is authenticated

**Problem:** Stock not reducing
- Check: Admin selected correct inventory item
- Check: Approval quantity doesn't exceed available
- Check: Backend returned success response

**Problem:** Modal not showing
- Check: Browser console for errors
- Check: `approvingOrder` state is set correctly
- Check: Modal CSS position is not hidden behind other elements

