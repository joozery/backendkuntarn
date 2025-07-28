const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPIEndpoints() {
  console.log('🔍 Testing API endpoints...\n');

  try {
    // Test checkers endpoint
    console.log('1. Testing /api/checkers...');
    const checkersResponse = await axios.get(`${BASE_URL}/checkers?branchId=1`);
    console.log('✅ Checkers response:', {
      status: checkersResponse.status,
      dataCount: checkersResponse.data?.data?.length || 0,
      success: checkersResponse.data?.success
    });

    // Test installments endpoint
    console.log('\n2. Testing /api/installments...');
    const installmentsResponse = await axios.get(`${BASE_URL}/installments?branchId=1`);
    console.log('✅ Installments response:', {
      status: installmentsResponse.status,
      dataCount: installmentsResponse.data?.data?.length || 0,
      success: installmentsResponse.data?.success
    });

    // Test specific installment
    if (installmentsResponse.data?.data?.length > 0) {
      const firstInstallment = installmentsResponse.data.data[0];
      console.log('\n3. Testing /api/installments/:id...');
      console.log('🔍 Testing with ID:', firstInstallment.id);
      
      const installmentResponse = await axios.get(`${BASE_URL}/installments/${firstInstallment.id}`);
      console.log('✅ Specific installment response:', {
        status: installmentResponse.status,
        contractNumber: installmentResponse.data?.data?.contractNumber,
        customerName: installmentResponse.data?.data?.customerName,
        success: installmentResponse.data?.success
      });
    }

    // Test customers endpoint
    console.log('\n4. Testing /api/customers...');
    const customersResponse = await axios.get(`${BASE_URL}/customers?branchId=1`);
    console.log('✅ Customers response:', {
      status: customersResponse.status,
      dataCount: customersResponse.data?.data?.length || 0,
      success: customersResponse.data?.success
    });

    // Test products endpoint
    console.log('\n5. Testing /api/products...');
    const productsResponse = await axios.get(`${BASE_URL}/products?branchId=1`);
    console.log('✅ Products response:', {
      status: productsResponse.status,
      dataCount: productsResponse.data?.data?.length || 0,
      success: productsResponse.data?.success
    });

    // Test employees endpoint
    console.log('\n6. Testing /api/employees...');
    const employeesResponse = await axios.get(`${BASE_URL}/employees?branchId=1`);
    console.log('✅ Employees response:', {
      status: employeesResponse.status,
      dataCount: employeesResponse.data?.data?.length || 0,
      success: employeesResponse.data?.success
    });

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAPIEndpoints(); 