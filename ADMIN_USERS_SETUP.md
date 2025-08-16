# ระบบจัดการผู้ใช้งาน Admin - การติดตั้งและใช้งาน

## 📋 สรุปสถานะ

### ✅ Frontend (พร้อมใช้งาน)
- หน้า `AdminUsersPage.jsx` - จัดการผู้ใช้งาน
- Service `adminUsersService.js` - เชื่อมต่อ API
- Form `AdminUserForm.jsx` - เพิ่ม/แก้ไขผู้ใช้งาน

### ✅ Backend (สร้างใหม่)
- API Route `/api/admin-users` - จัดการผู้ใช้งาน
- ตาราง `admin_users` ในฐานข้อมูล
- ระบบสิทธิ์และบทบาท

## 🚀 การติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
cd backendkuntarn
npm install
```

### 2. สร้างตารางฐานข้อมูล
```bash
npm run setup-admin-users
```

### 3. รันเซิร์ฟเวอร์
```bash
npm run dev
```

## 🗄️ โครงสร้างฐานข้อมูล

### ตาราง `admin_users`
```sql
CREATE TABLE admin_users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'manager', 'user') DEFAULT 'user',
  branch_id BIGINT NULL,
  permissions JSON,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL
);
```

### ตาราง `user_sessions`
```sql
CREATE TABLE user_sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ตาราง `user_activity_logs`
```sql
CREATE TABLE user_activity_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id BIGINT,
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 ระบบสิทธิ์

### บทบาท (Roles)
1. **Super Admin** - สิทธิ์เต็มทุกอย่าง
2. **Admin** - จัดการระบบและข้อมูล
3. **Manager** - จัดการสาขาและพนักงาน
4. **User** - ใช้งานระบบพื้นฐาน

### สิทธิ์ (Permissions)
- **Dashboard**: `dashboard.view`
- **Branches**: `branches.view`, `branches.create`, `branches.edit`, `branches.delete`
- **Customers**: `customers.view`, `customers.create`, `customers.edit`, `customers.delete`
- **Products**: `products.view`, `products.create`, `products.edit`, `products.delete`
- **Contracts**: `contracts.view`, `contracts.create`, `contracts.edit`, `contracts.delete`
- **Payments**: `payments.view`, `payments.create`, `payments.edit`
- **Reports**: `reports.view`, `reports.export`
- **Settings**: `settings.view`, `settings.edit`
- **Users**: `users.view`, `users.create`, `users.edit`, `users.delete`

## 📡 API Endpoints

### ผู้ใช้งาน
- `GET /api/admin-users` - ดึงรายการผู้ใช้งานทั้งหมด
- `GET /api/admin-users/:id` - ดึงข้อมูลผู้ใช้งานตาม ID
- `POST /api/admin-users` - สร้างผู้ใช้งานใหม่
- `PUT /api/admin-users/:id` - อัปเดตข้อมูลผู้ใช้งาน
- `DELETE /api/admin-users/:id` - ลบผู้ใช้งาน

### สถานะและรหัสผ่าน
- `PATCH /api/admin-users/:id/status` - เปลี่ยนสถานะการใช้งาน
- `POST /api/admin-users/:id/reset-password` - รีเซ็ตรหัสผ่าน
- `POST /api/admin-users/:id/change-password` - เปลี่ยนรหัสผ่าน

### ข้อมูลเพิ่มเติม
- `GET /api/admin-users/permissions` - ดึงรายการสิทธิ์ที่มีอยู่
- `GET /api/admin-users/me` - ดึงข้อมูลผู้ใช้งานปัจจุบัน
- `PUT /api/admin-users/me` - อัปเดตโปรไฟล์ผู้ใช้งานปัจจุบัน

## 👥 ข้อมูลเริ่มต้น

### Super Admin
- **Username**: `admin`
- **Email**: `admin@kuntarn.com`
- **Password**: `admin123` (เปลี่ยนในระบบจริง)
- **Role**: `super_admin`
- **Permissions**: `["*"]` (สิทธิ์เต็มทุกอย่าง)

### Branch Managers
- **manager1**: สาขาหลัก
- **manager2**: สาขารามคำแหง
- **manager3**: สาขาลาดพร้าว

## 🔧 การพัฒนา

### การเพิ่มสิทธิ์ใหม่
1. เพิ่มใน `adminUsers.js` ในส่วน `permissions`
2. อัปเดต `adminUsersService.js` ในส่วน `getAvailablePermissions()`

### การเพิ่มบทบาทใหม่
1. เพิ่มใน `adminUsers.js` ในส่วน `requireRole`
2. อัปเดต `adminUsersService.js` ในส่วน `getRoles()`

### การเพิ่ม Middleware
1. สร้าง middleware ใน `adminUsers.js`
2. ใช้กับ route ที่ต้องการ

## 🚨 หมายเหตุ

### การพัฒนา
- ระบบ Authentication ยังไม่ได้ implement (ใช้ mock data)
- ระบบ Role-based Access Control ยังไม่ได้ implement
- ควรเพิ่ม JWT หรือ Session-based authentication

### ความปลอดภัย
- รหัสผ่านเริ่มต้นควรเปลี่ยนในระบบจริง
- ควรเพิ่ม rate limiting
- ควรเพิ่ม input validation
- ควรเพิ่ม audit logging

### การใช้งานจริง
- ควรเพิ่ม email verification
- ควรเพิ่ม two-factor authentication
- ควรเพิ่ม password complexity requirements
- ควรเพิ่ม account lockout after failed attempts

## 📞 การสนับสนุน

หากมีปัญหาหรือคำถาม กรุณาติดต่อทีมพัฒนา 