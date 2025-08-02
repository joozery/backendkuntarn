const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kuntarn_db',
  port: process.env.DB_PORT || 3306
};

async function addNewCustomers() {
  let connection;
  
  try {
    console.log('🔄 กำลังเชื่อมต่อฐานข้อมูล...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');

    // อ่านไฟล์ SQL
    const sqlFilePath = path.join(__dirname, 'add_new_customers.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    
    console.log('📄 อ่านไฟล์ SQL สำเร็จ');
    console.log('🔄 กำลังเพิ่มข้อมูลลูกค้า...');

    // แยกคำสั่ง SQL และรันทีละคำสั่ง
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('✅ เพิ่มข้อมูลลูกค้าสำเร็จ!');
    
    // ตรวจสอบจำนวนลูกค้าที่เพิ่ม
    const [rows] = await connection.execute(`
      SELECT COUNT(*) as total_customers 
      FROM customers 
      WHERE code LIKE 'CUST%'
    `);
    
    console.log(`📊 จำนวนลูกค้าทั้งหมด: ${rows[0].total_customers} คน`);
    
    // แสดงตัวอย่างข้อมูลลูกค้าที่เพิ่ม
    const [sampleRows] = await connection.execute(`
      SELECT id, code, full_name, phone, status 
      FROM customers 
      WHERE code LIKE 'CUST%' 
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    console.log('\n📋 ตัวอย่างข้อมูลลูกค้าที่เพิ่มล่าสุด:');
    sampleRows.forEach(row => {
      console.log(`  - ${row.code}: ${row.full_name} (${row.phone}) - ${row.status}`);
    });

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️  ข้อมูลซ้ำ - ลองตรวจสอบข้อมูลที่มีอยู่แล้ว');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('⚠️  ไม่พบตาราง customers - ตรวจสอบโครงสร้างฐานข้อมูล');
    }
    
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 ปิดการเชื่อมต่อฐานข้อมูล');
    }
  }
}

// รันฟังก์ชัน
if (require.main === module) {
  addNewCustomers()
    .then(() => {
      console.log('\n🎉 เสร็จสิ้นการเพิ่มข้อมูลลูกค้า!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 ล้มเหลวในการเพิ่มข้อมูลลูกค้า');
      process.exit(1);
    });
}

module.exports = { addNewCustomers }; 