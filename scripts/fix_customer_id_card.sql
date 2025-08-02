-- Fix customer id_card null issue
-- This script provides two options to resolve the id_card cannot be null error

-- Option 1: Make id_card nullable (if you want to allow null values)
-- Uncomment the following line if you want to allow null id_cards:
-- ALTER TABLE customers MODIFY COLUMN id_card VARCHAR(13) UNIQUE;

-- Option 2: Generate unique id_cards for null values (recommended)
-- This will generate unique id_cards for any existing null values
UPDATE customers 
SET id_card = CONCAT('TEMP', LPAD(id, 9, '0'))
WHERE id_card IS NULL OR id_card = '';

-- Option 3: Remove UNIQUE constraint temporarily to allow duplicates
-- Uncomment the following lines if you need to handle duplicate id_cards:
-- ALTER TABLE customers DROP INDEX id_card;
-- ALTER TABLE customers MODIFY COLUMN id_card VARCHAR(13);

-- Show current customers with null or empty id_cards
SELECT id, code, name, surname, id_card 
FROM customers 
WHERE id_card IS NULL OR id_card = '';

-- Show table structure
DESCRIBE customers; 