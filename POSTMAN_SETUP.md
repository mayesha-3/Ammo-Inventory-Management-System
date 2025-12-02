# Postman Setup Guide for Ammo Backend

## Key Issues Fixed

1. **Signup was failing (500)** ✅
   - **Root Cause**: The database schema requires `pinNo` (PIN number) as a NOT NULL UNIQUE field, but the signup endpoint wasn't including it in the request.
   - **Fix**: Updated signup schema to require `pinNo` field.

2. **Login was returning 401** ✅
   - Will work once signup succeeds and creates a user with valid credentials.

3. **Cookies not being set** ✅
   - Cookies are configured correctly (`httpOnly: true`, `sameSite: "Lax"`, `path: "/"`)
   - Postman needs to be configured to accept cookies.

---

## Postman Configuration Steps

### 1. Enable Cookie Jar in Postman
- Click **Settings** (gear icon) → **Cookies** → **Create New**
- OR use the **Cookies** button in the bottom tab bar
- Ensure cookies are enabled for `localhost:3000`

### 2. Signup Request
**Method**: `POST`  
**URL**: `http://localhost:3000/auth/signup`  
**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "email": "john@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "pinNo": "1234567890"
}
```

**Expected Response** (200):
```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "message": "User created successfully"
}
```

**Note**: The response will NOT include the token in the body—it's stored in an HTTP-only cookie automatically by Postman.

---

### 3. Verify Cookie Was Set
After signup:
1. Go to **Cookies** tab in Postman
2. Look for `auth_token` cookie for `localhost:3000`
3. You should see a long JWT token

---

### 4. Login Request
**Method**: `POST`  
**URL**: `http://localhost:3000/auth/login`  
**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Login successful"
}
```

---

### 5. Get Current User (Authenticated Request)
**Method**: `GET`  
**URL**: `http://localhost:3000/users/me`  
**Headers**:
```
Content-Type: application/json
```

**Expected Response** (200):
```json
{
  "id": 1,
  "email": "john@example.com",
  "name": "John Doe",
  "role": "user",
  "pinNo": "1234567890",
  "createdAt": "2025-12-01T12:00:00.000Z"
}
```

---

### 6. Get All Users (Admin/Moderator Only)
**Method**: `GET`  
**URL**: `http://localhost:3000/users/allusers?page=1&limit=10`  
**Headers**:
```
Content-Type: application/json
```

**Expected Response** (200):
```json
{
  "users": [
    {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user",
      "pinNo": "1234567890",
      "createdAt": "2025-12-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

**Note**: Only works if the authenticated user has `admin` or `moderator` role.

---

## Troubleshooting

### "Invalid email or password" on Login
- ✅ Verify signup succeeded first
- ✅ Check that you're using the same email/password as signup
- ✅ Ensure the email exists in the database

### "Unauthorized" on `/users/me`
- ✅ Check that the `auth_token` cookie is present
- ✅ Go to Postman Settings → Cookies → verify `auth_token` for `localhost:3000`
- ✅ Try signing up and logging in again

### Cookie Not Appearing
- ✅ Open Postman **Cookies** panel (bottom tab bar)
- ✅ Create a cookie jar for `localhost:3000`
- ✅ Restart Postman if needed

### "User with this email already exists"
- Use a different email address for each signup test
- Or delete the user from the database and try again

---

## Database Notes

The `pinNo` field is:
- **NOT NULL** - must be provided
- **UNIQUE** - each user must have a different PIN
- Max 10 characters

---

## Environment Variables

Ensure your `.env` file has:
```
DATABASE_URL=your_database_url
NODE_ENV=development
JWT_SECRET=your_secret_key
```

For development, `NODE_ENV=development` ensures `secure: false` on cookies (allows localhost).

