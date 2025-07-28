-- Seed data for the database
-- This script adds sample data to all tables

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM payment_collections;
-- DELETE FROM payments;
-- DELETE FROM installments;
-- DELETE FROM checkers;
-- DELETE FROM customers;
-- DELETE FROM products;
-- DELETE FROM employees;
-- DELETE FROM branches;

-- Insert sample data for branches
INSERT INTO branches (name, address, phone, manager, is_active) VALUES
('สาขาหลัก', '123 ถนนสุขุมวิท กรุงเทพฯ 10110', '02-123-4567', 'คุณสมชาย ใจดี', 1),
('สาขารามคำแหง', '456 ถนนรามคำแหง กรุงเทพฯ 10240', '02-234-5678', 'คุณสมหญิง รักดี', 1),
('สาขาลาดพร้าว', '789 ถนนลาดพร้าว กรุงเทพฯ 10310', '02-345-6789', 'คุณประยุทธ มั่นคง', 1),
('สาขาประจวบคีรีขันธ์', 'ร้านเอฟซี เฟอร์นิเจอร์ 116 ม.3 ต.อ่าวน้อย อ.เมือง จ.ประจวบฯ 77000', '032-123-4567', 'คุณอนุชิต ไม่ทราบชื่อ', 1);

-- Insert sample data for employees
INSERT INTO employees (name, surname, full_name, phone, email, position, status, branch_id) VALUES
('สมชาย', 'ใจดี', 'สมชาย ใจดี', '081-111-1111', 'somchai@example.com', 'พนักงานขาย', 'active', 1),
('สมหญิง', 'รักดี', 'สมหญิง รักดี', '081-222-2222', 'somying@example.com', 'พนักงานขาย', 'active', 2),
('ประยุทธ', 'มั่นคง', 'ประยุทธ มั่นคง', '081-333-3333', 'prayut@example.com', 'พนักงานขาย', 'active', 3),
('อนุชิต', 'ไม่ทราบชื่อ', 'อนุชิต ไม่ทราบชื่อ', '081-444-4444', 'anuchit@example.com', 'พนักงานขาย', 'active', 4);

-- Insert sample data for checkers
INSERT INTO checkers (name, surname, full_name, phone, email, status, branch_id) VALUES
('อนุชิต', 'ไม่ทราบชื่อ', 'อนุชิต ไม่ทราบชื่อ', '081-111-1111', 'anuchit@example.com', 'active', 1),
('อุดมศักดิ์', 'ประถมทอง', 'อุดมศักดิ์ ประถมทอง', '081-222-2222', 'udomsak@example.com', 'active', 1),
('เสกศักดิ์', 'โตทอง', 'เสกศักดิ์ โตทอง', '081-333-3333', 'seksak@example.com', 'active', 1),
('สมชาย', 'ใจดี', 'สมชาย ใจดี', '081-444-4444', 'somchai@example.com', 'active', 1),
('สมหญิง', 'รักดี', 'สมหญิง รักดี', '081-555-5555', 'somying@example.com', 'active', 2),
('ประยุทธ', 'มั่นคง', 'ประยุทธ มั่นคง', '081-666-6666', 'prayut@example.com', 'active', 2),
('สุภาพ', 'สุจริต', 'สุภาพ สุจริต', '081-777-7777', 'supap@example.com', 'active', 2),
('วิเชียร', 'ทองคำ', 'วิเชียร ทองคำ', '081-888-8888', 'wichian@example.com', 'active', 3),
('รัตนา', 'ศรีสุข', 'รัตนา ศรีสุข', '081-999-9999', 'rattana@example.com', 'active', 3),
('ธนวัฒน์', 'เจริญก้าวหน้า', 'ธนวัฒน์ เจริญก้าวหน้า', '081-000-0000', 'thanawat@example.com', 'active', 3),
('นภา', 'แสงทอง', 'นภา แสงทอง', '081-123-4567', 'napa@example.com', 'active', 4);

