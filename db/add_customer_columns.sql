-- =====================================================
-- SQL Script to add new columns to customers table
-- Run each command separately for safety
-- =====================================================

-- 1. Add title column (คำนำหน้าชื่อ)
ALTER TABLE customers 
ADD COLUMN title VARCHAR(10) DEFAULT 'นาย' 
AFTER code;

-- 2. Add age column (อายุ)
ALTER TABLE customers 
ADD COLUMN age INT 
AFTER nickname;

-- 3. Add moo column (หมู่ที่)
ALTER TABLE customers 
ADD COLUMN moo VARCHAR(50) 
AFTER address;

-- 4. Add road column (ถนน)
ALTER TABLE customers 
ADD COLUMN road VARCHAR(255) 
AFTER moo;

-- 5. Add subdistrict column (ตำบล/แขวง)
ALTER TABLE customers 
ADD COLUMN subdistrict VARCHAR(255) 
AFTER road;

-- 6. Add district column (อำเภอ/เขต)
ALTER TABLE customers 
ADD COLUMN district VARCHAR(255) 
AFTER subdistrict;

-- 7. Add province column (จังหวัด)
ALTER TABLE customers 
ADD COLUMN province VARCHAR(255) 
AFTER district;

-- 8. Add phone1 column (โทรศัพท์ 1)
ALTER TABLE customers 
ADD COLUMN phone1 VARCHAR(20) 
AFTER province;

-- 9. Add phone2 column (โทรศัพท์ 2)
ALTER TABLE customers 
ADD COLUMN phone2 VARCHAR(20) 
AFTER phone1;

-- 10. Add phone3 column (โทรศัพท์ 3)
ALTER TABLE customers 
ADD COLUMN phone3 VARCHAR(20) 
AFTER phone2;

-- =====================================================
-- Update existing data
-- =====================================================

-- Copy existing phone to phone1
UPDATE customers 
SET phone1 = phone 
WHERE phone1 IS NULL AND phone IS NOT NULL;

-- Set default title for existing customers
UPDATE customers 
SET title = 'นาย' 
WHERE title IS NULL;

-- =====================================================
-- Add indexes for better performance
-- =====================================================

-- Index for phone1 searches
CREATE INDEX idx_customers_phone1 ON customers(phone1);

-- Index for title searches
CREATE INDEX idx_customers_title ON customers(title);

-- Index for age searches
CREATE INDEX idx_customers_age ON customers(age);

-- =====================================================
-- Verify the changes
-- =====================================================

-- Show the updated table structure
DESCRIBE customers;

-- Show sample data with new columns
SELECT 
  id, code, title, name, surname, nickname, age, 
  phone1, phone2, phone3, 
  address, moo, road, subdistrict, district, province
FROM customers 
LIMIT 5; 

-- Add missing customer columns to installments table
-- Run this script to add customer_id_card and customer_nickname columns

-- Add customer_id_card column
ALTER TABLE installments 
ADD COLUMN customer_id_card VARCHAR(20) AFTER customer_email;

-- Add customer_nickname column  
ALTER TABLE installments 
ADD COLUMN customer_nickname VARCHAR(50) AFTER customer_id_card;

-- Add customer_name and customer_surname columns (if not exists)
ALTER TABLE installments 
ADD COLUMN customer_name VARCHAR(100) AFTER customer_id_card;

ALTER TABLE installments 
ADD COLUMN customer_surname VARCHAR(100) AFTER customer_name;

-- Show updated table structure
DESCRIBE installments;

-- Show sample data to verify
SELECT 
  id,
  contract_number,
  customer_name,
  customer_surname,
  customer_nickname,
  customer_id_card,
  guarantor_name,
  guarantor_surname,
  guarantor_nickname,
  guarantor_id_card
FROM installments 
LIMIT 5; 