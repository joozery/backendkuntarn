const { query } = require('./db/db');

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');

  try {
    // Test 1: Check if checkers table exists and has data
    console.log('1. Testing checkers table...');
    const checkersCount = await query('SELECT COUNT(*) as count FROM checkers');
    console.log('✅ Checkers count:', checkersCount[0].count);

    // Test 2: Get all checkers
    console.log('\n2. Getting all checkers...');
    const allCheckers = await query('SELECT * FROM checkers LIMIT 5');
    console.log('✅ All checkers (first 5):');
    allCheckers.forEach((checker, index) => {
      console.log(`   ${index + 1}. ${checker.full_name} (Branch: ${checker.branch_id})`);
    });

    // Test 3: Get checkers for branch 1
    console.log('\n3. Getting checkers for branch 1...');
    const branch1Checkers = await query('SELECT * FROM checkers WHERE branch_id = ?', [1]);
    console.log('✅ Branch 1 checkers count:', branch1Checkers.length);
    branch1Checkers.forEach((checker, index) => {
      console.log(`   ${index + 1}. ${checker.full_name} - ${checker.phone}`);
    });

    // Test 4: Get checkers for branch 4 (ประจวบคีรีขันธ์)
    console.log('\n4. Getting checkers for branch 4...');
    const branch4Checkers = await query('SELECT * FROM checkers WHERE branch_id = ?', [4]);
    console.log('✅ Branch 4 checkers count:', branch4Checkers.length);
    branch4Checkers.forEach((checker, index) => {
      console.log(`   ${index + 1}. ${checker.full_name} - ${checker.phone}`);
    });

    // Test 5: Check branches table
    console.log('\n5. Checking branches table...');
    const branches = await query('SELECT * FROM branches');
    console.log('✅ Branches:');
    branches.forEach((branch, index) => {
      console.log(`   ${index + 1}. ${branch.name} (ID: ${branch.id})`);
    });

    // Test 6: Test the exact query used in API
    console.log('\n6. Testing API query...');
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
      WHERE c.branch_id = ?
      ORDER BY c.created_at DESC
    `;
    
    const apiResults = await query(apiQuery, [1]);
    console.log('✅ API query results for branch 1:', apiResults.length);
    apiResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.fullName} (${result.branchName})`);
    });

  } catch (error) {
    console.error('❌ Database test error:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testDatabaseConnection(); 