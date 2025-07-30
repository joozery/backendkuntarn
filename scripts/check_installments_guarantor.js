const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kuntarn_db'
};

async function checkInstallmentsGuarantor() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 Connected to database');
    
    // Check installments table structure
    console.log('\n📋 Checking installments table structure...');
    const [columns] = await connection.execute('DESCRIBE installments');
    const guarantorColumns = columns.filter(col => col.Field.includes('guarantor'));
    console.log('Guarantor columns in installments:', guarantorColumns.map(col => col.Field));
    
    // Check sample installments data with guarantor info
    console.log('\n📋 Checking sample installments data...');
    const [installments] = await connection.execute(`
      SELECT 
        i.id,
        i.contract_number,
        i.customer_id,
        c.full_name as customer_name,
        i.guarantor_name,
        i.guarantor_id_card,
        i.guarantor_nickname,
        i.inspector_id,
        ch.full_name as inspector_name
      FROM installments i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN checkers ch ON i.inspector_id = ch.id
      WHERE i.inspector_id = 14
      ORDER BY i.contract_date DESC
    `);
    
    console.log('Sample installments with guarantor data:');
    installments.forEach((installment, index) => {
      console.log(`\n--- Installment ${index + 1} ---`);
      console.log(`Contract: ${installment.contract_number}`);
      console.log(`Customer: ${installment.customer_name} (ID: ${installment.customer_id})`);
      console.log(`Inspector: ${installment.inspector_name} (ID: ${installment.inspector_id})`);
      console.log(`Guarantor Name: ${installment.guarantor_name || 'NULL'}`);
      console.log(`Guarantor ID Card: ${installment.guarantor_id_card || 'NULL'}`);
      console.log(`Guarantor Nickname: ${installment.guarantor_nickname || 'NULL'}`);
    });
    
    // Check if guarantor data is different from customer data
    console.log('\n📋 Checking if guarantor data differs from customer data...');
    const [comparison] = await connection.execute(`
      SELECT 
        i.contract_number,
        c.full_name as customer_name,
        c.id_card as customer_id_card,
        c.nickname as customer_nickname,
        i.guarantor_name,
        i.guarantor_id_card,
        i.guarantor_nickname,
        CASE 
          WHEN i.guarantor_name = c.full_name THEN 'SAME'
          WHEN i.guarantor_name IS NULL THEN 'NULL'
          ELSE 'DIFFERENT'
        END as name_comparison,
        CASE 
          WHEN i.guarantor_id_card = c.id_card THEN 'SAME'
          WHEN i.guarantor_id_card IS NULL THEN 'NULL'
          ELSE 'DIFFERENT'
        END as id_card_comparison
      FROM installments i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.inspector_id = 14
    `);
    
    console.log('Guarantor vs Customer comparison:');
    comparison.forEach((item, index) => {
      console.log(`\n--- Contract ${index + 1}: ${item.contract_number} ---`);
      console.log(`Customer: ${item.customer_name} (${item.customer_id_card}) - ${item.customer_nickname}`);
      console.log(`Guarantor: ${item.guarantor_name} (${item.guarantor_id_card}) - ${item.guarantor_nickname}`);
      console.log(`Name comparison: ${item.name_comparison}`);
      console.log(`ID Card comparison: ${item.id_card_comparison}`);
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

checkInstallmentsGuarantor(); 