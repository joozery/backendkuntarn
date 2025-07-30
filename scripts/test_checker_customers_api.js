const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kuntarn_db'
};

async function testCheckerCustomersAPI() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 Connected to database');
    
    // Test the exact query from the API
    const checkerId = 1;
    const sqlQuery = `
      SELECT DISTINCT
        c.id,
        c.code,
        c.name,
        c.surname,
        c.full_name,
        c.nickname,
        c.id_card,
        c.phone1,
        c.phone2,
        c.phone3,
        c.email,
        c.address,
        c.status,
        c.guarantor_name,
        c.guarantor_id_card,
        c.guarantor_nickname,
        COUNT(i.id) as contract_count,
        SUM(i.total_amount) as total_contracts_amount,
        MAX(i.contract_date) as latest_contract_date,
        GROUP_CONCAT(DISTINCT i.contract_number ORDER BY i.contract_date DESC SEPARATOR ', ') as contract_numbers
      FROM customers c
      INNER JOIN installments i ON c.id = i.customer_id
      WHERE i.inspector_id = ?
      GROUP BY c.id
      ORDER BY c.full_name ASC
      LIMIT 5
    `;
    
    console.log('🔍 Testing query for checker ID:', checkerId);
    console.log('🔍 SQL Query:', sqlQuery);
    
    const [customers] = await connection.execute(sqlQuery, [checkerId]);
    
    console.log('\n📋 Results:');
    console.log('Total customers found:', customers.length);
    
    customers.forEach((customer, index) => {
      console.log(`\n--- Customer ${index + 1} ---`);
      console.log(`ID: ${customer.id}`);
      console.log(`Name: ${customer.full_name}`);
      console.log(`ID Card: ${customer.id_card}`);
      console.log(`Nickname: ${customer.nickname}`);
      console.log(`Guarantor Name: ${customer.guarantor_name || 'NULL'}`);
      console.log(`Guarantor ID Card: ${customer.guarantor_id_card || 'NULL'}`);
      console.log(`Guarantor Nickname: ${customer.guarantor_nickname || 'NULL'}`);
      console.log(`Contract Count: ${customer.contract_count}`);
      console.log(`Contract Numbers: ${customer.contract_numbers || 'NULL'}`);
    });
    
    // Check if there are any customers with guarantor data
    const [customersWithGuarantor] = await connection.execute(`
      SELECT 
        id, 
        full_name,
        guarantor_name,
        guarantor_id_card,
        guarantor_nickname
      FROM customers 
      WHERE guarantor_name IS NOT NULL 
         OR guarantor_id_card IS NOT NULL 
         OR guarantor_nickname IS NOT NULL
      LIMIT 5
    `);
    
    console.log('\n📋 Customers with guarantor data:');
    console.log('Total customers with guarantor data:', customersWithGuarantor.length);
    
    customersWithGuarantor.forEach((customer, index) => {
      console.log(`\n--- Customer with Guarantor ${index + 1} ---`);
      console.log(`Name: ${customer.full_name}`);
      console.log(`Guarantor Name: ${customer.guarantor_name || 'NULL'}`);
      console.log(`Guarantor ID Card: ${customer.guarantor_id_card || 'NULL'}`);
      console.log(`Guarantor Nickname: ${customer.guarantor_nickname || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔍 Database connection closed');
    }
  }
}

testCheckerCustomersAPI(); 