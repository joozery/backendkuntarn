const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCheckersAPI() {
  console.log('🔍 Testing Checkers API...\n');

  try {
    // Test 1: Get all checkers without branch filter
    console.log('1. Testing /api/checkers (all checkers)...');
    const allCheckersResponse = await axios.get(`${BASE_URL}/checkers`);
    console.log('✅ All checkers response:', {
      status: allCheckersResponse.status,
      dataCount: allCheckersResponse.data?.data?.length || 0,
      success: allCheckersResponse.data?.success
    });
    
    if (allCheckersResponse.data?.data?.length > 0) {
      console.log('📋 Sample checkers:');
      allCheckersResponse.data.data.slice(0, 3).forEach((checker, index) => {
        console.log(`   ${index + 1}. ${checker.fullName} (Branch: ${checker.branchId})`);
      });
    }

    // Test 2: Get checkers for branch 1
    console.log('\n2. Testing /api/checkers?branchId=1...');
    const branch1CheckersResponse = await axios.get(`${BASE_URL}/checkers?branchId=1`);
    console.log('✅ Branch 1 checkers response:', {
      status: branch1CheckersResponse.status,
      dataCount: branch1CheckersResponse.data?.data?.length || 0,
      success: branch1CheckersResponse.data?.success
    });
    
    if (branch1CheckersResponse.data?.data?.length > 0) {
      console.log('📋 Branch 1 checkers:');
      branch1CheckersResponse.data.data.forEach((checker, index) => {
        console.log(`   ${index + 1}. ${checker.fullName} - ${checker.phone}`);
      });
    }

    // Test 3: Get checkers for branch 4 (ประจวบคีรีขันธ์)
    console.log('\n3. Testing /api/checkers?branchId=4...');
    const branch4CheckersResponse = await axios.get(`${BASE_URL}/checkers?branchId=4`);
    console.log('✅ Branch 4 checkers response:', {
      status: branch4CheckersResponse.status,
      dataCount: branch4CheckersResponse.data?.data?.length || 0,
      success: branch4CheckersResponse.data?.success
    });
    
    if (branch4CheckersResponse.data?.data?.length > 0) {
      console.log('📋 Branch 4 checkers:');
      branch4CheckersResponse.data.data.forEach((checker, index) => {
        console.log(`   ${index + 1}. ${checker.fullName} - ${checker.phone}`);
      });
    }

    // Test 4: Search checkers
    console.log('\n4. Testing /api/checkers?search=อนุชิต...');
    const searchCheckersResponse = await axios.get(`${BASE_URL}/checkers?search=อนุชิต`);
    console.log('✅ Search checkers response:', {
      status: searchCheckersResponse.status,
      dataCount: searchCheckersResponse.data?.data?.length || 0,
      success: searchCheckersResponse.data?.success
    });

    // Test 5: Get specific checker by ID
    if (allCheckersResponse.data?.data?.length > 0) {
      const firstChecker = allCheckersResponse.data.data[0];
      console.log(`\n5. Testing /api/checkers/${firstChecker.id}...`);
      const specificCheckerResponse = await axios.get(`${BASE_URL}/checkers/${firstChecker.id}`);
      console.log('✅ Specific checker response:', {
        status: specificCheckerResponse.status,
        checkerName: specificCheckerResponse.data?.data?.fullName,
        success: specificCheckerResponse.data?.success
      });
    }

  } catch (error) {
    console.error('❌ Error testing checkers API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testCheckersAPI(); 