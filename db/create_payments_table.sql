-- Create payments table for payment schedule
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Payment details
  installment_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NULL,
  due_date DATE NOT NULL,
  status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  
  -- System fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better performance
  INDEX idx_installment_id (installment_id),
  INDEX idx_due_date (due_date),
  INDEX idx_status (status),
  INDEX idx_payment_date (payment_date),
  INDEX idx_created_at (created_at),
  
  -- Foreign key constraint
  FOREIGN KEY (installment_id) REFERENCES installments(id) ON DELETE CASCADE
);

-- Create payment_collections table for tracking who collected payments
CREATE TABLE IF NOT EXISTS payment_collections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Collection details
  payment_id INT NOT NULL,
  checker_id INT NOT NULL,
  collection_date DATE NOT NULL,
  amount_collected DECIMAL(10,2) NOT NULL,
  notes TEXT,
  
  -- System fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better performance
  INDEX idx_payment_id (payment_id),
  INDEX idx_checker_id (checker_id),
  INDEX idx_collection_date (collection_date),
  INDEX idx_created_at (created_at),
  
  -- Foreign key constraints
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (checker_id) REFERENCES checkers(id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate collections for same payment
  UNIQUE KEY unique_payment_collection (payment_id)
);

-- Add comments to describe the tables
ALTER TABLE payments COMMENT = 'Payment schedule table for installment contracts';
ALTER TABLE payment_collections COMMENT = 'Payment collection tracking table'; 