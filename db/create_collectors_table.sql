-- Create collectors table for payment collection staff management
-- Based on typical payment collection staff requirements

CREATE TABLE IF NOT EXISTS collectors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  
  -- Basic information
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  
  -- Contact information
  phone VARCHAR(20),
  phone2 VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  
  -- Employment details
  position VARCHAR(100) DEFAULT 'พนักงานเก็บเงิน',
  hire_date DATE,
  salary DECIMAL(10,2),
  commission_rate DECIMAL(5,2) DEFAULT 0.00, -- Commission percentage
  
  -- Work area and assignments
  branch_id BIGINT NOT NULL,
  assigned_areas TEXT, -- JSON or text describing assigned collection areas
  vehicle_info VARCHAR(255), -- Vehicle registration or description
  
  -- Performance tracking
  total_collections DECIMAL(12,2) DEFAULT 0.00,
  collections_count INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00, -- Success rate percentage
  
  -- Status and permissions
  status ENUM('active', 'inactive', 'suspended', 'terminated') DEFAULT 'active',
  is_supervisor BOOLEAN DEFAULT FALSE,
  can_approve_payments BOOLEAN DEFAULT FALSE,
  
  -- System fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  
  -- Indexes for better performance
  INDEX idx_collectors_branch_id (branch_id),
  INDEX idx_collectors_code (code),
  INDEX idx_collectors_status (status),
  INDEX idx_collectors_full_name (full_name)
);

-- Insert sample data
INSERT INTO collectors (
  code, name, surname, full_name, nickname, phone, phone2, email, address,
  position, hire_date, salary, commission_rate, branch_id, assigned_areas,
  vehicle_info, total_collections, collections_count, success_rate,
  status, is_supervisor, can_approve_payments
) VALUES
('COL001', 'สมชาย', 'ใจดี', 'สมชาย ใจดี', 'ชาย', '0812345678', '0823456789', 'somchai@example.com', '123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110', 'พนักงานเก็บเงิน', '2023-01-15', 15000.00, 5.00, 1, 'คลองเตย, พระโขนง, บางนา', 'รถจักรยานยนต์ Honda Wave 110', 250000.00, 45, 85.50, 'active', FALSE, FALSE),
('COL002', 'สมหญิง', 'รักดี', 'สมหญิง รักดี', 'หญิง', '0834567890', '0845678901', 'somying@example.com', '456 ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400', 'หัวหน้าพนักงานเก็บเงิน', '2022-06-01', 18000.00, 7.00, 1, 'ดินแดง, ห้วยขวาง, ลาดพร้าว', 'รถจักรยานยนต์ Yamaha Fino 125', 380000.00, 67, 92.30, 'active', TRUE, TRUE),
('COL003', 'ประยุทธ', 'มั่นคง', 'ประยุทธ มั่นคง', 'ยุทธ', '0856789012', '0867890123', 'prayut@example.com', '789 ถ.ลาดพร้าว แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพฯ 10310', 'พนักงานเก็บเงิน', '2023-03-20', 14000.00, 4.50, 1, 'ลาดพร้าว, วัฒนา, สวนหลวง', 'รถจักรยานยนต์ Suzuki Address 110', 180000.00, 32, 78.90, 'active', FALSE, FALSE),
('COL004', 'รัตนา', 'สวยงาม', 'รัตนา สวยงาม', 'ตาล', '0878901234', '0889012345', 'rattana@example.com', '321 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110', 'พนักงานเก็บเงิน', '2023-08-10', 14500.00, 5.00, 1, 'คลองเตย, พระโขนง', 'รถจักรยานยนต์ Honda Click 125', 120000.00, 28, 82.10, 'active', FALSE, FALSE),
('COL005', 'วิศวะ', 'ชาญฉลาด', 'วิศวะ ชาญฉลาด', 'วิศ', '0890123456', '0801234567', 'wisawa@example.com', '654 ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400', 'พนักงานเก็บเงิน', '2023-11-05', 13500.00, 4.00, 1, 'ดินแดง, ห้วยขวาง', 'รถจักรยานยนต์ Yamaha Fino 125', 95000.00, 18, 75.60, 'active', FALSE, FALSE); 