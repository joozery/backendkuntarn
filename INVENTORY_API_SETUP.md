# Inventory API Setup Guide

## ภาพรวม

ระบบ Inventory API ใหม่ถูกสร้างขึ้นเพื่อจัดการข้อมูลสินค้าตามโครงสร้างตารางที่กำหนด โดยมีฟีเจอร์หลักดังนี้:

- **CRUD Operations**: สร้าง, อ่าน, อัปเดต, ลบข้อมูลสินค้า
- **Pagination**: แบ่งหน้าข้อมูล (15 รายการต่อหน้า)
- **Search & Filter**: ค้นหาและกรองข้อมูล
- **Branch Management**: จัดการข้อมูลตามสาขา

## โครงสร้างฐานข้อมูล

### ตาราง `inventory`

```sql
CREATE TABLE inventory (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sequence INT NOT NULL,
  receive_date DATE,
  product_code VARCHAR(50),
  product_name VARCHAR(500) NOT NULL,
  contract_number VARCHAR(50),
  cost_price DECIMAL(10,2),
  sell_date DATE,
  selling_cost DECIMAL(10,2),
  remaining_quantity1 INT DEFAULT 1,
  received_quantity INT DEFAULT 1,
  sold_quantity INT DEFAULT 0,
  remaining_quantity2 INT DEFAULT 1,
  remarks TEXT,
  branch_id BIGINT NOT NULL,
  status ENUM('active', 'sold', 'returned', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);
```

## การติดตั้ง

### 1. สร้างตารางและข้อมูลตัวอย่าง

```bash
cd backendkuntarn
node scripts/setup_inventory.js
```

### 2. ตรวจสอบการติดตั้ง

```bash
# ตรวจสอบว่าตารางถูกสร้างแล้ว
mysql -u your_username -p your_database_name -e "DESCRIBE inventory;"

# ตรวจสอบข้อมูลตัวอย่าง
mysql -u your_username -p your_database_name -e "SELECT COUNT(*) as total FROM inventory;"
```

## API Endpoints

### GET /api/inventory
**คำอธิบาย**: ดึงข้อมูลสินค้าทั้งหมด

**Query Parameters**:
- `branchId` (optional): ID ของสาขา
- `search` (optional): คำค้นหา
- `status` (optional): สถานะสินค้า
- `page` (optional): หน้าปัจจุบัน (default: 1)
- `limit` (optional): จำนวนรายการต่อหน้า (default: 15)

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 75,
    "itemsPerPage": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### GET /api/inventory/:id
