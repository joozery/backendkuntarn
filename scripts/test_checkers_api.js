const { query } = require('../db/db');

async function testCheckersAPI() {
  console.log('🔍 Testing Checkers API...\n');

  try {
    // 1. Check if checkers table exists
    console.log('1. Checking if checkers table exists...');
    const tableCheck = await query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'checkers'
    `);
    
    if (tableCheck[0].count === 0) {
      console.log('❌ checkers table does not exist!');
      return;
    }
    console.log('✅ checkers table exists');

    // 2. Check table structure
    console.log('\n2. Checking table structure...');
    const structure = await query(`
      DESCRIBE checkers
    `);
    console.log('Table structure:', structure.map(col => `${col.Field} (${col.Type})`));

    // 3. Check data count
    console.log('\n3. Checking data count...');
    const countResult = await query('SELECT COUNT(*) as count FROM checkers');
    const count = countResult[0].count;
    console.log(`Total checkers: ${count}`);

    if (count === 0) {
      console.log('❌ No data in checkers table!');
      console.log('💡 Run: heroku run node scripts/setup_database.js');
      return;
    }

    // 4. Get sample data
    console.log('\n4. Sample data:');
    const sampleData = await query(`
      SELECT 
        id, 
        name, 
        surname, 
        full_name as fullName,
        phone,
        branch_id as branchId,
        status
      FROM checkers 
      LIMIT 5
    `);
    
    sampleData.forEach((checker, index) => {
      console.log(`${index + 1}. ${checker.fullName || `${checker.name} ${checker.surname}`} (ID: ${checker.id}, Branch: ${checker.branchId})`);
    });

    // 5. Test API query with branchId=1
    console.log('\n5. Testing API query with branchId=1...');
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
    
    const apiResults = await query(apiQuery);
    console.log(`API query results for branchId=1: ${apiResults.length} records`);
    
    apiResults.forEach((checker, index) => {
      console.log(`${index + 1}. ${checker.fullName} (ID: ${checker.id})`);
    });

    console.log('\n✅ Checkers API test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing checkers API:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
  }
}

// Run the test
testCheckersAPI()
  .then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }); 