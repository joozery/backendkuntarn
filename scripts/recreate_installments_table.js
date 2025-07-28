const fs = require('fs');
const path = require('path');
const { query } = require('../db/db.js');

async function recreateInstallmentsTable() {
  try {
    console.log('🔄 Starting installments table recreation...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../db/recreate_installments_table.sql');
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
        
        // If it's a DESCRIBE statement, show the results
        if (statement.toUpperCase().includes('DESCRIBE')) {
          console.log('\n📋 Table structure:');
          console.table(result);
        }
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        throw error;
      }
    }
    
    console.log('\n🎉 Installments table recreated successfully!');
    
    // Verify the table exists and show its structure
    console.log('\n🔍 Verifying table structure...');
    const tableStructure = await query('DESCRIBE installments');
    console.log('\n📋 Final table structure:');
    console.table(tableStructure);
    
    // Show column count
    console.log(`\n📊 Total columns: ${tableStructure.length}`);
    
  } catch (error) {
    console.error('❌ Error recreating installments table:', error);
    throw error;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  recreateInstallmentsTable()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { recreateInstallmentsTable }; 