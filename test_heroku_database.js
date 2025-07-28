const axios = require('axios');

const HEROKU_URL = 'https://backendkuntarn-e0ddf979d118.herokuapp.com/api';

async function testHerokuDatabase() {
  console.log('🔍 Testing Heroku Database...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${HEROKU_URL}/health`);
    console.log('✅ Health status:', healthResponse.status);
    console.log('✅ Health data:', healthResponse.data);

    // Test 2: Get all installments
    console.log('\n2. Testing installments endpoint...');
    const installmentsResponse = await axios.get(`${HEROKU_URL}/installments`);
    console.log('✅ Installments status:', installmentsResponse.status);
    
    if (installmentsResponse.data?.success) {
      const contracts = installmentsResponse.data.data;
      console.log('✅ Total contracts:', contracts.length);
      
      if (contracts.length > 0) {
        console.log('📋 Available contracts:');
        contracts.forEach(contract => {
          console.log(`   ID ${contract.id}: ${contract.contractNumber} (${contract.customerName})`);
        });
      }
    }

    // Test 3: Get specific contract (ID 9)
    console.log('\n3. Testing contract ID 9...');
    try {
      const contractResponse = await axios.get(`${HEROKU_URL}/installments/9`);
      console.log('✅ Contract 9 status:', contractResponse.status);
      
      if (contractResponse.data?.success) {
        const contract = contractResponse.data.data;
        console.log('📋 Contract 9 data:');
        console.log('   - ID:', contract.id);
        console.log('   - Contract Number:', contract.contractNumber);
        console.log('   - Customer Name:', contract.customerName);
        console.log('   - Product Name:', contract.productName);
        console.log('   - Total Amount:', contract.totalAmount);
        console.log('   - Branch ID:', contract.branchId);
      }
    } catch (error) {
      console.log('❌ Contract 9 not found:', error.response?.status, error.response?.data?.error);
    }

    // Test 4: Get checkers
    console.log('\n4. Testing checkers endpoint...');
    const checkersResponse = await axios.get(`${HEROKU_URL}/checkers?branchId=1`);
    console.log('✅ Checkers status:', checkersResponse.status);
    
    if (checkersResponse.data?.success) {
      const checkers = checkersResponse.data.data;
      console.log('✅ Branch 1 checkers:', checkers.length);
      
      if (checkers.length > 0) {
        console.log('📋 Checkers:');
        checkers.forEach(checker => {
          console.log(`   - ${checker.fullName} (${checker.phone})`);
        });
      }
    }

    // Test 5: Get customers
    console.log('\n5. Testing customers endpoint...');
    const customersResponse = await axios.get(`${HEROKU_URL}/customers`);
    console.log('✅ Customers status:', customersResponse.status);
    
    if (customersResponse.data?.success) {
      const customers = customersResponse.data.data;
      console.log('✅ Total customers:', customers.length);
    }

    // Test 6: Get products
    console.log('\n6. Testing products endpoint...');
    const productsResponse = await axios.get(`${HEROKU_URL}/products`);
    console.log('✅ Products status:', productsResponse.status);
    
    if (productsResponse.data?.success) {
      const products = productsResponse.data.data;
      console.log('✅ Total products:', products.length);
    }

  } catch (error) {
    console.error('❌ Error testing Heroku:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testHerokuDatabase(); 