-- Create inventory table for product management system
-- Based on the table structure from the user's data

CREATE TABLE IF NOT EXISTS inventory (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  
  -- Basic inventory information
  sequence INT NOT NULL,
  receive_date DATE,
  product_code VARCHAR(50),
  product_name VARCHAR(500) NOT NULL,
  contract_number VARCHAR(50),
  cost_price DECIMAL(10,2),
  sell_date DATE,
  selling_cost DECIMAL(10,2),
  remaining_quantity1 INT DEFAULT 1,
  received_quantity INT DEFAULT 1,
  sold_quantity INT DEFAULT 0,
  remaining_quantity2 INT DEFAULT 1,
  remarks TEXT,
  
  -- System fields
  branch_id BIGINT NOT NULL,
  status ENUM('active', 'sold', 'returned', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  
  -- Indexes for better performance
  INDEX idx_inventory_branch_id (branch_id),
  INDEX idx_inventory_sequence (sequence),
  INDEX idx_inventory_product_code (product_code),
  INDEX idx_inventory_contract_number (contract_number),
  INDEX idx_inventory_receive_date (receive_date),
  INDEX idx_inventory_sell_date (sell_date),
  INDEX idx_inventory_status (status)
);

-- Insert sample data based on the user's table
INSERT INTO inventory (
  sequence, receive_date, product_code, product_name, contract_number, 
  cost_price, sell_date, selling_cost, remaining_quantity1, 
  received_quantity, sold_quantity, remaining_quantity2, remarks, branch_id
) VALUES
(1, '2021-08-25', '', 'เครื่องซักผ้า 11 กิโล LGมือ 2 หมายเลข 65', '', '0.00', NULL, NULL, 0, 1, 0, 1, '', 1),
(2, '2021-09-29', 'R43', 'ตู้เย็น 5.9 คิว 2 ประตู ชาร์ป', '', 1050.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(3, '2022-06-03', 'N903', 'ตู้วางรองเท้า103CM ช่องข้าง', '', 2740.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(4, '2024-10-18', 'P12', 'เตียงนอน 6 ฟุตบานเลื่อน หินอ่อนดำหัวขาว สามเพ็ชร', 'F5248', 1780.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(5, '2024-10-18', 'N903', 'เตียงนอน 6 ฟุตบานเลื่อน หินอ่อนดำหัวขาว สามเพ็ชร', 'F5248', 2740.00, '2025-07-04', 2740.00, 0, 1, 1, 0, '', 1),
(6, '2025-01-27', 'W43', 'โต๊ะแป้งบานเปิดกระจกบนขาว หินอ่อนดำ บานขาว', '', 1210.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(7, '2025-01-27', 'W451', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', '', 960.00, NULL, NULL, 1, 1, 0, 1, 'ซ่อมแล้วเต9ข้างล่างไม่เย็', 1),
(8, '2025-01-27', '', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', '', 1210.00, NULL, NULL, 1, 1, 0, 1, 'มาวันที่ 23/6/68', 1),
(9, '2025-03-01', 'W450', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', '', 800.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(10, '2025-03-01', 'P15', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', 'F5252', 2570.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(11, '2025-03-01', '', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', '', 2090.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(12, '2025-03-01', '', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', '', 1910.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(13, '2025-03-01', '', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', '', 1110.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(14, '2025-03-01', '', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', '', 1910.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(15, '2025-03-01', '', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', '', 1110.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(16, '2025-03-01', '', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', '', 1910.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(17, '2025-03-01', '', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', '', 1110.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(18, '2025-03-01', '', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', '', 1910.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(19, '2025-03-01', '', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', '', 1110.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(20, '2025-03-01', '', 'ที่นอน 6 ฟุต ยางอัด ผ้านอก', '', 1910.00, NULL, NULL, 1, 1, 0, 1, '', 1),
(21, '2025-03-24', '', 'เครื่องซักผ้า 10 Kg Lg อนุวัตรบางพาน', '', 5200.00, NULL, NULL, 1, 1, 0, 1, 'หักพี่อั้น 5200', 1),
(22, '2025-03-24', '', 'เครื่องซักผ้า 10 Kg Lg อนุวัตรบางพาน', '', 5200.00, NULL, NULL, 1, 1, 0, 1, 'หักพี่อั้น 5200', 1); 