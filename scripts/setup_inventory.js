const { query } = require('../db/db');
const fs = require('fs');
const path = require('path');

async function setupInventory() {
  try {
    console.log('🔄 กำลังตั้งค่าตาราง inventory...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../db/create_inventory_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`📝 กำลังดำเนินการ: ${statement.substring(0, 50)}...`);
        await query(statement);
      }
    }

    console.log('✅ ตาราง inventory ตั้งค่าสำเร็จ');
    console.log('📊 ข้อมูลตัวอย่างถูกเพิ่มเรียบร้อยแล้ว');

    // Verify the setup
    const countResult = await query('SELECT COUNT(*) as total FROM inventory');
    console.log(`📈 จำนวนรายการในตาราง inventory: ${countResult[0].total}`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตั้งค่า inventory:', error);
    throw error;
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupInventory()
    .then(() => {
      console.log('🎉 การตั้งค่า inventory เสร็จสิ้น');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 การตั้งค่า inventory ล้มเหลว:', error);
      process.exit(1);
    });
}

module.exports = { setupInventory }; 