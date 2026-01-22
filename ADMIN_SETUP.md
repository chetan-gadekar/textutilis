# How to Create Admin Account

## Method 1: Using Seed Script (Recommended)

Run the seed script to create a default admin account:

```bash
cd backend
npm run seed:admin
```

This will create an admin account with:
- **Email**: `admin@lms.com`
- **Password**: `admin123`

**⚠️ Important**: Change the password immediately after first login!

## Method 2: Via Registration API

You can register an admin account using the registration endpoint:

```bash
POST http://localhost:5002/api/auth/register
Content-Type: application/json

{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "your_secure_password",
  "role": "admin"
}
```

**Note**: This only works if there's no validation preventing admin registration. If restricted, use Method 1 or Method 3.

## Method 3: Direct Database Insert

If you have MongoDB access:

1. Connect to your MongoDB database
2. Insert admin user directly:

```javascript
// Using MongoDB shell or Compass
db.users.insertOne({
  name: "Admin User",
  email: "admin@lms.com",
  password: "$2a$12$HASHED_PASSWORD", // Use bcrypt to hash your password
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use Node.js script:

```javascript
const mongoose = require('mongoose');
const User = require('./schemas/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@lms.com',
    password: 'your_password',
    role: 'admin',
    isActive: true,
  });
  console.log('Admin created:', admin);
  process.exit(0);
});
```

## Method 4: Via Frontend Registration

If admin role is available in registration form:

1. Navigate to `/register`
2. Fill in the form
3. Select role as "Admin" (if available)
4. Register

## Verification

After creating the admin account:

1. Login at `/login` with the admin credentials
2. You should be redirected to `/dashboard`
3. You should see admin-specific features:
   - Student Management
   - Faculty Management
   - Teaching Points View

## Troubleshooting

### "Admin account already exists"
- The email `admin@lms.com` is already in the database
- Either use that account or delete it first

### "Cannot register with admin role"
- The registration endpoint may restrict admin role creation
- Use Method 1 (seed script) or Method 3 (direct database)

### "Invalid credentials"
- Double-check email and password
- Ensure account is active (`isActive: true`)
- Check if password was hashed correctly (for Method 3)
