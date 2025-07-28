const { query } = require('../db/db');

async function quickTest() {
  try {
    console.log('🧪 Quick test checkers API...\n');
    
    // Test 1: Check if table exists
    console.log('1. ตรวจสอบ checkers table...');
    const tables = await query('SHOW TABLES LIKE "checkers"');
    if (tables.length === 0) {
      console.log('❌ checkers table ไม่มีอยู่');
      return;
    }
    console.log('✅ checkers table มีอยู่');
    
    // Test 2: Check data count
    console.log('\n2. ตรวจสอบจำนวนข้อมูล...');
    const count = await query('SELECT COUNT(*) as count FROM checkers WHERE branch_id = 1');
    console.log(`✅ มีข้อมูล ${count[0].count} รายการ`);
    
    if (count[0].count === 0) {
      console.log('⚠️  ไม่มีข้อมูล - รัน: heroku run node scripts/setup_database.js');
      return;
    }
    
    // Test 3: Get sample data
    console.log('\n3. ข้อมูลตัวอย่าง:');
    const data = await query(`
      SELECT id, name, surname, full_name as fullName, phone, status 
      FROM checkers 
      WHERE branch_id = 1 
      LIMIT 3
    `);
    
    data.forEach((checker, index) => {
      console.log(`   ${index + 1}. ${checker.fullName} (${checker.phone}) - ${checker.status}`);
    });
    
    console.log('\n✅ การทดสอบเสร็จสิ้น');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest().then(() => process.exit(0)); 