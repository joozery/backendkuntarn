-- Update installments table to include all new fields
-- Run this script to add missing columns to existing installments table

-- Add new columns to installments table
ALTER TABLE installments 
ADD COLUMN IF NOT EXISTS contract_date DATE AFTER contract_number,
ADD COLUMN IF NOT EXISTS inspector_id INT AFTER salesperson_id,
ADD COLUMN IF NOT EXISTS line VARCHAR(10) AFTER inspector_id,
ADD COLUMN IF NOT EXISTS down_payment DECIMAL(10,2) DEFAULT 0 AFTER line,
ADD COLUMN IF NOT EXISTS monthly_payment DECIMAL(10,2) AFTER down_payment,
ADD COLUMN IF NOT EXISTS months INT AFTER monthly_payment,
ADD COLUMN IF NOT EXISTS customer_details JSON AFTER months,
ADD COLUMN IF NOT EXISTS product_details JSON AFTER customer_details,
ADD COLUMN IF NOT EXISTS guarantor_details JSON AFTER product_details,
ADD COLUMN IF NOT EXISTS plan_details JSON AFTER guarantor_details,
ADD COLUMN IF NOT EXISTS notes TEXT AFTER plan_details;

-- Add foreign key constraint for inspector_id
ALTER TABLE installments 
ADD CONSTRAINT fk_installments_inspector 
FOREIGN KEY (inspector_id) REFERENCES checkers(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_installments_contract_date ON installments(contract_date);
CREATE INDEX IF NOT EXISTS idx_installments_inspector_id ON installments(inspector_id);
CREATE INDEX IF NOT EXISTS idx_installments_line ON installments(line);

-- Update existing records to set default values
UPDATE installments SET 
  contract_date = start_date 
WHERE contract_date IS NULL;

UPDATE installments SET 
  monthly_payment = installment_amount 
WHERE monthly_payment IS NULL;

UPDATE installments SET 
  months = installment_period 
WHERE months IS NULL;

-- Add comments to describe the new columns
ALTER TABLE installments 
MODIFY COLUMN contract_date DATE COMMENT 'วันที่ทำสัญญา',
MODIFY COLUMN inspector_id INT COMMENT 'ID ผู้ตรวจสอบ/ผู้เก็บเงิน',
MODIFY COLUMN line VARCHAR(10) COMMENT 'สายงาน (สาย 1, 2, 3)',
MODIFY COLUMN down_payment DECIMAL(10,2) COMMENT 'เงินดาวน์',
MODIFY COLUMN monthly_payment DECIMAL(10,2) COMMENT 'เงินผ่อนต่อเดือน',
MODIFY COLUMN months INT COMMENT 'จำนวนเดือนที่ผ่อน',
MODIFY COLUMN customer_details JSON COMMENT 'รายละเอียดลูกค้า (JSON)',
MODIFY COLUMN product_details JSON COMMENT 'รายละเอียดสินค้า (JSON)',
MODIFY COLUMN guarantor_details JSON COMMENT 'รายละเอียดผู้ค้ำ (JSON)',
MODIFY COLUMN plan_details JSON COMMENT 'รายละเอียดแผนการผ่อนชำระ (JSON)',
MODIFY COLUMN notes TEXT COMMENT 'หมายเหตุเพิ่มเติม';

-- Show the updated table structure
DESCRIBE installments; 