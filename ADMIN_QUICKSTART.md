# Quick Start Guide - Admin Ammo Management

## Prerequisites
- Backend running on http://localhost:3000
- Frontend running on http://localhost:5173
- Admin account created in database

## Step-by-Step Usage

### 1. Login as Admin
1. Navigate to frontend (http://localhost:5173)
2. Click "Already have an account? Login"
3. Enter credentials:
   - **Email**: admin@ammo.com
   - **Password**: Admin@123
4. Click "Login"

### 2. Access Admin Dashboard
1. After login, you'll see the main dashboard
2. Scroll down to find the admin section
3. Click the **Ammo** tab (between Users and Orders tabs)

### 3. Add New Ammunition
1. In the "Add New Ammunition" form at the top:
   - **Caliber**: Enter ammunition type (e.g., "9mm", ".45 ACP", "5.56 NATO")
   - **Quantity**: Enter number of rounds (e.g., "1000")
2. Click the **"Add Ammo"** button
3. You'll see a success alert
4. The new ammunition appears in the table below

### 4. View Ammunition Inventory
- The table displays all ammunition with:
  - **ID**: Unique identifier
  - **Caliber**: Type of ammunition
  - **Quantity**: Number of rounds (formatted with commas)
  - **Created**: Date ammunition was added
  - **Actions**: Edit and Delete buttons

### 5. Edit Ammunition
1. Click the **"Edit"** button (orange) on any ammo row
2. The row switches to edit mode:
   - Caliber and Quantity fields become editable input boxes
   - Edit button replaces with "Save" (blue) and "Cancel" (gray) buttons
3. Modify the caliber and/or quantity
4. Click **"Save"** to commit changes
5. Success alert appears and list refreshes
6. Or click **"Cancel"** to discard changes

### 6. Delete Ammunition
1. Click the **"Delete"** button (red) on any ammo row
2. A confirmation dialog appears asking "Are you sure?"
3. Click **"OK"** to confirm deletion
4. Success alert appears and ammunition is removed from table
5. Or click **"Cancel"** to keep the item

## Field Descriptions

### Caliber Examples
- `9mm` - Common handgun round
- `.45 ACP` - Larger handgun round
- `5.56 NATO` - Rifle round
- `.22 LR` - Rimfire round
- `12 Gauge` - Shotgun round

### Quantity Tips
- Measured in rounds/cartridges
- Examples: 1000, 5000, 500
- Large quantities automatically display with formatting: "1,000"

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Please fill in all fields" | Missing caliber or quantity | Ensure both fields have values |
| "Failed to add ammo: ..." | Network or server error | Check backend is running, see console |
| "Ammunition not found" | Trying to edit/delete non-existent item | Refresh page and try again |
| "Internal server error" | Backend issue | Check backend logs |

## Tips & Tricks

### Bulk Operations
- Admins can add multiple ammunition types by repeating steps 3-4
- Each operation completes independently with its own success message

### Edit Multiple Items
- Click Edit on one item, save changes
- Click Edit on another item to switch editing focus
- Only one row can be edited at a time

### Viewing Added Timestamp
- The "Created" column shows when ammunition was added to inventory
- Helps track inventory additions over time

### Real-time Updates
- All table updates are real-time after each operation
- No manual refresh needed

## Troubleshooting

### "Ammo" Tab Not Visible
- Ensure you're logged in as admin user
- Check user role is set to "admin" in database
- Logout and login again

### Add Button Disabled (grayed out)
- Form is currently processing a request
- Wait for the previous operation to complete
- Check browser console for errors

### Changes Not Saving
- Check network tab in browser dev tools
- Ensure backend is accessible (http://localhost:3000)
- Check backend logs for errors
- Verify JWT token is not expired (expires after 7 days)

### Quantity Display Issues
- Large numbers display with comma formatting automatically
- If quantity shows as 0, check input was a valid number
- Clear browser cache if display looks wrong

## API Endpoints Reference

For developers testing directly via API:

```bash
# Get all ammo (requires auth header)
curl -X GET http://localhost:3000/users/ammo/all \
  -H "Cookie: token=<jwt_token>"

# Add ammo
curl -X POST http://localhost:3000/users/ammo/create \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{"caliber":"9mm","quantity":1000}'

# Update ammo
curl -X PATCH http://localhost:3000/users/ammo/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{"caliber":"9mm","quantity":1500}'

# Delete ammo
curl -X DELETE http://localhost:3000/users/ammo/1 \
  -H "Cookie: token=<jwt_token>"
```

## Performance Notes

- Loading state indicators appear during API calls
- Table updates complete within 1-2 seconds typically
- Large inventories (1000+ items) may take slightly longer to render
- Browser may freeze briefly if adding/updating while table is loading

## Next Steps

After mastering basic CRUD:
- View user list (Users tab)
- Manage orders and approvals (Orders tab)
- Check issuances and inventory metrics on main dashboard

