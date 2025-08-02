const { query } = require('../db/db');

async function checkPhoneIssue() {
  try {
    console.log('🔍 Checking phone data issue...');
    
    // Check table structure
    const tableStructure = await query('DESCRIBE customers');
    console.log('\n📋 Table structure:');
    tableStructure.forEach(column => {
      if (column.Field.includes('phone')) {
        console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      }
    });
    
    // Check sample data
    const sampleData = await query(`
      SELECT id, code, name, surname, phone, phone1, phone2, phone3
      FROM customers 
      ORDER BY id 
      LIMIT 5
    `);
    
    console.log('\n📋 Sample customer data:');
    sampleData.forEach(customer => {
      console.log(`  ${customer.code}: ${customer.name} ${customer.surname}`);
      console.log(`    phone: ${customer.phone || 'NULL'}`);
      console.log(`    phone1: ${customer.phone1 || 'NULL'}`);
      console.log(`    phone2: ${customer.phone2 || 'NULL'}`);
      console.log(`    phone3: ${customer.phone3 || 'NULL'}`);
      console.log('');
    });
    
    // Check if phone1 column exists
    const phone1Exists = tableStructure.some(col => col.Field === 'phone1');
    
    if (!phone1Exists) {
      console.log('❌ phone1 column does not exist!');
      console.log('🔧 Solution: Run the schema update script');
      console.log('   mysql -u root -p kuntarn_db < db/update_customers_schema.sql');
    } else {
      console.log('✅ phone1 column exists');
      
      // Check if data needs to be migrated
      const needsMigration = await query(`
        SELECT COUNT(*) as count 
        FROM customers 
        WHERE (phone1 IS NULL OR phone1 = '') AND phone IS NOT NULL AND phone != ''
      `);
      
      if (needsMigration[0].count > 0) {
        console.log(`🔄 ${needsMigration[0].count} customers need phone data migration`);
        console.log('🔧 Solution: Run the phone fix script');
        console.log('   node scripts/fix_phone_data.js');
      } else {
        console.log('✅ Phone data is properly migrated');
      }
    }
    
    // Test the API query
    console.log('\n🧪 Testing API query...');
    const apiTest = await query(`
      SELECT 
        c.*,
        COALESCE(c.phone1, c.phone2, c.phone3, c.phone, '') as primary_phone
      FROM customers c
      ORDER BY c.id 
      LIMIT 3
    `);
    
    console.log('📋 API test results:');
    apiTest.forEach(customer => {
      console.log(`  ${customer.code}: ${customer.name} ${customer.surname} - Phone: ${customer.primary_phone || 'ไม่มีเบอร์โทร'}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking phone issue:', error);
  } finally {
    process.exit(0);
  }
}

// Run the check
checkPhoneIssue(); 