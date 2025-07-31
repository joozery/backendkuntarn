-- Add collector_id column to payments table
-- This script adds the collector_id column to track which collector is assigned to each payment

-- Add collector_id column
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS collector_id BIGINT AFTER installment_id;

-- Add foreign key constraint for collector_id
ALTER TABLE payments 
ADD CONSTRAINT fk_payments_collector_id FOREIGN KEY (collector_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_payments_collector_id ON payments(collector_id);

-- Add comment to describe the column
ALTER TABLE payments 
MODIFY COLUMN collector_id BIGINT COMMENT 'ID พนักงานเก็บเงิน';

-- Show the updated table structure
DESCRIBE payments; 