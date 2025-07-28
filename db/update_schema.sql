-- Update schema to use BIGINT for IDs
-- This script updates existing tables to use BIGINT instead of INT for better compatibility

-- Drop foreign key constraints first
ALTER TABLE payment_collections DROP FOREIGN KEY IF EXISTS payment_collections_ibfk_1;
ALTER TABLE payment_collections DROP FOREIGN KEY IF EXISTS payment_collections_ibfk_2;
ALTER TABLE payment_collections DROP FOREIGN KEY IF EXISTS payment_collections_ibfk_3;
ALTER TABLE payment_collections DROP FOREIGN KEY IF EXISTS payment_collections_ibfk_4;

ALTER TABLE payments DROP FOREIGN KEY IF EXISTS payments_ibfk_1;

ALTER TABLE installments DROP FOREIGN KEY IF EXISTS installments_ibfk_1;
ALTER TABLE installments DROP FOREIGN KEY IF EXISTS installments_ibfk_2;
ALTER TABLE installments DROP FOREIGN KEY IF EXISTS installments_ibfk_3;
ALTER TABLE installments DROP FOREIGN KEY IF EXISTS installments_ibfk_4;

ALTER TABLE checkers DROP FOREIGN KEY IF EXISTS checkers_ibfk_1;
ALTER TABLE customers DROP FOREIGN KEY IF EXISTS customers_ibfk_1;
ALTER TABLE products DROP FOREIGN KEY IF EXISTS products_ibfk_1;

-- Update tables to use BIGINT
ALTER TABLE branches MODIFY id BIGINT AUTO_INCREMENT;
ALTER TABLE checkers MODIFY id BIGINT AUTO_INCREMENT;
ALTER TABLE checkers MODIFY branch_id BIGINT;
ALTER TABLE customers MODIFY id BIGINT AUTO_INCREMENT;
ALTER TABLE customers MODIFY branch_id BIGINT;
ALTER TABLE products MODIFY id BIGINT AUTO_INCREMENT;
ALTER TABLE products MODIFY branch_id BIGINT;
ALTER TABLE installments MODIFY id BIGINT AUTO_INCREMENT;
ALTER TABLE installments MODIFY customer_id BIGINT NOT NULL;
ALTER TABLE installments MODIFY product_id BIGINT;
ALTER TABLE installments MODIFY branch_id BIGINT;
ALTER TABLE installments MODIFY salesperson_id BIGINT;
ALTER TABLE payments MODIFY id BIGINT AUTO_INCREMENT;
ALTER TABLE payments MODIFY installment_id BIGINT NOT NULL;
ALTER TABLE payment_collections MODIFY id BIGINT AUTO_INCREMENT;
ALTER TABLE payment_collections MODIFY checker_id BIGINT NOT NULL;
ALTER TABLE payment_collections MODIFY customer_id BIGINT NOT NULL;
ALTER TABLE payment_collections MODIFY installment_id BIGINT NOT NULL;
ALTER TABLE payment_collections MODIFY payment_id BIGINT;

-- Create employees table if it doesn't exist
CREATE TABLE IF NOT EXISTS employees (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  position VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  branch_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- Re-add foreign key constraints
ALTER TABLE checkers ADD CONSTRAINT checkers_ibfk_1 FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE customers ADD CONSTRAINT customers_ibfk_1 FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE products ADD CONSTRAINT products_ibfk_1 FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE installments ADD CONSTRAINT installments_ibfk_1 FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE installments ADD CONSTRAINT installments_ibfk_2 FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE installments ADD CONSTRAINT installments_ibfk_3 FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE installments ADD CONSTRAINT installments_ibfk_4 FOREIGN KEY (salesperson_id) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE payments ADD CONSTRAINT payments_ibfk_1 FOREIGN KEY (installment_id) REFERENCES installments(id) ON DELETE CASCADE;
ALTER TABLE payment_collections ADD CONSTRAINT payment_collections_ibfk_1 FOREIGN KEY (checker_id) REFERENCES checkers(id) ON DELETE CASCADE;
ALTER TABLE payment_collections ADD CONSTRAINT payment_collections_ibfk_2 FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE payment_collections ADD CONSTRAINT payment_collections_ibfk_3 FOREIGN KEY (installment_id) REFERENCES installments(id) ON DELETE CASCADE;
ALTER TABLE payment_collections ADD CONSTRAINT payment_collections_ibfk_4 FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

-- Recreate indexes
DROP INDEX IF EXISTS idx_checkers_branch_id ON checkers;
DROP INDEX IF EXISTS idx_customers_branch_id ON customers;
DROP INDEX IF EXISTS idx_installments_branch_id ON installments;
DROP INDEX IF EXISTS idx_installments_customer_id ON installments;
DROP INDEX IF EXISTS idx_payments_installment_id ON payments;
DROP INDEX IF EXISTS idx_payment_collections_checker_id ON payment_collections;
DROP INDEX IF EXISTS idx_payment_collections_customer_id ON payment_collections;
DROP INDEX IF EXISTS idx_payment_collections_installment_id ON payment_collections;
DROP INDEX IF EXISTS idx_payment_collections_payment_date ON payment_collections;

CREATE INDEX idx_checkers_branch_id ON checkers(branch_id);
CREATE INDEX idx_customers_branch_id ON customers(branch_id);
CREATE INDEX idx_installments_branch_id ON installments(branch_id);
CREATE INDEX idx_installments_customer_id ON installments(customer_id);
CREATE INDEX idx_payments_installment_id ON payments(installment_id);
CREATE INDEX idx_payment_collections_checker_id ON payment_collections(checker_id);
CREATE INDEX idx_payment_collections_customer_id ON payment_collections(customer_id);
CREATE INDEX idx_payment_collections_installment_id ON payment_collections(installment_id);
CREATE INDEX idx_payment_collections_payment_date ON payment_collections(payment_date); 