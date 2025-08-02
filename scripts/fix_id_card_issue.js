const { query } = require('../db/db');

async function fixIdCardIssue() {
  try {
    console.log('🔧 Fixing customer id_card null issue...');
    
    // Check current customers with null id_cards
    const nullIdCards = await query(`
      SELECT id, code, name, surname, id_card 
      FROM customers 
      WHERE id_card IS NULL OR id_card = ''
    `);
    
    console.log(`📊 Found ${nullIdCards.length} customers with null/empty id_cards`);
    
    if (nullIdCards.length > 0) {
      console.log('📋 Customers with null id_cards:');
      nullIdCards.forEach(customer => {
        console.log(`  - ID: ${customer.id}, Code: ${customer.code}, Name: ${customer.name} ${customer.surname}`);
      });
      
      // Option 1: Generate temporary id_cards for null values
      console.log('\n🔄 Generating temporary id_cards for null values...');
      
      const updateResult = await query(`
        UPDATE customers 
        SET id_card = CONCAT('TEMP', LPAD(id, 9, '0'))
        WHERE id_card IS NULL OR id_card = ''
      `);
      
      console.log(`✅ Updated ${updateResult.affectedRows} customers with temporary id_cards`);
      
      // Show updated customers
      const updatedCustomers = await query(`
        SELECT id, code, name, surname, id_card 
        FROM customers 
        WHERE id_card LIKE 'TEMP%'
        ORDER BY id
      `);
      
      console.log('\n📋 Updated customers:');
      updatedCustomers.forEach(customer => {
        console.log(`  - ID: ${customer.id}, Code: ${customer.code}, Name: ${customer.name} ${customer.surname}, ID Card: ${customer.id_card}`);
      });
    }
    
    // Option 2: Make id_card nullable (uncomment if needed)
    // console.log('\n🔧 Making id_card column nullable...');
    // await query('ALTER TABLE customers MODIFY COLUMN id_card VARCHAR(13) UNIQUE');
    // console.log('✅ Made id_card column nullable');
    
    // Show final table structure
    const tableStructure = await query('DESCRIBE customers');
    console.log('\n📋 Current customers table structure:');
    tableStructure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? `(${column.Key})` : ''}`);
    });
    
    console.log('\n✅ id_card issue fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing id_card issue:', error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixIdCardIssue(); 