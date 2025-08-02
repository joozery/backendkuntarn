-- Fix phone data issue in customers table
-- This script ensures phone data is properly migrated and accessible

-- Start transaction for safety
START TRANSACTION;

-- 1. Check if phone columns exist, if not add them
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS phone1 VARCHAR(20) 
AFTER province;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS phone2 VARCHAR(20) 
AFTER phone1;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS phone3 VARCHAR(20) 
AFTER phone2;

-- 2. Copy existing phone data to phone1 if phone1 is empty
UPDATE customers 
SET phone1 = phone 
WHERE (phone1 IS NULL OR phone1 = '') AND phone IS NOT NULL AND phone != '';

-- 3. Show current phone data status
SELECT 
  'Phone Data Status' as info,
  COUNT(*) as total_customers,
  SUM(CASE WHEN phone1 IS NOT NULL AND phone1 != '' THEN 1 ELSE 0 END) as with_phone1,
  SUM(CASE WHEN phone2 IS NOT NULL AND phone2 != '' THEN 1 ELSE 0 END) as with_phone2,
  SUM(CASE WHEN phone3 IS NOT NULL AND phone3 != '' THEN 1 ELSE 0 END) as with_phone3,
  SUM(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) as with_old_phone
FROM customers;

-- 4. Show sample customers with phone data
SELECT 
  id, code, name, surname, 
  phone1, phone2, phone3, phone,
  CASE 
    WHEN phone1 IS NOT NULL AND phone1 != '' THEN phone1
    WHEN phone2 IS NOT NULL AND phone2 != '' THEN phone2
    WHEN phone3 IS NOT NULL AND phone3 != '' THEN phone3
    WHEN phone IS NOT NULL AND phone != '' THEN phone
    ELSE 'ไม่มีเบอร์โทร'
  END as primary_phone
FROM customers 
ORDER BY id 
LIMIT 10;

-- 5. Show customers without any phone data
SELECT 
  id, code, name, surname,
  'ไม่มีเบอร์โทร' as phone_status
FROM customers 
WHERE (phone1 IS NULL OR phone1 = '') 
  AND (phone2 IS NULL OR phone2 = '') 
  AND (phone3 IS NULL OR phone3 = '')
  AND (phone IS NULL OR phone = '')
ORDER BY id 
LIMIT 10;

-- Commit the changes
COMMIT;

-- Show final table structure
DESCRIBE customers; 