-- Add sample data for collectors (employees with collector position)
-- This script adds employees with collector positions to the employees table

-- Insert sample data for collectors
INSERT INTO employees (name, surname, full_name, phone, email, position, status, branch_id) VALUES
('สมชาย', 'ใจดี', 'สมชาย ใจดี', '081-111-1111', 'somchai@example.com', 'พนักงานเก็บเงิน', 'active', 1),
('สมหญิง', 'รักดี', 'สมหญิง รักดี', '081-222-2222', 'somying@example.com', 'พนักงานเก็บเงิน', 'active', 1),
('ประยุทธ', 'มั่นคง', 'ประยุทธ มั่นคง', '081-333-3333', 'prayut@example.com', 'พนักงานเก็บเงิน', 'active', 2),
('สุภาพ', 'สุจริต', 'สุภาพ สุจริต', '081-444-4444', 'supap@example.com', 'พนักงานเก็บเงิน', 'active', 2),
('วิเชียร', 'ทองคำ', 'วิเชียร ทองคำ', '081-555-5555', 'wichian@example.com', 'พนักงานเก็บเงิน', 'active', 3),
('รัตนา', 'ศรีสุข', 'รัตนา ศรีสุข', '081-666-6666', 'rattana@example.com', 'พนักงานเก็บเงิน', 'active', 3),
('ธนวัฒน์', 'เจริญก้าวหน้า', 'ธนวัฒน์ เจริญก้าวหน้า', '081-777-7777', 'thanawat@example.com', 'พนักงานเก็บเงิน', 'active', 1),
('นภา', 'แสงทอง', 'นภา แสงทอง', '081-888-8888', 'napa@example.com', 'พนักงานเก็บเงิน', 'active', 2);

-- Show the inserted collectors
SELECT id, name, surname, full_name, position, branch_id FROM employees WHERE position LIKE '%เก็บเงิน%'; 