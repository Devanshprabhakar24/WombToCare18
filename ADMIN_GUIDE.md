# Admin User Guide

## ✅ Admin Functionality Fixed

The admin system is now fully functional with the following features:

### 1. Admin Dashboard Features

- **Analytics Overview**
  - Total donations count
  - Total amount received
  - Active programs count
  - Total programs count

- **Recent Donations Table**
  - View all donations from all users
  - See donor names, programs, amounts, and status
  - Sortable and filterable

- **Programs Management**
  - View all programs with fund utilization
  - Create new programs directly from dashboard
  - Track funds received vs utilized
  - Monitor utilization rates

### 2. Create Admin User

Run this PowerShell command to create an admin user:

```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Admin User","email":"admin@foundation.org","phone":"9876543210","password":"Admin@123","role":"admin"}'
```

**Login Credentials:**

- Email: admin@foundation.org
- Password: Admin@123

### 3. Access Admin Dashboard

1. Login with admin credentials
2. Click "Dashboard" in the header (automatically routes to /admin for admin users)
3. You'll see the admin dashboard with full analytics

### 4. Create Programs

From the Admin Dashboard:

1. Click "Create New Program" button
2. Fill in the form:
   - Program Name (e.g., "Education for All")
   - Target Amount (e.g., 100000)
   - Start Date
   - End Date
   - Description
3. Click "Create Program"
4. Program will appear in the programs list

### 5. Admin API Endpoints

All admin endpoints require authentication with admin role:

**Dashboard Analytics:**

```
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

**All Donations:**

```
GET /api/admin/donations
Authorization: Bearer <admin_token>
Query params: programId, status, startDate, endDate
```

**All Donors:**

```
GET /api/admin/donors
Authorization: Bearer <admin_token>
```

**Create Program:**

```
POST /api/programs
Authorization: Bearer <admin_token>
Body: {
  "programName": "Program Name",
  "description": "Description",
  "targetAmount": 100000,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Update Program:**

```
PUT /api/programs/:id
Authorization: Bearer <admin_token>
```

**Update Program Funds:**

```
PUT /api/programs/:id/funds
Authorization: Bearer <admin_token>
Body: {
  "fundsReceived": 50000,
  "fundsUtilized": 30000
}
```

**Archive Program:**

```
DELETE /api/programs/:id
Authorization: Bearer <admin_token>
```

### 6. Admin vs Donor Differences

| Feature               | Donor      | Admin  |
| --------------------- | ---------- | ------ |
| Dashboard Route       | /dashboard | /admin |
| View Own Donations    | ✅         | ✅     |
| View All Donations    | ❌         | ✅     |
| View All Donors       | ❌         | ✅     |
| Create Programs       | ❌         | ✅     |
| Update Programs       | ❌         | ✅     |
| Delete Programs       | ❌         | ✅     |
| View Analytics        | Limited    | Full   |
| Make Donations        | ✅         | ✅     |
| Download Certificates | ✅         | ✅     |

### 7. Security Features

- **Role-Based Access Control (RBAC)**
  - Middleware checks user role on protected routes
  - Admin-only routes return 403 for non-admin users

- **JWT Authentication**
  - All admin endpoints require valid JWT token
  - Token includes user role for authorization

- **Protected Routes**
  - Frontend ProtectedRoute component checks user role
  - Redirects non-admin users trying to access /admin

### 8. Testing Admin Functionality

1. **Create Admin User** (see command above)
2. **Login as Admin** at http://localhost:5173/login
3. **Access Dashboard** - Should redirect to /admin
4. **Create a Program**:
   - Click "Create New Program"
   - Fill form and submit
   - Verify program appears in list
5. **View Analytics** - Check stats cards update
6. **View Donations** - Should see all donations (if any exist)

### 9. Common Issues & Solutions

**Issue: Can't access /admin route**

- Solution: Ensure you're logged in with admin role
- Check browser console for errors
- Verify token is valid

**Issue: "You do not have permission" error**

- Solution: User role is not 'admin'
- Create new admin user or update existing user role in database

**Issue: Programs not showing**

- Solution: Create programs using the form
- Check MongoDB connection
- Verify API endpoint is working

**Issue: Can't create programs**

- Solution: Ensure you're logged in as admin
- Check network tab for API errors
- Verify backend is running

### 10. Database Direct Access (Optional)

If you need to manually update a user to admin role:

```javascript
// Using MongoDB Compass or mongo shell
db.users.updateOne({ email: "user@example.com" }, { $set: { role: "admin" } });
```

### 11. Production Considerations

Before deploying to production:

1. **Change Default Admin Password**
   - Don't use Admin@123 in production
   - Use strong, unique passwords

2. **Secure Admin Registration**
   - Consider removing role parameter from public registration
   - Create admin users through secure backend script

3. **Add Admin User Management**
   - Create interface to manage admin users
   - Implement admin user approval workflow

4. **Audit Logging**
   - Log all admin actions
   - Track program creation/updates
   - Monitor fund allocation changes

5. **Two-Factor Authentication**
   - Add 2FA for admin accounts
   - Require additional verification for sensitive actions

---

## 🎉 Admin System Ready!

Your admin system is fully functional and ready to use. Create an admin user and start managing your nonprofit foundation!
