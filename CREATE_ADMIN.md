# Create Admin User

## Quick Method - Using PowerShell

Run this command in PowerShell to create an admin user:

```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Admin User","email":"admin@foundation.org","phone":"9876543210","password":"Admin@123","role":"admin"}'
```

## Alternative Method - Using curl

If you have curl installed:

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin User\",\"email\":\"admin@foundation.org\",\"phone\":\"9876543210\",\"password\":\"Admin@123\",\"role\":\"admin\"}"
```

## Using Postman or Thunder Client

**Endpoint:** `POST http://localhost:5001/api/auth/register`

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "name": "Admin User",
  "email": "admin@foundation.org",
  "phone": "9876543210",
  "password": "Admin@123",
  "role": "admin"
}
```

## Login Credentials

After creating the admin user, login with:

- **Email:** admin@foundation.org
- **Password:** Admin@123

## Admin Capabilities

Once logged in as admin, you can:

1. **View Admin Dashboard** - Access at `/admin` route
2. **Create Programs** - Click "Create New Program" button in dashboard
3. **View All Donations** - See all donations from all users
4. **View All Donors** - Access donor information
5. **Manage Programs** - Update program details and fund allocation
6. **Track Analytics** - View total donations, amounts, and program statistics

## Security Note

⚠️ **Important:** Change the default admin password after first login in production!

The default credentials provided here are for development/testing only.
