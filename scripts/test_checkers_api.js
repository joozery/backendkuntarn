const { query } = require('../db/db');

async function testCheckersAPI() {
  try {
    console.log('🧪 ทดสอบ API checkers...\n');
    
    // Test 1: Check if checkers table has data
    console.log('1. ตรวจสอบข้อมูลใน checkers table...');
    const checkData = await query('SELECT COUNT(*) as count FROM checkers WHERE branch_id = 1');
    console.log(`✅ มีข้อมูล ${checkData[0].count} รายการในสาขา 1`);
    
    if (checkData[0].count === 0) {
      console.log('⚠️  ไม่มีข้อมูลใน checkers table');
      console.log('💡 รันคำสั่ง: heroku run node scripts/setup_database.js');
      return;
    }
    
    // Test 2: Simulate API query
    console.log('\n2. ทดสอบ API query...');
    const apiQuery = `
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
    `;
    
    const results = await query(apiQuery);
    console.log(`✅ API query สำเร็จ - ได้ข้อมูล ${results.length} รายการ`);
    
    // Test 3: Show sample data
    console.log('\n3. ข้อมูลตัวอย่าง:');
    results.forEach((checker, index) => {
      console.log(`   ${index + 1}. ID: ${checker.id}`);
      console.log(`      ชื่อ: ${checker.name}`);
      console.log(`      นามสกุล: ${checker.surname}`);
      console.log(`      ชื่อเต็ม: ${checker.fullName}`);
      console.log(`      เบอร์โทร: ${checker.phone}`);
      console.log(`      สถานะ: ${checker.status}`);
      console.log(`      สาขา: ${checker.branchName}`);
      console.log('');
    });
    
    // Test 4: Test search functionality
    console.log('4. ทดสอบการค้นหา...');
    const searchQuery = `
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
      AND (c.name LIKE '%สมชาย%' OR c.surname LIKE '%สมชาย%' OR c.full_name LIKE '%สมชาย%')
      ORDER BY c.created_at DESC
    `;
    
    const searchResults = await query(searchQuery);
    console.log(`✅ การค้นหา "สมชาย" - ได้ข้อมูล ${searchResults.length} รายการ`);
    
    if (searchResults.length > 0) {
      searchResults.forEach((checker, index) => {
        console.log(`   ${index + 1}. ${checker.fullName} (${checker.phone})`);
      });
    }
    
    // Test 5: Simulate API response format
    console.log('\n5. รูปแบบ API response:');
    const apiResponse = {
      success: true,
      data: results,
      count: results.length
    };
    
    console.log('✅ API Response Format:');
    console.log(JSON.stringify(apiResponse, null, 2));
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error);
  }
}

// Run the function
testCheckersAPI()
  .then(() => {
    console.log('\n🎉 การทดสอบเสร็จสิ้น');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ การทดสอบล้มเหลว:', error);
    process.exit(1);
  }); 