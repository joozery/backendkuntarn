-- Fix customers table schema
-- Run this script to ensure all required columns exist

-- Check current table structure
DESCRIBE customers;

-- Add missing columns if they don't exist
-- Add title column
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS title VARCHAR(10) DEFAULT 'นาย' 
AFTER code;

-- Add age column
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS age INT 
AFTER nickname;

-- Add address detail columns
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS moo VARCHAR(50) 
AFTER address;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS road VARCHAR(255) 
AFTER moo;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS subdistrict VARCHAR(255) 
AFTER road;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS district VARCHAR(255) 
AFTER subdistrict;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS province VARCHAR(255) 
AFTER district;

-- Add phone columns
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS phone1 VARCHAR(20) 
AFTER province;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS phone2 VARCHAR(20) 
AFTER phone1;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS phone3 VARCHAR(20) 
AFTER phone2;

-- Update existing data
-- Copy existing phone to phone1 if phone1 is empty
UPDATE customers 
SET phone1 = phone 
WHERE (phone1 IS NULL OR phone1 = '') AND phone IS NOT NULL AND phone != '';

-- Set default title for existing customers
UPDATE customers 
SET title = 'นาย' 
WHERE title IS NULL OR title = '';

-- Show final table structure
DESCRIBE customers;

-- Show sample data
SELECT 
  id, code, title, name, surname, full_name, nickname, age, id_card, 
  address, moo, road, subdistrict, district, province,
  phone1, phone2, phone3, email,
  guarantor_name, guarantor_id_card, guarantor_nickname, guarantor_phone, guarantor_address,
  status, branch_id, checker_id
FROM customers 
LIMIT 3; 