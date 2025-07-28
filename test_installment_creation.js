const axios = require('axios');

// Test data for creating a new installment
const testContractData = {
  contractNumber: 'CT2401001',
  contractDate: '2024-01-01',
  customerId: 1,
  customerDetails: {
    title: 'นาย',
    name: 'สมชาย',
    surname: 'ใจดี',
    nickname: 'ชาย',
    age: '30',
    idCard: '1234567890123',
    address: '123 ถนนสุขุมวิท',
    moo: '1',
    road: 'สุขุมวิท',
    subdistrict: 'คลองเตย',
    district: 'คลองเตย',
    province: 'กรุงเทพฯ',
    phone1: '081-111-1111',
    phone2: '081-222-2222',
    phone3: '081-333-3333',
    email: 'test@example.com'
  },
  guarantorId: 2,
  guarantorDetails: {
    title: 'นาง',
    name: 'สมหญิง',
    surname: 'รักดี',
    nickname: 'หญิง',
    age: '28',
    idCard: '9876543210987',
    address: '456 ถนนรามคำแหง',
    moo: '2',
    road: 'รามคำแหง',
    subdistrict: 'หัวหมาก',
    district: 'บางกะปิ',
    province: 'กรุงเทพฯ',
    phone1: '082-111-1111',
    phone2: '082-222-2222',
    phone3: '082-333-3333',
    email: 'guarantor@example.com'
  },
  productId: 1,
  productDetails: {
    name: 'โทรศัพท์มือถือ Samsung Galaxy S21',
    description: 'สมาร์ทโฟนรุ่นใหม่จาก Samsung',
    price: '25000',
    category: 'อิเล็กทรอนิกส์',
    model: 'Samsung Galaxy S21',
    serialNumber: 'SN123456789'
  },
  plan: {
    downPayment: '5000',
    monthlyPayment: '2000',
    months: '10',
    collectionDate: '15'
  },
  salespersonId: 1,
  inspectorId: 1,
  line: '1',
  productName: 'โทรศัพท์มือถือ Samsung Galaxy S21',
  totalAmount: 25000,
  installmentPeriod: 10,
  startDate: '2024-01-01',
  endDate: '2024-10-01',
  branchId: 1
};

async function testInstallmentCreation() {
  try {
    console.log('🧪 Testing installment creation...');
    console.log('📤 Sending data:', JSON.stringify(testContractData, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/installments', testContractData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response:', JSON.stringify(response.data, null, 2));
    
    // Test getting the created installment
    if (response.data.success && response.data.data.id) {
      console.log('\n🔍 Testing GET installment by ID...');
      const getResponse = await axios.get(`http://localhost:3001/api/installments/${response.data.data.id}`);
      console.log('✅ GET Response:', JSON.stringify(getResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testInstallmentCreation(); 