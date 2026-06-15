# Admin Authentication Setup

## Super Admin Create Karne Ke Steps:

### 1. Backend folder me jao:
```bash
cd backend
```

### 2. .env file me admin credentials set karo (optional):
```
ADMIN_EMAIL=admin@aarogya.com
ADMIN_PASSWORD=Admin@123
```

### 3. Super Admin create karo:
```bash
npm run create-admin
```

### 4. Server start karo:
```bash
npm run server
```

## Kaise Kaam Karta Hai:

1. **Admin Model** - Database me admin ka data save hota hai (email, hashed password)
2. **Create Admin Script** - Ek baar run karke super admin create karta hai
3. **Login Process** - Admin login karte waqt:
   - Email database me check hota hai
   - Password bcrypt se compare hota hai
   - Match hone par JWT token milta hai
   - Token se admin panel access hota hai

## Login Credentials:
- Email: admin@aarogya.com (ya jo .env me set kiya)
- Password: Admin@123 (ya jo .env me set kiya)

## Important Files:
- `models/adminModel.js` - Admin database schema
- `createAdmin.js` - Super admin create karne ka script
- `controllers/adminController.js` - Login logic (database se match)
