const { query } = require('../db/db');

async function addTestData() {
  try {
    console.log('🔍 Adding test data for customers and contracts...');
    
    // Add test customers with checker assignments
    const testCustomers = [
      {
        code: 'CUST001',
        name: 'ทดสอบ',
        surname: 'ระบบ',
        full_name: 'ทดสอบ ระบบ',
        id_card: '1234567890123',
        nickname: 'ทดสอบ',
        phone: '081-111-1111',
        email: 'test@example.com',
        address: '123 ถนนทดสอบ กรุงเทพฯ',
        status: 'active',
        branch_id: 1,
        checker_id: 1
      },
      {
        code: 'CUST002',
        name: 'อภิรัตน์',
        surname: 'เกตุแก้ว',
        full_name: 'อภิรัตน์ เกตุแก้ว',
        id_card: '2345678901234',
        nickname: 'อภิ',
        phone: '081-222-2222',
        email: 'apirat@example.com',
        address: '456 ถนนอภิรัตน์ กรุงเทพฯ',
        status: 'active',
        branch_id: 1,
        checker_id: 1
      },
      {
        code: 'CUST003',
        name: 'สาย',
        surname: 'พุทรพงษ์',
        full_name: 'สาย พุทรพงษ์',
        id_card: '3456789012345',
        nickname: 'สาย',
        phone: '081-333-3333',
        email: 'sai@example.com',
        address: '789 ถนนสาย กรุงเทพฯ',
        status: 'active',
        branch_id: 1,
        checker_id: 2
      },
      {
        code: 'CUST004',
        name: 'สมชาย',
        surname: 'อุ่นจิต',
        full_name: 'สมชาย อุ่นจิต',
        id_card: '4567890123456',
        nickname: 'ชาย',
        phone: '081-444-4444',
        email: 'somchai@example.com',
        address: '111 ถนนสมชาย กรุงเทพฯ',
        status: 'active',
        branch_id: 1,
        checker_id: 2
      },
      {
        code: 'CUST005',
        name: 'รณไชยรรรม',
        surname: 'กลิ่นทอง',
        full_name: 'รณไชยรรรม กลิ่นทอง',
        id_card: '5678901234567',
        nickname: 'รณ',
        phone: '081-555-5555',
        email: 'ronachai@example.com',
        address: '222 ถนนรณไชย กรุงเทพฯ',
        status: 'active',
        branch_id: 1,
        checker_id: 3
      },
      {
        code: 'CUST006',
        name: 'ราชัน',
        surname: 'ชื่นชม',
        full_name: 'ราชัน ชื่นชม',
        id_card: '6789012345678',
        nickname: 'ราชัน',
        phone: '081-666-6666',
        email: 'rachan@example.com',
        address: '333 ถนนราชัน กรุงเทพฯ',
        status: 'active',
        branch_id: 1,
        checker_id: 3
      },
      {
        code: 'CUST007',
        name: 'พีระ',
        surname: 'โรจนทนงค์',
        full_name: 'พีระ โรจนทนงค์',
        id_card: '7890123456789',
        nickname: 'พีระ',
        phone: '081-777-7777',
        email: 'pira@example.com',
        address: '444 ถนนพีระ กรุงเทพฯ',
        status: 'active',
        branch_id: 1,
        checker_id: 4
      }
    ];
    
    // Insert customers
    for (const customer of testCustomers) {
      try {
        await query(`
          INSERT INTO customers (
            code, name, surname, full_name, id_card, nickname, phone, email, address, 
            status, branch_id, checker_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          customer.code, customer.name, customer.surname, customer.full_name,
          customer.id_card, customer.nickname, customer.phone, customer.email,
          customer.address, customer.status, customer.branch_id, customer.checker_id
        ]);
        
        console.log(`✅ Added customer: ${customer.full_name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Customer ${customer.full_name} already exists`);
        } else {
          console.error(`❌ Error adding customer ${customer.full_name}:`, error.message);
        }
      }
    }
    
    // Get the customer IDs we just created
    const customerIds = await query('SELECT id, full_name FROM customers WHERE code LIKE "CUST%" ORDER BY id DESC LIMIT 7');
    
    // Add test contracts
    const testContracts = [
      {
        contract_number: 'CT250729001',
        customer_id: customerIds[0]?.id,
        product_id: 1,
        product_name: 'โทรศัพท์มือถือ Samsung Galaxy S21',
        total_amount: 25000.00,
        installment_amount: 2500.00,
        remaining_amount: 22500.00,
        installment_period: 10,
        start_date: '2024-07-01',
        end_date: '2025-04-01',
        branch_id: 1,
        salesperson_id: 1,
        inspector_id: 1,
        status: 'active'
      },
      {
        contract_number: 'CT250729002',
        customer_id: customerIds[1]?.id,
        product_id: 2,
        product_name: 'โน้ตบุ๊ค Dell Inspiron 15',
        total_amount: 35000.00,
        installment_amount: 3500.00,
        remaining_amount: 31500.00,
        installment_period: 10,
        start_date: '2024-07-15',
        end_date: '2025-04-15',
        branch_id: 1,
        salesperson_id: 1,
        inspector_id: 1,
        status: 'active'
      },
      {
        contract_number: 'CT250729003',
        customer_id: customerIds[2]?.id,
        product_id: 3,
        product_name: 'ทีวี LG 55 นิ้ว',
        total_amount: 45000.00,
        installment_amount: 4500.00,
        remaining_amount: 40500.00,
        installment_period: 10,
        start_date: '2024-08-01',
        end_date: '2025-05-01',
        branch_id: 1,
        salesperson_id: 1,
        inspector_id: 2,
        status: 'active'
      },
      {
        contract_number: 'CT250729004',
        customer_id: customerIds[3]?.id,
        product_id: 4,
        product_name: 'ตู้เย็น Samsung 2 ประตู',
        total_amount: 28000.00,
        installment_amount: 2800.00,
        remaining_amount: 25200.00,
        installment_period: 10,
        start_date: '2024-08-15',
        end_date: '2025-05-15',
        branch_id: 1,
        salesperson_id: 1,
        inspector_id: 2,
        status: 'active'
      },
      {
        contract_number: 'CT250729005',
        customer_id: customerIds[4]?.id,
        product_id: 5,
        product_name: 'เครื่องซักผ้า Panasonic',
        total_amount: 18000.00,
        installment_amount: 1800.00,
        remaining_amount: 16200.00,
        installment_period: 10,
        start_date: '2024-09-01',
        end_date: '2025-06-01',
        branch_id: 1,
        salesperson_id: 1,
        inspector_id: 3,
        status: 'active'
      },
      {
        contract_number: 'CT250729006',
        customer_id: customerIds[5]?.id,
        product_id: 6,
        product_name: 'แอร์คอนดิชัน Daikin',
        total_amount: 22000.00,
        installment_amount: 2200.00,
        remaining_amount: 19800.00,
        installment_period: 10,
        start_date: '2024-09-15',
        end_date: '2025-06-15',
        branch_id: 1,
        salesperson_id: 1,
        inspector_id: 3,
        status: 'active'
      },
      {
        contract_number: 'CT250729007',
        customer_id: customerIds[6]?.id,
        product_id: 1,
        product_name: 'โทรศัพท์มือถือ Samsung Galaxy S21',
        total_amount: 25000.00,
        installment_amount: 2500.00,
        remaining_amount: 22500.00,
        installment_period: 10,
        start_date: '2024-10-01',
        end_date: '2025-07-01',
        branch_id: 1,
        salesperson_id: 1,
        inspector_id: 4,
        status: 'active'
      }
    ];
    
    // Insert contracts
    for (const contract of testContracts) {
      if (!contract.customer_id) continue;
      
      try {
        await query(`
          INSERT INTO installments (
            contract_number, customer_id, product_id, product_name, total_amount,
            installment_amount, remaining_amount, installment_period, start_date, end_date,
            branch_id, salesperson_id, inspector_id, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          contract.contract_number, contract.customer_id, contract.product_id,
          contract.product_name, contract.total_amount, contract.installment_amount,
          contract.remaining_amount, contract.installment_period, contract.start_date,
          contract.end_date, contract.branch_id, contract.salesperson_id,
          contract.inspector_id, contract.status
        ]);
        
        console.log(`✅ Added contract: ${contract.contract_number}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Contract ${contract.contract_number} already exists`);
        } else {
          console.error(`❌ Error adding contract ${contract.contract_number}:`, error.message);
        }
      }
    }
    
    console.log('✅ Test data added successfully!');
    
    // Show summary
    const customersWithCheckers = await query(`
      SELECT 
        c.full_name as customer_name,
        ch.full_name as checker_name,
        COUNT(i.id) as contract_count
      FROM customers c
      LEFT JOIN checkers ch ON c.checker_id = ch.id
      LEFT JOIN installments i ON c.id = i.customer_id
      WHERE c.code LIKE 'CUST%'
      GROUP BY c.id, c.full_name, ch.full_name
      ORDER BY ch.full_name, c.full_name
    `);
    
    console.log('\n📊 Summary of test data:');
    customersWithCheckers.forEach(c => {
      console.log(`  - ${c.customer_name} → ${c.checker_name} (${c.contract_count} contracts)`);
    });
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  }
}

// Run the script
addTestData()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 