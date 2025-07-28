# Installment Management System Backend API

Backend API สำหรับระบบจัดการสัญญาผ่อนชำระพร้อมระบบเช็คเกอร์

## 🚀 Features

- **จัดการเช็คเกอร์** - เพิ่ม/แก้ไข/ลบ/ค้นหาผู้ตรวจสอบ
- **จัดการลูกค้า** - ข้อมูลลูกค้าและสัญญาผ่อนชำระ
- **จัดการแผนการผ่อน** - สัญญาผ่อนชำระและตารางชำระเงิน
- **ระบบเก็บเงิน** - บันทึกการเก็บเงินจากเช็คเกอร์
- **รายงาน** - สร้างรายงานการเก็บเงินรายเดือน

## 📋 Prerequisites

- Node.js >= 14.0.0
- MySQL >= 8.0
- npm หรือ yarn

## 🛠️ Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd backendkuntarn
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp env.example .env
# แก้ไขไฟล์ .env ตามการตั้งค่าฐานข้อมูลของคุณ
```

4. **Setup database**
```bash
# สร้างฐานข้อมูล MySQL
mysql -u root -p
CREATE DATABASE installment_db;
USE installment_db;

# รัน SQL schema
mysql -u root -p installment_db < db/schema.sql
```

5. **Start server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Health Check
- `GET /api/health` - ตรวจสอบสถานะ API

### Checkers (เช็คเกอร์)
- `GET /api/checkers` - ดึงรายการเช็คเกอร์ทั้งหมด
- `GET /api/checkers/:id` - ดึงข้อมูลเช็คเกอร์ตาม ID
- `POST /api/checkers` - เพิ่มเช็คเกอร์ใหม่
- `PUT /api/checkers/:id` - แก้ไขข้อมูลเช็คเกอร์
- `DELETE /api/checkers/:id` - ลบเช็คเกอร์
- `GET /api/checkers/:id/collections` - ดึงประวัติการเก็บเงินของเช็คเกอร์
- `POST /api/checkers/:id/collections` - บันทึกการเก็บเงินใหม่
- `GET /api/checkers/:id/reports` - ดึงรายงานการเก็บเงินรายเดือน

### Customers (ลูกค้า)
- `GET /api/customers` - ดึงรายการลูกค้าทั้งหมด
- `GET /api/customers/:id` - ดึงข้อมูลลูกค้าตาม ID
- `GET /api/customers/:id/installments` - ดึงสัญญาผ่อนชำระของลูกค้า

### Installments (แผนการผ่อน)
- `GET /api/installments` - ดึงรายการสัญญาผ่อนชำระทั้งหมด
- `GET /api/installments/:id` - ดึงข้อมูลสัญญาผ่อนชำระตาม ID
- `GET /api/installments/:id/payments` - ดึงตารางชำระเงินของสัญญา
- `GET /api/installments/:id/collections` - ดึงประวัติการเก็บเงินของสัญญา
- `PUT /api/installments/:id` - อัปเดตสถานะสัญญาผ่อนชำระ

## 📊 Database Schema

### Tables
- `branches` - ข้อมูลสาขา
- `checkers` - ข้อมูลเช็คเกอร์
- `customers` - ข้อมูลลูกค้า
- `products` - ข้อมูลสินค้า
- `installments` - สัญญาผ่อนชำระ
- `payments` - ตารางชำระเงิน (ตามกำหนด)
- `payment_collections` - การเก็บเงินจริง (โดยเช็คเกอร์)

## 🔧 Configuration

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=installment_db
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=development
```

## 📝 API Examples

### เพิ่มเช็คเกอร์ใหม่
```bash
curl -X POST http://localhost:5000/api/checkers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "สมชาย",
    "surname": "ใจดี",
    "fullName": "สมชาย ใจดี",
    "phone": "081-123-4567",
    "email": "somchai@example.com",
    "branchId": 1
  }'
```

### บันทึกการเก็บเงิน
```bash
curl -X POST http://localhost:5000/api/checkers/1/collections \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "installmentId": 1,
    "amount": 2500.00,
    "paymentDate": "2024-01-01",
    "notes": "เก็บเงินงวดที่ 1"
  }'
```

### ดึงรายงานการเก็บเงิน
```bash
curl "http://localhost:5000/api/checkers/1/reports?month=1&year=2024"
```

## 🚨 Error Handling

API จะส่งคืน error response ในรูปแบบ:
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## 🔒 Security

- CORS enabled สำหรับ frontend
- Input validation สำหรับทุก endpoints
- SQL injection protection ด้วย parameterized queries

## 📈 Performance

- Database indexes สำหรับ queries ที่ใช้บ่อย
- Connection pooling สำหรับ MySQL
- Efficient JOIN queries

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Author

wooyou creative

## 📞 Support

หากมีปัญหาหรือคำถาม กรุณาติดต่อทีมพัฒนา 