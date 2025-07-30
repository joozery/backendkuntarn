# Collectors API Guide

## ภาพรวม

ระบบ Collectors API สำหรับจัดการพนักงานเก็บเงิน โดยมีฟีเจอร์หลักดังนี้:

- **CRUD Operations**: สร้าง, อ่าน, อัปเดต, ลบข้อมูลพนักงานเก็บเงิน
- **Performance Tracking**: ติดตามประสิทธิภาพการทำงาน
- **Search & Filter**: ค้นหาและกรองข้อมูล
- **Branch Management**: จัดการข้อมูลตามสาขา
- **Commission Calculation**: คำนวณค่าคอมมิชชัน

## โครงสร้างฐานข้อมูล

### ตาราง `collectors`

```sql
CREATE TABLE collectors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  phone VARCHAR(20),
  phone2 VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  position VARCHAR(100) DEFAULT 'พนักงานเก็บเงิน',
  hire_date DATE,
  salary DECIMAL(10,2),
  commission_rate DECIMAL(5,2) DEFAULT 0.00,
  branch_id BIGINT NOT NULL,
  assigned_areas TEXT,
  vehicle_info VARCHAR(255),
  total_collections DECIMAL(12,2) DEFAULT 0.00,
  collections_count INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  status ENUM('active', 'inactive', 'suspended', 'terminated') DEFAULT 'active',
  is_supervisor BOOLEAN DEFAULT FALSE,
  can_approve_payments BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);
```

## การติดตั้ง

### 1. สร้างตารางและข้อมูลตัวอย่าง

```bash
cd backendkuntarn
node scripts/setup_collectors.js
```

### 2. ตรวจสอบการติดตั้ง

```bash
# ตรวจสอบว่าตารางถูกสร้างแล้ว
mysql -u your_username -p your_database_name -e "DESCRIBE collectors;"

# ตรวจสอบข้อมูลตัวอย่าง
mysql -u your_username -p your_database_name -e "SELECT COUNT(*) as total FROM collectors;"
```

## API Endpoints

### GET /api/collectors
**คำอธิบาย**: ดึงข้อมูลพนักงานเก็บเงินทั้งหมด

**Query Parameters**:
- `branchId` (optional): ID ของสาขา
- `search` (optional): คำค้นหา
- `status` (optional): สถานะพนักงาน
- `page` (optional): หน้าปัจจุบัน (default: 1)
- `limit` (optional): จำนวนรายการต่อหน้า (default: 15)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "COL001",
      "name": "สมชาย",
      "surname": "ใจดี",
      "full_name": "สมชาย ใจดี",
      "nickname": "ชาย",
      "phone": "0812345678",
      "phone2": "0823456789",
      "email": "somchai@example.com",
      "address": "123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
      "position": "พนักงานเก็บเงิน",
      "hire_date": "2023-01-15",
      "salary": 15000.00,
      "commission_rate": 5.00,
      "branch_id": 1,
      "assigned_areas": "คลองเตย, พระโขนง, บางนา",
      "vehicle_info": "รถจักรยานยนต์ Honda Wave 110",
      "total_collections": 250000.00,
      "collections_count": 45,
      "success_rate": 85.50,
      "status": "active",
      "is_supervisor": false,
      "can_approve_payments": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "branch_name": "สาขาหลัก"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 5,
    "itemsPerPage": 15,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### GET /api/collectors/:id
**คำอธิบาย**: ดึงข้อมูลพนักงานเก็บเงินตาม ID

### POST /api/collectors
**คำอธิบาย**: สร้างพนักงานเก็บเงินใหม่

