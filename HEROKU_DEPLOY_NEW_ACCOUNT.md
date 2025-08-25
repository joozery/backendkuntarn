# คู่มือการ Deploy Backend ใหม่ขึ้น Heroku ในอีก Account

## ขั้นตอนที่ 1: เตรียม Heroku Account ใหม่

### 1.1 สร้าง Heroku Account ใหม่
```bash
# ไปที่ https://signup.heroku.com/
# สร้าง account ใหม่
# ยืนยัน email
```

### 1.2 ติดตั้ง Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# หรือดาวน์โหลดจาก https://devcenter.heroku.com/articles/heroku-cli
```

### 1.3 Login เข้า Heroku Account ใหม่
```bash
heroku login
# ใส่ credentials ของ account ใหม่
```

## ขั้นตอนที่ 2: เตรียม Database ใหม่

### 2.1 สร้าง Database ใหม่
```bash
# ใช้ ClearDB MySQL Add-on (ฟรี tier)
heroku addons:create cleardb:ignite --app your-new-app-name

# หรือใช้ JawsDB MySQL Add-on
heroku addons:create jawsdb:mysql --app your-new-app-name
```

### 2.2 ดู Database URL
```bash
heroku config:get CLEARDB_DATABASE_URL
# หรือ
heroku config:get JAWSDB_URL
```

### 2.3 แปลง Database URL เป็น Environment Variables
```bash
# ตัวอย่าง URL: mysql://username:password@host:port/database
# แยกเป็น:
DB_HOST=host
DB_USER=username
DB_PASSWORD=password
DB_NAME=database
DB_PORT=port
```

## ขั้นตอนที่ 3: สร้าง Heroku App ใหม่

### 3.1 สร้าง App
```bash
cd backendkuntarn
heroku create your-new-app-name
```

### 3.2 ตั้งค่า Environment Variables
```bash
# ตั้งค่า Database
heroku config:set DB_HOST=your_new_host
heroku config:set DB_USER=your_new_user
heroku config:set DB_PASSWORD=your_new_password
heroku config:set DB_NAME=your_new_database
heroku config:set DB_PORT=3306

# ตั้งค่า JWT Secret ใหม่
heroku config:set JWT_SECRET=your_new_jwt_secret_key_here

# ตั้งค่า Environment
heroku config:set NODE_ENV=production

# ตั้งค่า CORS (ถ้าจำเป็น)
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
```

## ขั้นตอนที่ 4: Deploy Code

### 4.1 เพิ่ม Remote Git
```bash
# เพิ่ม Heroku remote
heroku git:remote -a your-new-app-name

# ดู remotes ทั้งหมด
git remote -v
```

### 4.2 Deploy
```bash
# Commit changes (ถ้ามี)
git add .
git commit -m "Prepare for new Heroku deployment"

# Push to Heroku
git push heroku main
# หรือ
git push heroku master
```

## ขั้นตอนที่ 5: ตั้งค่า Database

### 5.1 รัน Database Setup Scripts
```bash
# รัน setup database
heroku run npm run setup-db

# รัน setup admin users
heroku run npm run setup-admin-users
```

### 5.2 ตรวจสอบ Database
```bash
# เปิด Heroku console
heroku run node

# ใน console:
require('./db/db.js')
# ตรวจสอบการเชื่อมต่อ
```

## ขั้นตอนที่ 6: ตรวจสอบ Deployment

### 6.1 ดู Logs
```bash
heroku logs --tail
```

### 6.2 ทดสอบ API
```bash
# ทดสอบ health check
curl https://your-new-app-name.herokuapp.com/api/health

# ทดสอบ auth endpoint
curl https://your-new-app-name.herokuapp.com/api/auth/login
```

## ขั้นตอนที่ 7: ตั้งค่า Domain (ถ้าจำเป็น)

### 7.1 เพิ่ม Custom Domain
```bash
heroku domains:add your-domain.com
```

### 7.2 ตั้งค่า DNS
```
# เพิ่ม CNAME record:
your-domain.com CNAME your-new-app-name.herokuapp.com
```

## ข้อควรระวัง

### 1. Database
- ต้องใช้ database ใหม่ ไม่ใช่ database เดิม
- เปลี่ยน credentials ทั้งหมด
- เปลี่ยน JWT secret

### 2. Environment Variables
- ตรวจสอบว่าไม่มีการ hardcode credentials ใน code
- ใช้ Heroku config vars ทั้งหมด

### 3. CORS
- ตั้งค่า CORS ให้ตรงกับ frontend domain ใหม่
- ตรวจสอบว่า frontend สามารถเรียก API ได้

### 4. Security
- เปลี่ยน JWT secret ทุกครั้ง
- ใช้ HTTPS เท่านั้น
- ตั้งค่า security headers

## การแก้ไขปัญหา

### 1. Build Error
```bash
# ดู build logs
heroku logs --tail

# ตรวจสอบ package.json
# ตรวจสอบ Node.js version
```

### 2. Database Connection Error
```bash
# ตรวจสอบ environment variables
heroku config

# ทดสอบ connection
heroku run node -e "require('./db/db.js')"
```

### 3. CORS Error
```bash
# ตรวจสอบ CORS_ORIGIN
heroku config:get CORS_ORIGIN

# ตั้งค่าใหม่
heroku config:set CORS_ORIGIN=https://your-frontend.com
```

## คำสั่งที่มีประโยชน์

```bash
# ดู app info
heroku info

# ดู environment variables
heroku config

# ดู add-ons
heroku addons

# ดู logs
heroku logs --tail

# เปิด app ใน browser
heroku open

# รัน command ใน Heroku
heroku run node script.js

# ดู database
heroku addons:open cleardb
# หรือ
heroku addons:open jawsdb
```
