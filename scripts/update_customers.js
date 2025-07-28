const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function updateCustomersSchema() {
  let connection;
  
  try {
    // Database configuration
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'installment_system',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Read the update script
    const updateScriptPath = path.join(__dirname, '../db/update_customers_schema.sql');
    const updateScript = await fs.readFile(updateScriptPath, 'utf8');

    // Split the script into individual statements
    const statements = updateScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log('📝 Executing update statements...');

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_DUP_FIELDNAME') {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message}`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }

    console.log('🎉 Customers table schema updated successfully!');

    // Verify the update
    console.log('🔍 Verifying update...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'customers'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database]);

    console.log('📋 Current customers table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check sample data
    const [customers] = await connection.execute('SELECT COUNT(*) as count FROM customers');
    console.log(`📊 Total customers: ${customers[0].count}`);

    const [sampleCustomer] = await connection.execute(`
      SELECT code, full_name, id_card, nickname, guarantor_name, checker_id 
      FROM customers 
      LIMIT 1
    `);

    if (sampleCustomer.length > 0) {
      console.log('📝 Sample customer data:');
      console.log(`  - Code: ${sampleCustomer[0].code}`);
      console.log(`  - Name: ${sampleCustomer[0].full_name}`);
      console.log(`  - ID Card: ${sampleCustomer[0].id_card}`);
      console.log(`  - Nickname: ${sampleCustomer[0].nickname}`);
      console.log(`  - Guarantor: ${sampleCustomer[0].guarantor_name}`);
      console.log(`  - Checker ID: ${sampleCustomer[0].checker_id}`);
    }

  } catch (error) {
    console.error('❌ Error updating customers schema:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the update if this script is executed directly
if (require.main === module) {
  updateCustomersSchema()
    .then(() => {
      console.log('✅ Customers schema update completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Customers schema update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateCustomersSchema }; 