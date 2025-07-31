-- เพิ่มคอลัมน์ shop_name ในตาราง inventory
-- รันคำสั่งนี้ใน MySQL เพื่อเพิ่มคอลัมน์ร้านค้า

-- 1. เพิ่มคอลัมน์ shop_name
ALTER TABLE inventory 
ADD COLUMN shop_name VARCHAR(255) AFTER product_name;

-- 2. เพิ่ม index สำหรับการค้นหา
CREATE INDEX idx_inventory_shop_name ON inventory(shop_name);

-- 3. อัปเดตข้อมูลเดิมให้มีค่าเริ่มต้น
UPDATE inventory 
SET shop_name = 'ไม่ระบุ' 
WHERE shop_name IS NULL;

-- 4. ตรวจสอบผลลัพธ์
SELECT id, product_name, shop_name, cost_price 
FROM inventory 
LIMIT 5;

-- 5. แสดงโครงสร้างตาราง
DESCRIBE inventory; 