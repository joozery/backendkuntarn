-- เพิ่มฟิลด์ cost_price ในตาราง installments
-- เพื่อเก็บราคาต้นทุนของสินค้า

-- 1. เพิ่มฟิลด์ cost_price
ALTER TABLE installments 
ADD COLUMN cost_price DECIMAL(10,2) DEFAULT 0 AFTER product_serial_number;

-- 2. อัปเดตข้อมูลเดิมให้มีค่าเริ่มต้น
UPDATE installments 
SET cost_price = 0 
WHERE cost_price IS NULL;

-- 3. ตรวจสอบผลลัพธ์
SELECT id, product_name, cost_price, total_amount 
FROM installments 
LIMIT 5;

-- 4. แสดงโครงสร้างตาราง
DESCRIBE installments; 