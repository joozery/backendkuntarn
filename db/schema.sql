-- Database schema for Installment Management System with Checkers

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  manager VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Checkers table
CREATE TABLE IF NOT EXISTS checkers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  branch_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  branch_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  branch_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- Installments table
CREATE TABLE IF NOT EXISTS installments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(255),
  total_amount DECIMAL(10,2) NOT NULL,
  installment_amount DECIMAL(10,2) NOT NULL,
  remaining_amount DECIMAL(10,2) NOT NULL,
  installment_period INT NOT NULL, -- in months
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active', 'completed', 'cancelled', 'overdue') DEFAULT 'active',
  branch_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- Payments table (scheduled payments)
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  installment_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE,
  due_date DATE NOT NULL,
  status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (installment_id) REFERENCES installments(id) ON DELETE CASCADE
);

-- Payment Collections table (actual collections by checkers)
CREATE TABLE IF NOT EXISTS payment_collections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  checker_id INT NOT NULL,
  customer_id INT NOT NULL,
  installment_id INT NOT NULL,
  payment_id INT, -- Optional: link to scheduled payment
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  status ENUM('completed', 'pending', 'cancelled') DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (checker_id) REFERENCES checkers(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (installment_id) REFERENCES installments(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

-- Insert sample data for branches
INSERT INTO branches (name, address, phone, manager) VALUES
('สาขาหลัก', '123 ถนนสุขุมวิท กรุงเทพฯ 10110', '02-123-4567', 'คุณสมชาย ใจดี'),
('สาขารามคำแหง', '456 ถนนรามคำแหง กรุงเทพฯ 10240', '02-234-5678', 'คุณสมหญิง รักดี'),
('สาขาลาดพร้าว', '789 ถนนลาดพร้าว กรุงเทพฯ 10310', '02-345-6789', 'คุณประยุทธ มั่นคง');

-- Insert sample data for checkers
INSERT INTO checkers (name, surname, full_name, phone, email, branch_id) VALUES
('อนุชิต', '', 'อนุชิต', '081-111-1111', 'anuchit@example.com', 1),
('อุดมศักดิ์', 'ประถมทอง', 'อุดมศักดิ์ ประถมทอง', '081-222-2222', 'udomsak@example.com', 1),
('เสกศักดิ์', 'โตทอง', 'เสกศักดิ์ โตทอง', '081-333-3333', 'seksak@example.com', 1),
('สมชาย', 'ใจดี', 'สมชาย ใจดี', '081-444-4444', 'somchai@example.com', 1),
('สมหญิง', 'รักดี', 'สมหญิง รักดี', '081-555-5555', 'somying@example.com', 1),
('ประยุทธ', 'มั่นคง', 'ประยุทธ มั่นคง', '081-666-6666', 'prayut@example.com', 2),
('สุภาพ', 'สุจริต', 'สุภาพ สุจริต', '081-777-7777', 'supap@example.com', 2),
('วิเชียร', 'ทองคำ', 'วิเชียร ทองคำ', '081-888-8888', 'wichian@example.com', 2),
('รัตนา', 'ศรีสุข', 'รัตนา ศรีสุข', '081-999-9999', 'rattana@example.com', 3),
('ธนวัฒน์', 'เจริญก้าวหน้า', 'ธนวัฒน์ เจริญก้าวหน้า', '081-000-0000', 'thanawat@example.com', 3),
('นภา', 'แสงทอง', 'นภา แสงทอง', '081-123-4567', 'napa@example.com', 3);

-- Insert sample data for customers
INSERT INTO customers (name, surname, full_name, phone, email, address, branch_id) VALUES
('สมชาย', 'ใจดี', 'สมชาย ใจดี', '082-111-1111', 'customer1@example.com', '123 ถนนสุขุมวิท กรุงเทพฯ', 1),
('สมหญิง', 'รักดี', 'สมหญิง รักดี', '082-222-2222', 'customer2@example.com', '456 ถนนรามคำแหง กรุงเทพฯ', 1),
('ประยุทธ', 'มั่นคง', 'ประยุทธ มั่นคง', '082-333-3333', 'customer3@example.com', '789 ถนนลาดพร้าว กรุงเทพฯ', 2),
('สุภาพ', 'สุจริต', 'สุภาพ สุจริต', '082-444-4444', 'customer4@example.com', '321 ถนนสุขุมวิท กรุงเทพฯ', 2),
('วิเชียร', 'ทองคำ', 'วิเชียร ทองคำ', '082-555-5555', 'customer5@example.com', '654 ถนนรามคำแหง กรุงเทพฯ', 3);

-- Insert sample data for products
INSERT INTO products (name, description, price, branch_id) VALUES
('โทรศัพท์มือถือ Samsung Galaxy S21', 'สมาร์ทโฟนรุ่นใหม่จาก Samsung', 25000.00, 1),
('โน้ตบุ๊ค Dell Inspiron 15', 'แล็ปท็อปสำหรับงานและเรียน', 35000.00, 1),
('ทีวี LG 55 นิ้ว', 'ทีวี Smart TV ขนาด 55 นิ้ว', 45000.00, 2),
('ตู้เย็น Samsung 2 ประตู', 'ตู้เย็นขนาดใหญ่ 2 ประตู', 28000.00, 2),
('เครื่องซักผ้า Panasonic', 'เครื่องซักผ้าอัตโนมัติ', 18000.00, 3);

-- Insert sample data for installments
INSERT INTO installments (contract_number, customer_id, product_id, product_name, total_amount, installment_amount, remaining_amount, installment_period, start_date, end_date, branch_id) VALUES
('CT2401001', 1, 1, 'โทรศัพท์มือถือ Samsung Galaxy S21', 25000.00, 2500.00, 22500.00, 10, '2024-01-01', '2024-10-01', 1),
('CT2401002', 2, 2, 'โน้ตบุ๊ค Dell Inspiron 15', 35000.00, 3500.00, 31500.00, 10, '2024-01-15', '2024-10-15', 1),
('CT2401003', 3, 3, 'ทีวี LG 55 นิ้ว', 45000.00, 4500.00, 40500.00, 10, '2024-02-01', '2024-11-01', 2),
('CT2401004', 4, 4, 'ตู้เย็น Samsung 2 ประตู', 28000.00, 2800.00, 25200.00, 10, '2024-02-15', '2024-11-15', 2),
('CT2401005', 5, 5, 'เครื่องซักผ้า Panasonic', 18000.00, 1800.00, 16200.00, 10, '2024-03-01', '2024-12-01', 3);

-- Insert sample data for payments (scheduled)
INSERT INTO payments (installment_id, amount, payment_date, due_date, status) VALUES
(1, 2500.00, '2024-01-01', '2024-01-01', 'paid'),
(1, 2500.00, NULL, '2024-02-01', 'pending'),
(1, 2500.00, NULL, '2024-03-01', 'pending'),
(2, 3500.00, '2024-01-15', '2024-01-15', 'paid'),
(2, 3500.00, NULL, '2024-02-15', 'pending'),
(3, 4500.00, '2024-02-01', '2024-02-01', 'paid'),
(3, 4500.00, NULL, '2024-03-01', 'pending'),
(4, 2800.00, '2024-02-15', '2024-02-15', 'paid'),
(4, 2800.00, NULL, '2024-03-15', 'pending'),
(5, 1800.00, '2024-03-01', '2024-03-01', 'paid'),
(5, 1800.00, NULL, '2024-04-01', 'pending');

-- Insert sample data for payment collections
INSERT INTO payment_collections (checker_id, customer_id, installment_id, payment_id, amount, payment_date, notes) VALUES
(1, 1, 1, 1, 2500.00, '2024-01-01', 'เก็บเงินงวดที่ 1'),
(2, 2, 2, 4, 3500.00, '2024-01-15', 'เก็บเงินงวดที่ 1'),
(3, 3, 3, 6, 4500.00, '2024-02-01', 'เก็บเงินงวดที่ 1'),
(4, 4, 4, 8, 2800.00, '2024-02-15', 'เก็บเงินงวดที่ 1'),
(5, 5, 5, 10, 1800.00, '2024-03-01', 'เก็บเงินงวดที่ 1');

-- Create indexes for better performance
CREATE INDEX idx_checkers_branch_id ON checkers(branch_id);
CREATE INDEX idx_customers_branch_id ON customers(branch_id);
CREATE INDEX idx_installments_branch_id ON installments(branch_id);
CREATE INDEX idx_installments_customer_id ON installments(customer_id);
CREATE INDEX idx_payments_installment_id ON payments(installment_id);
CREATE INDEX idx_payment_collections_checker_id ON payment_collections(checker_id);
CREATE INDEX idx_payment_collections_customer_id ON payment_collections(customer_id);
CREATE INDEX idx_payment_collections_installment_id ON payment_collections(installment_id);
CREATE INDEX idx_payment_collections_payment_date ON payment_collections(payment_date); 