-- Insert sample data for customers
INSERT INTO customers (name, surname, full_name, phone, email, address, status, branch_id) VALUES
('สมชาย', 'ใจดี', 'สมชาย ใจดี', '082-111-1111', 'customer1@example.com', '123 ถนนสุขุมวิท กรุงเทพฯ', 'active', 1),
('สมหญิง', 'รักดี', 'สมหญิง รักดี', '082-222-2222', 'customer2@example.com', '456 ถนนรามคำแหง กรุงเทพฯ', 'active', 1),
('ประยุทธ', 'มั่นคง', 'ประยุทธ มั่นคง', '082-333-3333', 'customer3@example.com', '789 ถนนลาดพร้าว กรุงเทพฯ', 'active', 2),
('สุภาพ', 'สุจริต', 'สุภาพ สุจริต', '082-444-4444', 'customer4@example.com', '321 ถนนสุขุมวิท กรุงเทพฯ', 'active', 2),
('วิเชียร', 'ทองคำ', 'วิเชียร ทองคำ', '082-555-5555', 'customer5@example.com', '654 ถนนรามคำแหง กรุงเทพฯ', 'active', 3),
('รัตนา', 'ศรีสุข', 'รัตนา ศรีสุข', '082-666-6666', 'customer6@example.com', '987 ถนนลาดพร้าว กรุงเทพฯ', 'active', 4);

-- Insert sample data for products
INSERT INTO products (name, description, price, status, branch_id) VALUES
('โทรศัพท์มือถือ Samsung Galaxy S21', 'สมาร์ทโฟนรุ่นใหม่จาก Samsung', 25000.00, 'active', 1),
('โน้ตบุ๊ค Dell Inspiron 15', 'แล็ปท็อปสำหรับงานและเรียน', 35000.00, 'active', 1),
('ทีวี LG 55 นิ้ว', 'ทีวี Smart TV ขนาด 55 นิ้ว', 45000.00, 'active', 2),
('ตู้เย็น Samsung 2 ประตู', 'ตู้เย็นขนาดใหญ่ 2 ประตู', 28000.00, 'active', 2),
('เครื่องซักผ้า Panasonic', 'เครื่องซักผ้าอัตโนมัติ', 18000.00, 'active', 3),
('แอร์คอนดิชัน Daikin', 'แอร์คอนดิชัน 12,000 BTU', 22000.00, 'active', 4);

-- Insert sample data for installments
INSERT INTO installments (contract_number, customer_id, product_id, product_name, total_amount, installment_amount, remaining_amount, installment_period, start_date, end_date, status, branch_id, salesperson_id) VALUES
('CT2401001', 1, 1, 'โทรศัพท์มือถือ Samsung Galaxy S21', 25000.00, 2500.00, 22500.00, 10, '2024-01-01', '2024-10-01', 'active', 1, 1),
('CT2401002', 2, 2, 'โน้ตบุ๊ค Dell Inspiron 15', 35000.00, 3500.00, 31500.00, 10, '2024-01-15', '2024-10-15', 'active', 1, 1),
('CT2401003', 3, 3, 'ทีวี LG 55 นิ้ว', 45000.00, 4500.00, 40500.00, 10, '2024-02-01', '2024-11-01', 'active', 2, 2),
('CT2401004', 4, 4, 'ตู้เย็น Samsung 2 ประตู', 28000.00, 2800.00, 25200.00, 10, '2024-02-15', '2024-11-15', 'active', 2, 2),
('CT2401005', 5, 5, 'เครื่องซักผ้า Panasonic', 18000.00, 1800.00, 16200.00, 10, '2024-03-01', '2024-12-01', 'active', 3, 3),
('CT2401006', 6, 6, 'แอร์คอนดิชัน Daikin', 22000.00, 2200.00, 19800.00, 10, '2024-03-15', '2024-12-15', 'active', 4, 4);

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
(5, 1800.00, NULL, '2024-04-01', 'pending'),
(6, 2200.00, '2024-03-15', '2024-03-15', 'paid'),
(6, 2200.00, NULL, '2024-04-15', 'pending');

-- Insert sample data for payment collections
INSERT INTO payment_collections (checker_id, customer_id, installment_id, payment_id, amount, payment_date, notes) VALUES
(1, 1, 1, 1, 2500.00, '2024-01-01', 'เก็บเงินงวดที่ 1'),
(2, 2, 2, 4, 3500.00, '2024-01-15', 'เก็บเงินงวดที่ 1'),
(3, 3, 3, 6, 4500.00, '2024-02-01', 'เก็บเงินงวดที่ 1'),
(4, 4, 4, 8, 2800.00, '2024-02-15', 'เก็บเงินงวดที่ 1'),
(5, 5, 5, 10, 1800.00, '2024-03-01', 'เก็บเงินงวดที่ 1'),
(11, 6, 6, 12, 2200.00, '2024-03-15', 'เก็บเงินงวดที่ 1'); 