const { query } = require('../db/db');
const fs = require('fs');
const path = require('path');

async function setupCollectors() {
  try {
    console.log('🔄 กำลังตั้งค่าตาราง collectors...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../db/create_collectors_table.sql');
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

    console.log('✅ ตาราง collectors ตั้งค่าสำเร็จ');
    console.log('📊 ข้อมูลตัวอย่างถูกเพิ่มเรียบร้อยแล้ว');

    // Verify the setup
    const countResult = await query('SELECT COUNT(*) as total FROM collectors');
    console.log(`📈 จำนวนรายการในตาราง collectors: ${countResult[0].total}`);

    // Show sample data
    const sampleResult = await query('SELECT id, code, full_name, position, status FROM collectors LIMIT 3');
    console.log('📋 ข้อมูลตัวอย่าง:');
    sampleResult.forEach(collector => {
      console.log(`   - ${collector.code}: ${collector.full_name} (${collector.position}) - ${collector.status}`);
    });

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตั้งค่า collectors:', error);
    throw error;
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupCollectors()
    .then(() => {
      console.log('🎉 การตั้งค่า collectors เสร็จสิ้น');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 การตั้งค่า collectors ล้มเหลว:', error);
      process.exit(1);
    });
}

module.exports = { setupCollectors }; 