**คำอธิบาย**: ดึงข้อมูลสินค้าตาม ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sequence": 1,
    "receive_date": "2021-08-25",
    "product_code": "R43",
    "product_name": "ตู้เย็น 5.9 คิว 2 ประตู ชาร์ป",
    "contract_number": "F5248",
    "cost_price": 1050.00,
    "sell_date": null,
    "selling_cost": null,
    "remaining_quantity1": 1,
    "received_quantity": 1,
    "sold_quantity": 0,
    "remaining_quantity2": 1,
    "remarks": "",
    "status": "active",
    "branch_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "branch_name": "สาขาหลัก"
  }
}
```

### POST /api/inventory
**คำอธิบาย**: สร้างสินค้าใหม่

**Request Body**:
```json
{
  "product_name": "ตู้เย็น 5.9 คิว 2 ประตู ชาร์ป",
  "product_code": "R43",
  "contract_number": "F5248",
  "cost_price": 1050.00,
  "receive_date": "2021-09-29",
  "remarks": "",
  "branch_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Inventory item created successfully",
  "data": {...}
}
```

### PUT /api/inventory/:id
**คำอธิบาย**: อัปเดตข้อมูลสินค้า

**Request Body**:
```json
{
  "product_name": "ตู้เย็น 5.9 คิว 2 ประตู ชาร์ป (อัปเดต)",
  "product_code": "R43",
  "contract_number": "F5248",
  "cost_price": 1200.00,
  "receive_date": "2021-09-29",
  "remarks": "อัปเดตราคา",
  "status": "active"
}
```

### DELETE /api/inventory/:id
**คำอธิบาย**: ลบสินค้า

**Response**:
```json
{
  "success": true,
  "message": "Inventory item deleted successfully"
}
```

## การใช้งานใน Frontend

### 1. Import Service

```javascript
import { inventoryService } from '@/services/inventoryService';
```

### 2. ดึงข้อมูลสินค้า

```javascript
const loadProducts = async () => {
  try {
    const response = await inventoryService.getAll({
      branchId: selectedBranch,
      page: currentPage,
      limit: 15
    });
    
    if (response.data.success) {
      setProducts(response.data.data);
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
};
```

### 3. สร้างสินค้าใหม่

```javascript
const addProduct = async (productData) => {
  try {
    const inventoryData = {
      product_name: productData.name,
      product_code: productData.code || '',
      contract_number: productData.contract || '',
      cost_price: productData.price || 0,
      receive_date: productData.receiveDate || null,
      remarks: productData.remarks || '',
      branch_id: selectedBranch
    };
    
    const response = await inventoryService.create(inventoryData);
    
    if (response.data.success) {
      // Reload products
      await loadProducts();
    }
  } catch (error) {
    console.error('Error adding product:', error);
  }
};
```

### 4. อัปเดตสินค้า

```javascript
const updateProduct = async (id, productData) => {
  try {
    const inventoryData = {
      product_name: productData.productName,
      product_code: productData.productCode,
      contract_number: productData.contract,
      cost_price: productData.costPrice,
      receive_date: productData.receiveDate,
      remarks: productData.remarks
    };
    
    const response = await inventoryService.update(id, inventoryData);
    
    if (response.data.success) {
      // Reload products
      await loadProducts();
    }
  } catch (error) {
    console.error('Error updating product:', error);
  }
};
```

### 5. ลบสินค้า

```javascript
const deleteProduct = async (id) => {
  try {
    const response = await inventoryService.delete(id);
    
    if (response.data.success) {
      // Reload products
      await loadProducts();
    }
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};
```

## การจัดการข้อผิดพลาด

### Validation Errors

```json
{
  "error": "Validation error",
  "message": "Product name and branch ID are required"
}
```

### Database Errors

```json
{
  "error": "Database error",
  "message": "Duplicate entry for key 'PRIMARY'"
}
```

### Not Found Errors

```json
{
  "error": "Inventory item not found"
}
```

## การทดสอบ API

### 1. ทดสอบการสร้างสินค้า

```bash
curl -X POST http://localhost:3001/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "เครื่องซักผ้า 11 กิโล LG",
    "product_code": "LG001",
    "cost_price": 15000.00,
    "branch_id": 1
  }'
```

### 2. ทดสอบการดึงข้อมูล

```bash
curl "http://localhost:3001/api/inventory?branchId=1&page=1&limit=5"
```

### 3. ทดสอบการค้นหา

```bash
curl "http://localhost:3001/api/inventory?search=เครื่องซักผ้า"
```

## การบำรุงรักษา

### 1. การสำรองข้อมูล

```bash
mysqldump -u username -p database_name inventory > inventory_backup.sql
```

### 2. การตรวจสอบ Performance

```sql
-- ตรวจสอบ Indexes
SHOW INDEX FROM inventory;

-- ตรวจสอบ Query Performance
EXPLAIN SELECT * FROM inventory WHERE branch_id = 1;
```

### 3. การทำความสะอาดข้อมูล

```sql
-- ลบข้อมูลที่ inactive เกิน 1 ปี
DELETE FROM inventory 
WHERE status = 'inactive' 
AND updated_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

## หมายเหตุสำคัญ

1. **Sequence Number**: ระบบจะสร้าง sequence number อัตโนมัติหากไม่ระบุ
2. **Branch ID**: จำเป็นต้องระบุ branch_id ทุกครั้ง
3. **Date Format**: ใช้รูปแบบ YYYY-MM-DD สำหรับวันที่
4. **Price Format**: ใช้ตัวเลขทศนิยมสำหรับราคา
5. **Status**: ค่าเริ่มต้นคือ 'active'

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **Foreign Key Constraint**: ตรวจสอบว่า branch_id มีอยู่ในตาราง branches
2. **Date Format**: ตรวจสอบรูปแบบวันที่ให้ถูกต้อง
3. **Price Format**: ตรวจสอบว่าราคาเป็นตัวเลข
4. **Required Fields**: ตรวจสอบว่ากรอกข้อมูลที่จำเป็นครบ

### การ Debug

```javascript
// เพิ่ม logging ใน API
console.log('Request body:', req.body);
console.log('Query params:', req.query);
console.log('SQL query:', sqlQuery);
console.log('SQL params:', params);
``` 