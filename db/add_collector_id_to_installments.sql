-- Add collector_id column to installments table
-- This script adds the collector_id column to track which collector is assigned to each installment

-- Add collector_id column
ALTER TABLE installments 
ADD COLUMN IF NOT EXISTS collector_id BIGINT AFTER inspector_id;

-- Add foreign key constraint for collector_id
ALTER TABLE installments 
ADD CONSTRAINT fk_installments_collector_id FOREIGN KEY (collector_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_installments_collector_id ON installments(collector_id);

-- Add comment to describe the column
ALTER TABLE installments 
MODIFY COLUMN collector_id BIGINT COMMENT 'ID พนักงานเก็บเงิน';

-- Show the updated table structure
DESCRIBE installments; 