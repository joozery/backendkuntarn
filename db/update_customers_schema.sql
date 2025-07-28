-- SQL Script to add new columns to customers table
-- Run this script to update the customers table schema

-- Add title column for name prefix (นาย, นาง, นางสาว)
ALTER TABLE customers 
ADD COLUMN title VARCHAR(10) DEFAULT 'นาย' 
AFTER code;

-- Add age column
ALTER TABLE customers 
ADD COLUMN age INT 
AFTER nickname;

-- Add address detail columns
ALTER TABLE customers 
ADD COLUMN moo VARCHAR(50) 
AFTER address;

ALTER TABLE customers 
ADD COLUMN road VARCHAR(255) 
AFTER moo;

ALTER TABLE customers 
ADD COLUMN subdistrict VARCHAR(255) 
AFTER road;

ALTER TABLE customers 
ADD COLUMN district VARCHAR(255) 
AFTER subdistrict;

ALTER TABLE customers 
ADD COLUMN province VARCHAR(255) 
AFTER district;

-- Add phone columns (replace single phone with multiple phones)
ALTER TABLE customers 
ADD COLUMN phone1 VARCHAR(20) 
AFTER province;

ALTER TABLE customers 
ADD COLUMN phone2 VARCHAR(20) 
AFTER phone1;

ALTER TABLE customers 
ADD COLUMN phone3 VARCHAR(20) 
AFTER phone2;

-- Update existing data
-- Copy existing phone to phone1
UPDATE customers 
SET phone1 = phone 
WHERE phone1 IS NULL AND phone IS NOT NULL;

-- Set default title for existing customers
UPDATE customers 
SET title = 'นาย' 
WHERE title IS NULL;

-- Add indexes for better performance
CREATE INDEX idx_customers_phone1 ON customers(phone1);
CREATE INDEX idx_customers_title ON customers(title);
CREATE INDEX idx_customers_age ON customers(age);

-- Show the updated table structure
DESCRIBE customers; 