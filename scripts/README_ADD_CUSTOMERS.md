# คู่มือการเพิ่มข้อมูลลูกค้าใหม่

## ไฟล์ที่เกี่ยวข้อง

1. `add_new_customers.sql` - ไฟล์คำสั่ง SQL สำหรับเพิ่มข้อมูลลูกค้า 80 คน
2. `add_new_customers.js` - ไฟล์ Node.js script สำหรับรันคำสั่ง SQL

## ข้อมูลลูกค้าที่จะเพิ่ม

- **จำนวน**: 80 คน (CUST001 - CUST080)
- **สาขา**: ทั้งหมดเป็นสาขาที่ 1
- **สถานะ**: active
- **ข้อมูลที่รวม**: ชื่อ-นามสกุล, ที่อยู่, ชื่อเล่น
- **หมายเหตุ**: ไม่มีเลขบัตรประชาชนและเบอร์โทร (NULL)

## วิธีการใช้งาน

### วิธีที่ 1: ใช้ Node.js Script (แนะนำ)

```bash
# ไปที่โฟลเดอร์ backendkuntarn
cd backendkuntarn

# รัน script
node scripts/add_new_customers.js
```

### วิธีที่ 2: รัน SQL โดยตรง

```bash
# เชื่อมต่อ MySQL และรันไฟล์ SQL
mysql -u username -p database_name < scripts/add_new_customers.sql
```

## การตั้งค่าฐานข้อมูล

### ตัวแปร Environment (ถ้าใช้ Node.js script)

```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=kuntarn_db
export DB_PORT=3306
```

### หรือตั้งค่าในไฟล์ .env

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=kuntarn_db
DB_PORT=3306
```

## การตรวจสอบผลลัพธ์

หลังจากรัน script สำเร็จ คุณจะเห็น:

1. ข้อความยืนยันการเพิ่มข้อมูล
2. จำนวนลูกค้าทั้งหมด
3. ตัวอย่างข้อมูลลูกค้าที่เพิ่มล่าสุด

## การตรวจสอบในฐานข้อมูล

```sql
-- ดูจำนวนลูกค้าทั้งหมด
SELECT COUNT(*) FROM customers WHERE code LIKE 'CUST%';

-- ดูข้อมูลลูกค้าที่เพิ่ม
SELECT id, code, full_name, phone, status 
FROM customers 
WHERE code LIKE 'CUST%' 
ORDER BY id DESC;

-- ตรวจสอบข้อมูลซ้ำ
SELECT name, surname, COUNT(*) as count 
FROM customers 
GROUP BY name, surname 
HAVING count > 1;
```

## หมายเหตุสำคัญ

1. **Transaction Safety**: ใช้ START TRANSACTION และ COMMIT เพื่อความปลอดภัย
2. **Duplicate Prevention**: ข้อมูลถูกกรองเพื่อป้องกันการซ้ำ
3. **Error Handling**: มีการจัดการข้อผิดพลาดที่ครอบคลุม
4. **Backup**: แนะนำให้ backup ฐานข้อมูลก่อนรัน script
5. **Missing Data**: ข้อมูลบางส่วน (เลขบัตรประชาชน, เบอร์โทร) เป็น NULL

## การแก้ไขปัญหา

### หากเกิดข้อผิดพลาด "ER_DUP_ENTRY"
- ข้อมูลซ้ำ - ตรวจสอบข้อมูลที่มีอยู่แล้ว
- ลบข้อมูลเก่าหรือแก้ไข code ให้ไม่ซ้ำ

### หากเกิดข้อผิดพลาด "ER_NO_SUCH_TABLE"
- ไม่พบตาราง customers
- ตรวจสอบโครงสร้างฐานข้อมูล

### หากเกิดข้อผิดพลาดการเชื่อมต่อ
- ตรวจสอบการตั้งค่าฐานข้อมูล
- ตรวจสอบว่า MySQL server กำลังทำงาน

## ข้อมูลลูกค้าที่เพิ่ม

ข้อมูลลูกค้าทั้ง 80 คน ครอบคลุมพื้นที่ต่างๆ ในจังหวัดประจวบคีรีขันธ์และจังหวัดใกล้เคียง:

### จังหวัดประจวบคีรีขันธ์
- อำเภอทับสะแก
- อำเภอบางสะพาน
- อำเภอบางสะพานน้อย
- อำเภอกุยบุรี
- อำเภอเมือง
- อำเภอสามร้อยยอด

### จังหวัดใกล้เคียง
- อำเภอปะทิว จังหวัดชุมพร
- อำเภอท่าแซะ จังหวัดชุมพร

### ข้อมูลที่รวม
- ชื่อ-นามสกุลเต็ม
- ที่อยู่ละเอียด
- ชื่อเล่น (ใช้ชื่อจริงเป็นชื่อเล่น)
- รหัสลูกค้า (CUST001-CUST080)
- สถานะ active
- สาขาที่ 1

### ข้อมูลที่ไม่มี
- เลขบัตรประชาชน (NULL)
- เบอร์โทรศัพท์ (NULL)

## การจัดการข้อมูลเพิ่มเติม

หากต้องการเพิ่มข้อมูลที่ขาดหายไป (เลขบัตรประชาชน, เบอร์โทร) สามารถใช้คำสั่ง UPDATE:

```sql
-- อัปเดตเบอร์โทร
UPDATE customers 
SET phone = 'เบอร์โทรใหม่' 
WHERE code = 'CUST001';

-- อัปเดตเลขบัตรประชาชน
UPDATE customers 
SET id_card = 'เลขบัตรใหม่' 
WHERE code = 'CUST001';
``` 