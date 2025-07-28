const { query } = require('../db/db');

async function checkCheckersTable() {
  try {
    console.log('🔍 ตรวจสอบ checkers table...\n');
    
    // Check if table exists
    console.log('1. ตรวจสอบว่า checkers table มีอยู่หรือไม่...');
    try {
      const tableCheck = await query('SHOW TABLES LIKE "checkers"');
      if (tableCheck.length > 0) {
        console.log('✅ checkers table มีอยู่');
      } else {
        console.log('❌ checkers table ไม่มีอยู่');
        return;
      }
    } catch (error) {
      console.log('❌ Error checking table:', error.message);
      return;
    }
    
    // Check table structure
    console.log('\n2. ตรวจสอบโครงสร้างของ checkers table...');
    try {
      const structure = await query('DESCRIBE checkers');
      console.log('✅ โครงสร้าง table:');
      structure.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });
    } catch (error) {
      console.log('❌ Error checking structure:', error.message);
    }
    
    // Check data count
    console.log('\n3. ตรวจสอบจำนวนข้อมูลใน checkers table...');
    try {
      const countResult = await query('SELECT COUNT(*) as count FROM checkers');
      const count = countResult[0].count;
      console.log(`✅ มีข้อมูล ${count} รายการ`);
      
      if (count > 0) {
        // Show sample data
        console.log('\n4. ข้อมูลตัวอย่าง:');
        const sampleData = await query('SELECT * FROM checkers LIMIT 3');
        sampleData.forEach((row, index) => {
          console.log(`   ${index + 1}. ${row.full_name} (${row.phone}) - ${row.status}`);
        });
      } else {
        console.log('⚠️  ไม่มีข้อมูลใน checkers table');
      }
    } catch (error) {
      console.log('❌ Error checking data:', error.message);
    }
    
    // Test API endpoint
    console.log('\n5. ทดสอบ API endpoint...');
    try {
      const apiTest = await query(`
        SELECT 
          c.id,
          c.name,
          c.surname,
          c.full_name as fullName,
          c.phone,
          c.email,
          c.status,
          c.branch_id as branchId,
          c.created_at as createdAt,
          c.updated_at as updatedAt,
          b.name as branchName
        FROM checkers c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE c.branch_id = 1
        ORDER BY c.created_at DESC
      `);
      
      console.log(`✅ API query สำเร็จ - ได้ข้อมูล ${apiTest.length} รายการ`);
      if (apiTest.length > 0) {
        console.log('   ตัวอย่างข้อมูล API:');
        apiTest.slice(0, 2).forEach((row, index) => {
          console.log(`   ${index + 1}. ${row.fullName} (${row.phone}) - ${row.branchName}`);
        });
      }
    } catch (error) {
      console.log('❌ Error testing API:', error.message);
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตรวจสอบ:', error);
  }
}

// Run the function
checkCheckersTable()
  .then(() => {
    console.log('\n🎉 การตรวจสอบเสร็จสิ้น');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ การตรวจสอบล้มเหลว:', error);
    process.exit(1);
  }); 