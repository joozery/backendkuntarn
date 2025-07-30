const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kuntarn_db'
};

async function checkCustomersGuarantor() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 Connected to database');
    
    // Check customers table structure
    console.log('\n📋 Checking customers table structure...');
    const [columns] = await connection.execute('DESCRIBE customers');
    const guarantorColumns = columns.filter(col => col.Field.includes('guarantor'));
    console.log('Guarantor columns:', guarantorColumns.map(col => col.Field));
    
    // Check sample customer data
    console.log('\n📋 Checking sample customer data...');
    const [customers] = await connection.execute(`
      SELECT 
        id, 
        name, 
        surname, 
        full_name,
        guarantor_name,
        guarantor_id_card,
        guarantor_nickname
      FROM customers 
      LIMIT 5
    `);
    
    console.log('Sample customers:');
    customers.forEach((customer, index) => {
      console.log(`\nCustomer ${index + 1}:`);
      console.log(`  Name: ${customer.full_name}`);
      console.log(`  Guarantor Name: ${customer.guarantor_name || 'NULL'}`);
      console.log(`  Guarantor ID Card: ${customer.guarantor_id_card || 'NULL'}`);
      console.log(`  Guarantor Nickname: ${customer.guarantor_nickname || 'NULL'}`);
    });
    
    // Check customers with contracts for a specific checker
    console.log('\n📋 Checking customers with contracts for checker...');
    const [checkerCustomers] = await connection.execute(`
      SELECT DISTINCT
        c.id,
        c.full_name,
        c.guarantor_name,
        c.guarantor_id_card,
        c.guarantor_nickname,
        COUNT(i.id) as contract_count
      FROM customers c
      INNER JOIN installments i ON c.id = i.customer_id
      WHERE i.inspector_id = 1
      GROUP BY c.id
      LIMIT 5
    `);
    
    console.log('Customers with contracts for checker:');
    checkerCustomers.forEach((customer, index) => {
      console.log(`\nCustomer ${index + 1}:`);
      console.log(`  Name: ${customer.full_name}`);
      console.log(`  Guarantor Name: ${customer.guarantor_name || 'NULL'}`);
      console.log(`  Guarantor ID Card: ${customer.guarantor_id_card || 'NULL'}`);
      console.log(`  Guarantor Nickname: ${customer.guarantor_nickname || 'NULL'}`);
      console.log(`  Contract Count: ${customer.contract_count}`);
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

checkCustomersGuarantor(); 