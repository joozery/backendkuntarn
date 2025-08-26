-- Check and fix installments table schema
-- This script will ensure all necessary columns exist for the contract edit form

-- 1. Check current table structure
DESCRIBE installments;

-- 2. Check if critical columns exist
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'installments' 
  AND TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME IN ('product_id', 'collector_id', 'line', 'inspector_id')
ORDER BY COLUMN_NAME;

-- 3. Add missing columns if they don't exist
-- Note: These commands will fail if columns already exist, which is fine

-- Add collector_id column if it doesn't exist
ALTER TABLE installments 
ADD COLUMN IF NOT EXISTS collector_id BIGINT AFTER inspector_id;

-- Add foreign key constraint for collector_id
ALTER TABLE installments 
ADD CONSTRAINT IF NOT EXISTS fk_installments_collector_id 
FOREIGN KEY (collector_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Add index for collector_id
CREATE INDEX IF NOT EXISTS idx_installments_collector_id ON installments(collector_id);

-- 4. Check data integrity
-- Check if there are contracts without product_id
SELECT 
  COUNT(*) as contracts_without_product,
  'Missing product_id' as issue
FROM installments 
WHERE product_id IS NULL OR product_id = 0

UNION ALL

-- Check if there are contracts without collector_id
SELECT 
  COUNT(*) as contracts_without_collector,
  'Missing collector_id' as issue
FROM installments 
WHERE collector_id IS NULL OR collector_id = 0

UNION ALL

-- Check if there are contracts without line
SELECT 
  COUNT(*) as contracts_without_line,
  'Missing line' as issue
FROM installments 
WHERE line IS NULL OR line = '';

-- 5. Sample data check
-- Show a few sample contracts with their key fields
SELECT 
  id,
  contract_number,
  product_id,
  collector_id,
  line,
  inspector_id,
  customer_id,
  salesperson_id
FROM installments 
ORDER BY id DESC 
LIMIT 5;

-- 6. Check foreign key relationships
-- Verify that product_id references exist in inventory table
SELECT 
  'Product ID not found in inventory' as issue,
  i.id as contract_id,
  i.contract_number,
  i.product_id
FROM installments i
LEFT JOIN inventory inv ON i.product_id = inv.id
WHERE i.product_id IS NOT NULL 
  AND i.product_id != 0 
  AND inv.id IS NULL

UNION ALL

-- Verify that collector_id references exist in employees table
SELECT 
  'Collector ID not found in employees' as issue,
  i.id as contract_id,
  i.contract_number,
  i.collector_id
FROM installments i
LEFT JOIN employees e ON i.collector_id = e.id
WHERE i.collector_id IS NOT NULL 
  AND i.collector_id != 0 
  AND e.id IS NULL;

-- 7. Update sample data (optional - uncomment if needed)
-- This will help test the frontend with some sample data

/*
-- Set a sample collector_id for contracts that don't have one
UPDATE installments 
SET collector_id = (
  SELECT id FROM employees 
  WHERE position = 'collector' OR position = 'พนักงานเก็บเงิน' 
  LIMIT 1
)
WHERE collector_id IS NULL OR collector_id = 0;

-- Set a sample line for contracts that don't have one
UPDATE installments 
SET line = 'สาย1'
WHERE line IS NULL OR line = '';
*/

-- 8. Final verification
-- Show the final table structure
DESCRIBE installments;

-- Show indexes
SHOW INDEX FROM installments;

-- Show foreign key constraints
SELECT 
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'installments' 
  AND TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL;
