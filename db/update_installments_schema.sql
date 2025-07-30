-- Update installments table to include new fields
-- This script adds all the missing columns to the installments table

-- Add new columns one by one with IF NOT EXISTS check
ALTER TABLE installments 
ADD COLUMN IF NOT EXISTS contract_date DATE AFTER contract_number,
ADD COLUMN IF NOT EXISTS inspector_id BIGINT AFTER salesperson_id,
ADD COLUMN IF NOT EXISTS line VARCHAR(255) AFTER inspector_id,
ADD COLUMN IF NOT EXISTS customer_title VARCHAR(50) AFTER line,
ADD COLUMN IF NOT EXISTS customer_age INT AFTER customer_title,
ADD COLUMN IF NOT EXISTS customer_moo VARCHAR(50) AFTER customer_age,
ADD COLUMN IF NOT EXISTS customer_road VARCHAR(255) AFTER customer_moo,
ADD COLUMN IF NOT EXISTS customer_subdistrict VARCHAR(255) AFTER customer_road,
ADD COLUMN IF NOT EXISTS customer_district VARCHAR(255) AFTER customer_subdistrict,
ADD COLUMN IF NOT EXISTS customer_province VARCHAR(255) AFTER customer_district,
ADD COLUMN IF NOT EXISTS customer_phone1 VARCHAR(20) AFTER customer_province,
ADD COLUMN IF NOT EXISTS customer_phone2 VARCHAR(20) AFTER customer_phone1,
ADD COLUMN IF NOT EXISTS customer_phone3 VARCHAR(20) AFTER customer_phone2,
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255) AFTER customer_phone3,
ADD COLUMN IF NOT EXISTS customer_id_card VARCHAR(13) AFTER customer_email,
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255) AFTER customer_id_card,
ADD COLUMN IF NOT EXISTS customer_surname VARCHAR(255) AFTER customer_name,
ADD COLUMN IF NOT EXISTS customer_nickname VARCHAR(100) AFTER customer_surname,
ADD COLUMN IF NOT EXISTS guarantor_id BIGINT AFTER customer_nickname,
ADD COLUMN IF NOT EXISTS guarantor_title VARCHAR(50) AFTER guarantor_id,
ADD COLUMN IF NOT EXISTS guarantor_name VARCHAR(255) AFTER guarantor_title,
ADD COLUMN IF NOT EXISTS guarantor_surname VARCHAR(255) AFTER guarantor_name,
ADD COLUMN IF NOT EXISTS guarantor_nickname VARCHAR(100) AFTER guarantor_surname,
ADD COLUMN IF NOT EXISTS guarantor_age INT AFTER guarantor_nickname,
ADD COLUMN IF NOT EXISTS guarantor_id_card VARCHAR(13) AFTER guarantor_age,
ADD COLUMN IF NOT EXISTS guarantor_address TEXT AFTER guarantor_id_card,
ADD COLUMN IF NOT EXISTS guarantor_moo VARCHAR(50) AFTER guarantor_address,
ADD COLUMN IF NOT EXISTS guarantor_road VARCHAR(255) AFTER guarantor_moo,
ADD COLUMN IF NOT EXISTS guarantor_subdistrict VARCHAR(255) AFTER guarantor_road,
ADD COLUMN IF NOT EXISTS guarantor_district VARCHAR(255) AFTER guarantor_subdistrict,
ADD COLUMN IF NOT EXISTS guarantor_province VARCHAR(255) AFTER guarantor_district,
ADD COLUMN IF NOT EXISTS guarantor_phone1 VARCHAR(20) AFTER guarantor_province,
ADD COLUMN IF NOT EXISTS guarantor_phone2 VARCHAR(20) AFTER guarantor_phone1,
ADD COLUMN IF NOT EXISTS guarantor_phone3 VARCHAR(20) AFTER guarantor_phone2,
ADD COLUMN IF NOT EXISTS guarantor_email VARCHAR(255) AFTER guarantor_phone3,
ADD COLUMN IF NOT EXISTS product_description TEXT AFTER guarantor_email,
ADD COLUMN IF NOT EXISTS product_category VARCHAR(100) AFTER product_description,
ADD COLUMN IF NOT EXISTS product_model VARCHAR(100) AFTER product_category,
ADD COLUMN IF NOT EXISTS product_serial_number VARCHAR(100) AFTER product_model,
ADD COLUMN IF NOT EXISTS down_payment DECIMAL(10,2) AFTER product_serial_number,
ADD COLUMN IF NOT EXISTS monthly_payment DECIMAL(10,2) AFTER down_payment,
ADD COLUMN IF NOT EXISTS months INT AFTER monthly_payment,
ADD COLUMN IF NOT EXISTS collection_date DATE AFTER months;

-- Add foreign key constraints (only if they don't exist)
-- Note: MySQL doesn't support IF NOT EXISTS for constraints, so we'll handle errors gracefully
ALTER TABLE installments 
ADD CONSTRAINT fk_installments_inspector_id FOREIGN KEY (inspector_id) REFERENCES checkers(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_installments_guarantor_id FOREIGN KEY (guarantor_id) REFERENCES customers(id) ON DELETE SET NULL;

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