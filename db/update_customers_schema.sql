-- Update customers table schema
-- Run this script to update existing customers table

-- Add new columns to customers table
ALTER TABLE customers 
ADD COLUMN code VARCHAR(50) UNIQUE AFTER id,
ADD COLUMN id_card VARCHAR(13) UNIQUE AFTER full_name,
ADD COLUMN nickname VARCHAR(100) AFTER id_card,
ADD COLUMN guarantor_name VARCHAR(255) AFTER address,
ADD COLUMN guarantor_id_card VARCHAR(13) AFTER guarantor_name,
ADD COLUMN guarantor_nickname VARCHAR(100) AFTER guarantor_id_card,
ADD COLUMN guarantor_phone VARCHAR(20) AFTER guarantor_nickname,
ADD COLUMN guarantor_address TEXT AFTER guarantor_phone,
ADD COLUMN checker_id BIGINT AFTER branch_id;

-- Update status enum
ALTER TABLE customers 
MODIFY COLUMN status ENUM('active', 'inactive', 'overdue', 'completed') DEFAULT 'active';

-- Add foreign key for checker_id
ALTER TABLE customers 
ADD CONSTRAINT fk_customers_checker_id 
FOREIGN KEY (checker_id) REFERENCES checkers(id) ON DELETE SET NULL;

-- Update existing customers with sample data
UPDATE customers SET 
  code = CONCAT('CUST', LPAD(id, 3, '0')),
  id_card = CONCAT('1234567890', LPAD(id, 3, '0')),
  nickname = name,
  guarantor_name = CONCAT(name, ' ผู้ค้ำ'),
  guarantor_id_card = CONCAT('9876543210', LPAD(id, 3, '0')),
  guarantor_nickname = CONCAT(name, 'ค้ำ'),
  guarantor_phone = CONCAT('082-', LPAD(id, 3, '0'), '-', LPAD(id, 4, '0')),
  guarantor_address = CONCAT('ที่อยู่ผู้ค้ำของ ', name),
  checker_id = CASE 
    WHEN id % 3 = 0 THEN 3
    WHEN id % 2 = 0 THEN 2
    ELSE 1
  END
WHERE code IS NULL;

-- Create indexes for better performance
CREATE INDEX idx_customers_code ON customers(code);
CREATE INDEX idx_customers_id_card ON customers(id_card);
CREATE INDEX idx_customers_checker_id ON customers(checker_id);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_guarantor_id_card ON customers(guarantor_id_card); 