**Request Body**:
```json
{
  "code": "COL006",
  "name": "สมศักดิ์",
  "surname": "มั่งมี",
  "full_name": "สมศักดิ์ มั่งมี",
  "nickname": "ศักดิ์",
  "phone": "0898765432",
  "phone2": "0887654321",
  "email": "somsak@example.com",
  "address": "789 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
  "position": "พนักงานเก็บเงิน",
  "hire_date": "2024-01-01",
  "salary": 16000.00,
  "commission_rate": 6.00,
  "branch_id": 1,
  "assigned_areas": "คลองเตย, พระโขนง",
  "vehicle_info": "รถจักรยานยนต์ Yamaha Fino 125",
  "is_supervisor": false,
  "can_approve_payments": false
}
```

### PUT /api/collectors/:id
**คำอธิบาย**: อัปเดตข้อมูลพนักงานเก็บเงิน

### DELETE /api/collectors/:id
**คำอธิบาย**: ลบพนักงานเก็บเงิน

### GET /api/collectors/:id/performance
**คำอธิบาย**: ดึงสถิติประสิทธิภาพของพนักงานเก็บเงิน

**Query Parameters**:
- `startDate` (optional): วันที่เริ่มต้น (YYYY-MM-DD)
- `endDate` (optional): วันที่สิ้นสุด (YYYY-MM-DD)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "สมชาย ใจดี",
    "total_collections": 250000.00,
    "collections_count": 45,
    "success_rate": 85.50,
    "commission_rate": 5.00,
    "total_payments": 45,
    "total_amount": 250000.00,
    "avg_amount": 5555.56,
    "successful_payments": 38,
    "pending_payments": 5,
    "failed_payments": 2,
    "calculated_success_rate": 84.44,
    "commission_earned": 12500.00,
    "period": "2024-01-01 to 2024-12-31"
  }
}
```

## การใช้งานใน Frontend

### 1. Import Service

```javascript
import { collectorsService } from '@/services/collectorsService';
```

### 2. ดึงข้อมูลพนักงานเก็บเงิน

```javascript
const loadCollectors = async () => {
  try {
    const response = await collectorsService.getAll({
      branchId: selectedBranch,
      page: currentPage,
      limit: 15
    });
    
    if (response.data.success) {
      setCollectors(response.data.data);
    }
  } catch (error) {
    console.error('Error loading collectors:', error);
  }
};
```

### 3. สร้างพนักงานเก็บเงินใหม่

```javascript
const addCollector = async (collectorData) => {
  try {
    const response = await collectorsService.create({
      code: collectorData.code,
      name: collectorData.name,
      surname: collectorData.surname,
      full_name: collectorData.fullName,
      nickname: collectorData.nickname,
      phone: collectorData.phone,
      phone2: collectorData.phone2,
      email: collectorData.email,
      address: collectorData.address,
      position: collectorData.position,
      hire_date: collectorData.hireDate,
      salary: collectorData.salary,
      commission_rate: collectorData.commissionRate,
      branch_id: selectedBranch,
      assigned_areas: collectorData.assignedAreas,
      vehicle_info: collectorData.vehicleInfo,
      is_supervisor: collectorData.isSupervisor,
      can_approve_payments: collectorData.canApprovePayments
    });
    
    if (response.data.success) {
      await loadCollectors();
    }
  } catch (error) {
    console.error('Error adding collector:', error);
  }
};
```

### 4. อัปเดตพนักงานเก็บเงิน

```javascript
const updateCollector = async (id, collectorData) => {
  try {
    const response = await collectorsService.update(id, collectorData);
    
    if (response.data.success) {
      await loadCollectors();
    }
  } catch (error) {
    console.error('Error updating collector:', error);
  }
};
```

### 5. ดึงสถิติประสิทธิภาพ

```javascript
const getPerformance = async (collectorId) => {
  try {
    const response = await collectorsService.getPerformance(collectorId, {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    });
    
    if (response.data.success) {
      setPerformance(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching performance:', error);
  }
};
```

## การจัดการข้อผิดพลาด

### Validation Errors

```json
{
  "error": "Validation error",
  "message": "Code, name, full name, and branch ID are required"
}
```

### Duplicate Code Error

```json
{
  "error": "Validation error",
  "message": "Collector code already exists"
}
```

### Not Found Error

```json
{
  "error": "Collector not found"
}
```

## การทดสอบ API

### 1. ทดสอบการสร้างพนักงานเก็บเงิน

```bash
curl -X POST https://backendkuntarn-e0ddf979d118.herokuapp.com/api/collectors \
  -H "Content-Type: application/json" \
  -d '{
    "code": "COL006",
    "name": "สมศักดิ์",
    "full_name": "สมศักดิ์ มั่งมี",
    "phone": "0898765432",
    "salary": 16000.00,
    "branch_id": 1
  }'
```

### 2. ทดสอบการดึงข้อมูล

```bash
curl "https://backendkuntarn-e0ddf979d118.herokuapp.com/api/collectors?branchId=1&page=1&limit=5"
```

### 3. ทดสอบการค้นหา

```bash
curl "https://backendkuntarn-e0ddf979d118.herokuapp.com/api/collectors?search=สมชาย"
```

### 4. ทดสอบการดึงสถิติประสิทธิภาพ

```bash
curl "https://backendkuntarn-e0ddf979d118.herokuapp.com/api/collectors/1/performance?startDate=2024-01-01&endDate=2024-12-31"
```

## ฟีเจอร์พิเศษ

### 1. การคำนวณค่าคอมมิชชัน

ระบบจะคำนวณค่าคอมมิชชันอัตโนมัติตามสูตร:
```
ค่าคอมมิชชัน = ยอดรวมการเก็บเงิน × (อัตราค่าคอมมิชชัน / 100)
```

### 2. การติดตามประสิทธิภาพ

- **Success Rate**: อัตราความสำเร็จในการเก็บเงิน
- **Collections Count**: จำนวนครั้งที่ออกเก็บเงิน
- **Total Collections**: ยอดรวมการเก็บเงิน
- **Average Amount**: ยอดเฉลี่ยต่อครั้ง

### 3. การจัดการสิทธิ์

- **is_supervisor**: สิทธิ์หัวหน้าพนักงานเก็บเงิน
- **can_approve_payments**: สิทธิ์อนุมัติการชำระเงิน

## การบำรุงรักษา

### 1. การสำรองข้อมูล

```bash
mysqldump -u username -p database_name collectors > collectors_backup.sql
```

### 2. การตรวจสอบ Performance

```sql
-- ตรวจสอบ Indexes
SHOW INDEX FROM collectors;

-- ตรวจสอบ Query Performance
EXPLAIN SELECT * FROM collectors WHERE branch_id = 1;
```

### 3. การทำความสะอาดข้อมูล

```sql
-- ลบข้อมูลที่ inactive เกิน 1 ปี
DELETE FROM collectors 
WHERE status = 'inactive' 
AND updated_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

## หมายเหตุสำคัญ

1. **Code Uniqueness**: รหัสพนักงานเก็บเงินต้องไม่ซ้ำกัน
2. **Branch ID**: จำเป็นต้องระบุ branch_id ทุกครั้ง
3. **Commission Rate**: อัตราค่าคอมมิชชันเป็นเปอร์เซ็นต์ (0-100)
4. **Status**: ค่าเริ่มต้นคือ 'active'
5. **Performance Tracking**: ระบบจะติดตามประสิทธิภาพอัตโนมัติ

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **Foreign Key Constraint**: ตรวจสอบว่า branch_id มีอยู่ในตาราง branches
2. **Duplicate Code**: ตรวจสอบว่ารหัสไม่ซ้ำกัน
3. **Date Format**: ตรวจสอบรูปแบบวันที่ให้ถูกต้อง
4. **Required Fields**: ตรวจสอบว่ากรอกข้อมูลที่จำเป็นครบ

### การ Debug

```javascript
// เพิ่ม logging ใน API
console.log('Request body:', req.body);
console.log('Query params:', req.query);
console.log('SQL query:', sqlQuery);
console.log('SQL params:', params);
``` 