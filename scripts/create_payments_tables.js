const fs = require('fs');
const path = require('path');
const { query } = require('../db/db.js');

async function createPaymentsTables() {
  try {
    console.log('🔄 Starting payments tables creation...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../db/create_payments_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📖 SQL file loaded successfully');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n📝 Executing statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
      
      try {
        const result = await query(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        throw error;
      }
    }
    
    console.log('\n🎉 Payments tables created successfully!');
    
    // Verify the tables exist and show their structure
    console.log('\n🔍 Verifying tables structure...');
    
    // Check payments table
    try {
      const paymentsStructure = await query('DESCRIBE payments');
      console.log('\n📋 Payments table structure:');
      console.table(paymentsStructure);
      console.log(`📊 Payments table columns: ${paymentsStructure.length}`);
    } catch (error) {
      console.error('❌ Error checking payments table:', error.message);
    }
    
    // Check payment_collections table
    try {
      const collectionsStructure = await query('DESCRIBE payment_collections');
      console.log('\n📋 Payment collections table structure:');
      console.table(collectionsStructure);
      console.log(`📊 Payment collections table columns: ${collectionsStructure.length}`);
    } catch (error) {
      console.error('❌ Error checking payment_collections table:', error.message);
    }
    
    // Show table counts
    try {
      const paymentsCount = await query('SELECT COUNT(*) as count FROM payments');
      const collectionsCount = await query('SELECT COUNT(*) as count FROM payment_collections');
      
      console.log('\n📊 Table data counts:');
      console.log(`- Payments: ${paymentsCount[0].count} records`);
      console.log(`- Payment collections: ${collectionsCount[0].count} records`);
    } catch (error) {
      console.error('❌ Error checking table counts:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error creating payments tables:', error);
    throw error;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  createPaymentsTables()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createPaymentsTables }; 