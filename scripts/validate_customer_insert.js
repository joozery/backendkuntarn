const { query } = require('../db/db');

// Sample customer data from your error
const customerData = [
  {
    title: 'นาย',
    name: 'วสันต์',
    surname: 'ฉิมละมัย',
    full_name: 'นายวสันต์ ฉิมละมัย',
    address: '6/1 ม.3 ต.ทับสะแก อ.ทับสะแก จ.ประจวบคีรีขันธ์',
    id_card: '1770300044765',
    nickname: 'กั้ง',
    phone: '0623406288',
    branch_id: 1,
    status: 'active',
    code: 'CUST087'
  },
  {
    title: 'นางสาว',
    name: 'มลทิรา',
    surname: 'จันทร์แก้ว',
    full_name: 'นางสาวมลทิรา จันทร์แก้ว',
    address: '27 ม.12 ต.ร่อนทอง อ.บางสะพาน จ.ประจวบคีรีขันธ์',
    id_card: '1770400199574',
    nickname: 'จูน',
    phone: '0623503950',
    branch_id: 1,
    status: 'active',
    code: 'CUST088'
  },
  {
    title: 'นางสาว',
    name: 'รัตนา',
    surname: 'แย้มพราย',
    full_name: 'นางสาวรัตนา แย้มพราย',
    address: '82/2 ม.6 ต.ทับสะแก อ.ทับสะแก จ.ประจวบคีรีขันธ์',
    id_card: '3219900015480',
    nickname: 'พี่รัตน์',
    phone: '0926484894',
    branch_id: 1,
    status: 'active',
    code: 'CUST089'
  },
  {
    title: 'นางสาว',
    name: 'เมทินี',
    surname: 'พิมพ์วัฒน์',
    full_name: 'นางสาวเมทินี พิมพ์วัฒน์',
    address: '56/6 ม.10 ต.ห้วยยาง อ.ทับสะแก จ.ประจวบคีรีขันธ์',
    id_card: '1309701244538',
    nickname: 'น้องเมย์',
    phone: '0930027499',
    branch_id: 1,
    status: 'active',
    code: 'CUST090'
  },
  {
    title: 'นางสาว',
    name: 'สายใจ',
    surname: 'ขาวสะอาด',
    full_name: 'นางสาวสายใจ ขาวสะอาด',
    address: '123/45 ม.7 ต.บางสะพาน อ.บางสะพาน จ.ประจวบคีรีขันธ์',
    id_card: null, // This is causing the error
    nickname: 'สาย',
    phone: '0812345678',
    branch_id: 1,
    status: 'active',
    code: 'CUST091'
  }
];

async function validateAndFixCustomerData() {
  try {
    console.log('🔍 Validating customer data...');
    
    const validCustomers = [];
    const invalidCustomers = [];
    
    for (let i = 0; i < customerData.length; i++) {
      const customer = customerData[i];
      
      // Check for required fields
      const issues = [];
      
      if (!customer.id_card || customer.id_card === null || customer.id_card === '') {
        issues.push('Missing id_card');
        // Generate a temporary id_card
        customer.id_card = `TEMP${Date.now()}${i}`;
      }
      
      if (!customer.code || customer.code === null || customer.code === '') {
        issues.push('Missing code');
      }
      
      if (!customer.name || customer.name === null || customer.name === '') {
        issues.push('Missing name');
      }
      
      if (!customer.full_name || customer.full_name === null || customer.full_name === '') {
        issues.push('Missing full_name');
      }
      
      if (issues.length > 0) {
        invalidCustomers.push({
          index: i,
          customer,
          issues
        });
      } else {
        validCustomers.push(customer);
      }
    }
    
    console.log(`✅ Valid customers: ${validCustomers.length}`);
    console.log(`❌ Invalid customers: ${invalidCustomers.length}`);
    
    if (invalidCustomers.length > 0) {
      console.log('\n📋 Invalid customers:');
      invalidCustomers.forEach(item => {
        console.log(`  Customer ${item.index + 1}:`);
        console.log(`    Issues: ${item.issues.join(', ')}`);
        console.log(`    Name: ${item.customer.name} ${item.customer.surname}`);
        console.log(`    Code: ${item.customer.code}`);
        console.log(`    ID Card: ${item.customer.id_card}`);
        console.log('');
      });
    }
    
    // Generate corrected INSERT statement
    console.log('\n📝 Corrected INSERT statement:');
    console.log('-- Insert ข้อมูลลูกค้า (แก้ไขแล้ว)');
    console.log('INSERT INTO customers (');
    console.log('  title, name, surname, full_name, address, id_card, nickname, phone,');
    console.log('  branch_id, status, code, created_at, updated_at');
    console.log(') VALUES');
    
    const values = validCustomers.map(customer => {
      return `  ('${customer.title}', '${customer.name}', '${customer.surname}', '${customer.full_name}', '${customer.address}', '${customer.id_card}', '${customer.nickname}', '${customer.phone}', ${customer.branch_id}, '${customer.status}', '${customer.code}', NOW(), NOW())`;
    });
    
    console.log(values.join(',\n'));
    console.log(';');
    
    // Test insertion
    console.log('\n🧪 Testing insertion...');
    
    for (const customer of validCustomers) {
      try {
        const result = await query(`
          INSERT INTO customers (
            title, name, surname, full_name, address, id_card, nickname, phone,
            branch_id, status, code, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          customer.title, customer.name, customer.surname, customer.full_name,
          customer.address, customer.id_card, customer.nickname, customer.phone,
          customer.branch_id, customer.status, customer.code
        ]);
        
        console.log(`✅ Successfully inserted customer: ${customer.name} ${customer.surname} (ID: ${result.insertId})`);
      } catch (error) {
        console.error(`❌ Failed to insert customer ${customer.name} ${customer.surname}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error validating customer data:', error);
  } finally {
    process.exit(0);
  }
}

// Run the validation
validateAndFixCustomerData(); 