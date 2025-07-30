-- Create payment_tracking table for installment payment status tracking
CREATE TABLE IF NOT EXISTS payment_tracking (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  installment_id INT NOT NULL,
  contract_number VARCHAR(50) NOT NULL,
  inspector_id INT,
  
  -- Payment Status
  payment_status ENUM('pending', 'partial', 'completed') DEFAULT 'pending',
  
  -- Napheo Counters (นับเพียว)
  napheo_red INT DEFAULT 0,
  napheo_black INT DEFAULT 0,
  
  -- P Status Counters (P สีต่างๆ)
  p_black INT DEFAULT 0,
  p_red INT DEFAULT 0,
  p_blue INT DEFAULT 0,
  
  -- Amount Tracking
  amount_to_collect DECIMAL(10,2) DEFAULT 0,
  amount_collected DECIMAL(10,2) DEFAULT 0,
  remaining_debt DECIMAL(10,2) DEFAULT 0,
  
  -- Collection Date
  collection_date DATE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (installment_id) REFERENCES installments(id) ON DELETE CASCADE,
  FOREIGN KEY (inspector_id) REFERENCES checkers(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_payment_tracking_installment_id (installment_id),
  INDEX idx_payment_tracking_contract_number (contract_number),
  INDEX idx_payment_tracking_inspector_id (inspector_id),
  INDEX idx_payment_tracking_collection_date (collection_date),
  INDEX idx_payment_tracking_status (payment_status),
  
  -- Unique constraint
  UNIQUE KEY unique_installment_tracking (installment_id)
);

-- Add comments
ALTER TABLE payment_tracking 
MODIFY COLUMN payment_status ENUM('pending', 'partial', 'completed') DEFAULT 'pending' COMMENT 'สถานะการชำระเงิน',
MODIFY COLUMN napheo_red INT DEFAULT 0 COMMENT 'นับเพียวแดง',
MODIFY COLUMN napheo_black INT DEFAULT 0 COMMENT 'นับเพียวดำ',
MODIFY COLUMN p_black INT DEFAULT 0 COMMENT 'P ดำ',
MODIFY COLUMN p_red INT DEFAULT 0 COMMENT 'P แดง',
MODIFY COLUMN p_blue INT DEFAULT 0 COMMENT 'P น้ำเงิน',
MODIFY COLUMN amount_to_collect DECIMAL(10,2) DEFAULT 0 COMMENT 'เงินที่ต้องเก็บ',
MODIFY COLUMN amount_collected DECIMAL(10,2) DEFAULT 0 COMMENT 'เงินที่เก็บได้',
MODIFY COLUMN remaining_debt DECIMAL(10,2) DEFAULT 0 COMMENT 'ลูกหนี้คงเหลือ',
MODIFY COLUMN collection_date DATE COMMENT 'วันนัดเก็บ';

-- Insert initial data from existing installments
INSERT IGNORE INTO payment_tracking (
  installment_id,
  contract_number,
  inspector_id,
  payment_status,
  amount_to_collect,
  amount_collected,
  remaining_debt,
  collection_date
)
SELECT 
  id,
  contract_number,
  inspector_id,
  'pending' as payment_status,
  COALESCE(installment_amount, 0) as amount_to_collect,
  0 as amount_collected,
  COALESCE(installment_amount, 0) as remaining_debt,
  COALESCE(collection_date, start_date) as collection_date
FROM installments
WHERE id NOT IN (SELECT installment_id FROM payment_tracking);

-- Show the new table structure
DESCRIBE payment_tracking; 