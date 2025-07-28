-- Drop existing installments table if exists
DROP TABLE IF EXISTS installments;

-- Create installments table with all required columns
CREATE TABLE installments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Basic contract information
  contract_number VARCHAR(50) NOT NULL UNIQUE,
  contract_date DATE,
  customer_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  installment_amount DECIMAL(10,2) NOT NULL,
  remaining_amount DECIMAL(10,2) NOT NULL,
  installment_period INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  branch_id INT NOT NULL,
  salesperson_id INT,
  inspector_id INT,
  line VARCHAR(10),
  
  -- Customer details
  customer_title VARCHAR(20),
  customer_age INT,
  customer_moo VARCHAR(20),
  customer_road VARCHAR(100),
  customer_subdistrict VARCHAR(100),
  customer_district VARCHAR(100),
  customer_province VARCHAR(100),
  customer_phone1 VARCHAR(20),
  customer_phone2 VARCHAR(20),
  customer_phone3 VARCHAR(20),
  customer_email VARCHAR(100),
  
  -- Guarantor details
  guarantor_id INT,
  guarantor_title VARCHAR(20),
  guarantor_name VARCHAR(100),
  guarantor_surname VARCHAR(100),
  guarantor_nickname VARCHAR(50),
  guarantor_age INT,
  guarantor_id_card VARCHAR(20),
  guarantor_address VARCHAR(255),
  guarantor_moo VARCHAR(20),
  guarantor_road VARCHAR(100),
  guarantor_subdistrict VARCHAR(100),
  guarantor_district VARCHAR(100),
  guarantor_province VARCHAR(100),
  guarantor_phone1 VARCHAR(20),
  guarantor_phone2 VARCHAR(20),
  guarantor_phone3 VARCHAR(20),
  guarantor_email VARCHAR(100),
  
  -- Product details
  product_description TEXT,
  product_category VARCHAR(100),
  product_model VARCHAR(100),
  product_serial_number VARCHAR(100),
  
  -- Plan details
  down_payment DECIMAL(10,2) DEFAULT 0,
  monthly_payment DECIMAL(10,2),
  months INT,
  collection_date DATE,
  
  -- System fields
  status ENUM('active', 'completed', 'cancelled', 'defaulted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better performance
  INDEX idx_contract_number (contract_number),
  INDEX idx_customer_id (customer_id),
  INDEX idx_product_id (product_id),
  INDEX idx_branch_id (branch_id),
  INDEX idx_salesperson_id (salesperson_id),
  INDEX idx_inspector_id (inspector_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Add comments to describe the table
ALTER TABLE installments COMMENT = 'Installment contracts table with detailed customer, guarantor, and product information';

-- Show table structure
DESCRIBE installments; 