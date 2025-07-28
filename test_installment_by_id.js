const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testInstallmentById() {
  console.log('🔍 Testing Installment by ID API...\n');

  try {
    // Test with contract ID 9 (from debug info)
    const contractId = 9;
    console.log(`1. Testing /api/installments/${contractId}...`);
    
    const response = await axios.get(`${BASE_URL}/installments/${contractId}`);
    console.log('✅ Response status:', response.status);
    console.log('✅ Response success:', response.data?.success);
    
    if (response.data?.success && response.data?.data) {
      const contract = response.data.data;
      console.log('📋 Contract data:');
      console.log('  - ID:', contract.id);
      console.log('  - Contract Number:', contract.contractNumber);
      console.log('  - Customer Name:', contract.customerName);
      console.log('  - Product Name:', contract.productName);
      console.log('  - Total Amount:', contract.totalAmount);
      console.log('  - Branch ID:', contract.branchId);
      console.log('  - Customer ID:', contract.customerId);
      console.log('  - Product ID:', contract.productId);
      
      console.log('\n📋 Customer Details:');
      console.log('  - Title:', contract.customerDetails?.title);
      console.log('  - Name:', contract.customerDetails?.name);
      console.log('  - Surname:', contract.customerDetails?.surname);
      console.log('  - Phone:', contract.customerDetails?.phone1);
      
      console.log('\n📋 Product Details:');
      console.log('  - Name:', contract.productDetails?.name);
      console.log('  - Description:', contract.productDetails?.description);
      console.log('  - Price:', contract.productDetails?.price);
      
      console.log('\n📋 Plan Details:');
      console.log('  - Down Payment:', contract.plan?.downPayment);
      console.log('  - Monthly Payment:', contract.plan?.monthlyPayment);
      console.log('  - Months:', contract.plan?.months);
      
      console.log('\n🔍 All contract keys:', Object.keys(contract));
    } else {
      console.log('❌ No data in response');
    }

  } catch (error) {
    console.error('❌ Error testing installment by ID:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testInstallmentById(); 