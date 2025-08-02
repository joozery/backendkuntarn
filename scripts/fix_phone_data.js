const { query } = require('../db/db');

async function fixPhoneData() {
  try {
    console.log('🔧 Fixing phone data in customers table...');
    
    // Check current phone data
    const phoneData = await query(`
      SELECT id, code, name, surname, phone, phone1, phone2, phone3
      FROM customers 
      LIMIT 10
    `);
    
    console.log('📋 Current phone data sample:');
    phoneData.forEach(customer => {
      console.log(`  ${customer.code}: ${customer.name} ${customer.surname}`);
      console.log(`    phone: ${customer.phone || 'NULL'}`);
      console.log(`    phone1: ${customer.phone1 || 'NULL'}`);
      console.log(`    phone2: ${customer.phone2 || 'NULL'}`);
      console.log(`    phone3: ${customer.phone3 || 'NULL'}`);
      console.log('');
    });
    
    // Copy phone to phone1 if phone1 is empty
    console.log('🔄 Copying phone data to phone1...');
    const updateResult = await query(`
      UPDATE customers 
      SET phone1 = phone 
      WHERE (phone1 IS NULL OR phone1 = '') AND phone IS NOT NULL AND phone != ''
    `);
    
    console.log(`✅ Updated ${updateResult.affectedRows} customers with phone data`);
    
    // Show customers with phone data
    const customersWithPhone = await query(`
      SELECT id, code, name, surname, phone1, phone2, phone3
      FROM customers 
      WHERE phone1 IS NOT NULL AND phone1 != ''
      ORDER BY id
      LIMIT 10
    `);
    
    console.log('\n📋 Customers with phone data:');
    customersWithPhone.forEach(customer => {
      console.log(`  ${customer.code}: ${customer.name} ${customer.surname} - ${customer.phone1}`);
    });
    
    // Show customers without phone data
    const customersWithoutPhone = await query(`
      SELECT id, code, name, surname, phone1, phone2, phone3
      FROM customers 
      WHERE (phone1 IS NULL OR phone1 = '') 
        AND (phone2 IS NULL OR phone2 = '') 
        AND (phone3 IS NULL OR phone3 = '')
      ORDER BY id
      LIMIT 10
    `);
    
    console.log('\n❌ Customers without phone data:');
    customersWithoutPhone.forEach(customer => {
      console.log(`  ${customer.code}: ${customer.name} ${customer.surname}`);
    });
    
    // Get total counts
    const totalCustomers = await query('SELECT COUNT(*) as total FROM customers');
    const customersWithPhoneCount = await query(`
      SELECT COUNT(*) as total 
      FROM customers 
      WHERE phone1 IS NOT NULL AND phone1 != ''
    `);
    
    console.log(`\n📊 Summary:`);
    console.log(`  Total customers: ${totalCustomers[0].total}`);
    console.log(`  Customers with phone: ${customersWithPhoneCount[0].total}`);
    console.log(`  Customers without phone: ${totalCustomers[0].total - customersWithPhoneCount[0].total}`);
    
    console.log('\n✅ Phone data fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing phone data:', error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixPhoneData(); 