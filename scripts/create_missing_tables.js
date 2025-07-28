const { query } = require('../db/db');

async function createMissingTables() {
  try {
    console.log('🔄 กำลังสร้างตารางที่ขาดหายไป...');

    // 1. Create products table
    console.log('📝 สร้างตาราง products...');
    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        status ENUM('active', 'inactive') DEFAULT 'active',
        branch_id BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
      )
    `;
    await query(createProductsTable);
    console.log('✅ ตาราง products สร้างสำเร็จ');

    // 2. Create installments table
    console.log('📝 สร้างตาราง installments...');
    const createInstallmentsTable = `
      CREATE TABLE IF NOT EXISTS installments (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        contract_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id BIGINT NOT NULL,
        product_id BIGINT,
        product_name VARCHAR(255),
        total_amount DECIMAL(10,2) NOT NULL,
        installment_amount DECIMAL(10,2) NOT NULL,
        remaining_amount DECIMAL(10,2) NOT NULL,
        installment_period INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('active', 'completed', 'cancelled', 'overdue') DEFAULT 'active',
        branch_id BIGINT,
        salesperson_id BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
        FOREIGN KEY (salesperson_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `;
    await query(createInstallmentsTable);
    console.log('✅ ตาราง installments สร้างสำเร็จ');

    // 3. Create payments table
    console.log('📝 สร้างตาราง payments...');
    const createPaymentsTable = `
      CREATE TABLE IF NOT EXISTS payments (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        installment_id BIGINT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_date DATE,
        due_date DATE NOT NULL,
        status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (installment_id) REFERENCES installments(id) ON DELETE CASCADE
      )
    `;
    await query(createPaymentsTable);
    console.log('✅ ตาราง payments สร้างสำเร็จ');

    // 4. Create payment_collections table
    console.log('📝 สร้างตาราง payment_collections...');
    const createPaymentCollectionsTable = `
      CREATE TABLE IF NOT EXISTS payment_collections (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        checker_id BIGINT NOT NULL,
        customer_id BIGINT NOT NULL,
        installment_id BIGINT NOT NULL,
        payment_id BIGINT,
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
      )
    `;
    await query(createPaymentCollectionsTable);
    console.log('✅ ตาราง payment_collections สร้างสำเร็จ');

    // 5. Create indexes for better performance
    console.log('📝 สร้าง indexes...');
    const indexes = [
      'CREATE INDEX idx_products_branch_id ON products(branch_id)',
      'CREATE INDEX idx_installments_branch_id ON installments(branch_id)',
      'CREATE INDEX idx_installments_customer_id ON installments(customer_id)',
      'CREATE INDEX idx_payments_installment_id ON payments(installment_id)',
      'CREATE INDEX idx_payment_collections_checker_id ON payment_collections(checker_id)',
      'CREATE INDEX idx_payment_collections_customer_id ON payment_collections(customer_id)',
      'CREATE INDEX idx_payment_collections_installment_id ON payment_collections(installment_id)',
      'CREATE INDEX idx_payment_collections_payment_date ON payment_collections(payment_date)'
    ];

    for (const indexQuery of indexes) {
      try {
        await query(indexQuery);
      } catch (error) {
        // Index might already exist, ignore error
        console.log(`ℹ️ Index อาจมีอยู่แล้ว: ${error.message}`);
      }
    }
    console.log('✅ Indexes สร้างสำเร็จ');

    // 6. Insert sample data
    console.log('📝 เพิ่มข้อมูลตัวอย่าง...');
    
    // Sample products
    const sampleProducts = [
      ['โทรศัพท์มือถือ Samsung Galaxy S21', 'สมาร์ทโฟนรุ่นใหม่จาก Samsung', 25000.00, 'โทรศัพท์', 1],
      ['โน้ตบุ๊ค Dell Inspiron 15', 'แล็ปท็อปสำหรับงานและเรียน', 35000.00, 'คอมพิวเตอร์', 1],
      ['ทีวี LG 55 นิ้ว', 'ทีวี Smart TV ขนาด 55 นิ้ว', 45000.00, 'เครื่องใช้ไฟฟ้า', 1],
      ['ตู้เย็น Samsung 2 ประตู', 'ตู้เย็นขนาดใหญ่ 2 ประตู', 28000.00, 'เครื่องใช้ไฟฟ้า', 1],
      ['เครื่องซักผ้า Panasonic', 'เครื่องซักผ้าอัตโนมัติ', 18000.00, 'เครื่องใช้ไฟฟ้า', 1]
    ];

    for (const product of sampleProducts) {
      await query(
        'INSERT INTO products (name, description, price, category, branch_id) VALUES (?, ?, ?, ?, ?)',
        product
      );
    }
    console.log('✅ ข้อมูลตัวอย่าง products เพิ่มสำเร็จ');

    console.log('🎉 สร้างตารางที่ขาดหายไปเสร็จสิ้น!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการสร้างตาราง:', error);
    throw error;
  }
}

// รัน script ถ้าเรียกโดยตรง
if (require.main === module) {
  createMissingTables()
    .then(() => {
      console.log('✅ Script เสร็จสิ้น');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script ล้มเหลว:', error);
      process.exit(1);
    });
}

module.exports = { createMissingTables }; 