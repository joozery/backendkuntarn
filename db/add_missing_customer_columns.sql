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