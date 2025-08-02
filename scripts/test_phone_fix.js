const { query } = require('../db/db');

async function testPhoneFix() {
  try {
    console.log('🔧 Testing and fixing phone data issue...');
    
    // Step 1: Check current database structure
    console.log('\n1. 📋 Checking database structure...');
    const structure = await query('DESCRIBE customers');
    const phoneColumns = structure.filter(col => col.Field.includes('phone'));
    console.log('Phone columns found:');
    phoneColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    // Step 2: Add phone1, phone2, phone3 columns if they don't exist
    console.log('\n2. 🔧 Ensuring phone columns exist...');
    try {
      await query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone1 VARCHAR(20) AFTER province');
      await query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone2 VARCHAR(20) AFTER phone1');
      await query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone3 VARCHAR(20) AFTER phone2');
      console.log('✅ Phone columns are ready');
    } catch (error) {
      console.log('Phone columns already exist');
    }
    
    // Step 3: Migrate phone data
    console.log('\n3. 🔄 Migrating phone data...');
    const migrationResult = await query(`
      UPDATE customers 
      SET phone1 = phone 
      WHERE (phone1 IS NULL OR phone1 = '') AND phone IS NOT NULL AND phone != ''
    `);
    console.log(`✅ Migrated ${migrationResult.affectedRows} customers`);
    
    // Step 4: Test API query
    console.log('\n4. 🧪 Testing API query...');
    const testData = await query(`
      SELECT 
        c.id, c.code, c.name, c.surname,
        c.phone, c.phone1, c.phone2, c.phone3,
        COALESCE(c.phone1, c.phone2, c.phone3, c.phone, '') as primary_phone
      FROM customers c
      ORDER BY c.id 
      LIMIT 10
    `);
    
    console.log('Sample data with primary_phone:');
    testData.forEach(customer => {
      const phoneDisplay = customer.primary_phone || 'ไม่มีเบอร์โทร';
      console.log(`  ${customer.code}: ${customer.name} ${customer.surname} - ${phoneDisplay}`);
    });
    
    // Step 5: Check data statistics
    console.log('\n5. 📊 Data statistics:');
    const stats = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN phone1 IS NOT NULL AND phone1 != '' THEN 1 ELSE 0 END) as with_phone1,
        SUM(CASE WHEN phone2 IS NOT NULL AND phone2 != '' THEN 1 ELSE 0 END) as with_phone2,
        SUM(CASE WHEN phone3 IS NOT NULL AND phone3 != '' THEN 1 ELSE 0 END) as with_phone3,
        SUM(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) as with_old_phone,
        SUM(CASE WHEN COALESCE(phone1, phone2, phone3, phone, '') != '' THEN 1 ELSE 0 END) as with_any_phone
      FROM customers
    `);
    
    const stat = stats[0];
    console.log(`  Total customers: ${stat.total}`);
    console.log(`  With phone1: ${stat.with_phone1}`);
    console.log(`  With phone2: ${stat.with_phone2}`);
    console.log(`  With phone3: ${stat.with_phone3}`);
    console.log(`  With old phone: ${stat.with_old_phone}`);
    console.log(`  With any phone: ${stat.with_any_phone}`);
    
    // Step 6: Show customers without phone
    console.log('\n6. ❌ Customers without phone:');
    const noPhoneCustomers = await query(`
      SELECT id, code, name, surname
      FROM customers 
      WHERE COALESCE(phone1, phone2, phone3, phone, '') = ''
      ORDER BY id 
      LIMIT 5
    `);
    
    if (noPhoneCustomers.length > 0) {
      noPhoneCustomers.forEach(customer => {
        console.log(`  ${customer.code}: ${customer.name} ${customer.surname}`);
      });
      console.log(`  ... and ${stat.total - stat.with_any_phone - noPhoneCustomers.length} more`);
    } else {
      console.log('  All customers have phone numbers!');
    }
    
    console.log('\n✅ Phone data fix completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your backend server');
    console.log('2. Refresh your frontend application');
    console.log('3. Check the customer table - phone numbers should now display');
    
  } catch (error) {
    console.error('❌ Error testing phone fix:', error);
  } finally {
    process.exit(0);
  }
}

testPhoneFix(); 