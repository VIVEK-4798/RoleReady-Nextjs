# Scripts

This folder contains utility scripts for RoleReady.

## create-admin.ts

Creates an admin account in the database.

### Usage

```bash
npm run create-admin
```

You'll be prompted to enter:
- Admin Name
- Admin Email
- Password (min 6 characters)
- Confirm Password
- Mobile Number (optional)

The script will:
1. Connect to MongoDB
2. Validate the email format
3. Check if a user with that email already exists
4. Hash the password using bcrypt
5. Create the admin account

### Important Notes

- **Security**: This script should only be run locally by authorized personnel
- **Admin Role**: Admin accounts cannot be created through the normal signup flow
- **One-Time Setup**: Typically run once during initial setup, or when adding new admins
- **Email Uniqueness**: Each email can only be used once across all user roles

### Example

```
$ npm run create-admin

🔧 RoleReady Admin Account Creator

This script will create a new admin account.

📡 Connecting to MongoDB...
✅ Connected to MongoDB

Admin Name: John Admin
Admin Email: admin@roleready.com
Admin Password (min 6 characters): ******
Confirm Password: ******
Mobile Number (optional, press Enter to skip): +91 98765 43210

📋 Admin Account Details:
   Name:  John Admin
   Email: admin@roleready.com
   Role:  admin
   Mobile: +91 98765 43210

Create this admin account? (yes/no): yes

🔐 Hashing password...
👤 Creating admin account...

✅ Admin account created successfully!

📧 Login Credentials:
   Email: admin@roleready.com
   Password: [the password you entered]

🚀 You can now login at: http://localhost:3000/login
```

## Prerequisites

- MongoDB connection string in `.env.local` (MONGODB_URI)
- Next.js development environment set up
- Node.js and npm installed

## Troubleshooting

### "MONGODB_URI not found"
Ensure your `.env.local` file exists and contains a valid MONGODB_URI.

### "User with email already exists"
This email is already registered. Use a different email or update the existing user's role directly in MongoDB.

### "Invalid email format"
Make sure the email follows the format: `user@domain.com`

### Connection errors
- Check your MongoDB connection string
- Verify MongoDB Atlas is accessible
- Ensure your IP is whitelisted in MongoDB Atlas
