const { query } = require('../db/db');

async function debugPhone() {
  try {
    console.log('🔍 Debugging phone data issue...');
    
    // 1. Check table structure
    console.log('\n1. 📋 Table structure:');
    const structure = await query('DESCRIBE customers');
    const phoneColumns = structure.filter(col => col.Field.includes('phone'));
    phoneColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // 2. Check if phone1 column exists
    const hasPhone1 = phoneColumns.some(col => col.Field === 'phone1');
    console.log(`\n2. phone1 column exists: ${hasPhone1}`);
    
    if (!hasPhone1) {
      console.log('❌ phone1 column missing! Need to run schema update');
      return;
    }
    
    // 3. Check sample data
    console.log('\n3. 📋 Sample customer data:');
    const sampleData = await query(`
      SELECT id, code, name, surname, phone, phone1, phone2, phone3
      FROM customers 
      ORDER BY id 
      LIMIT 5
    `);
    
    sampleData.forEach(customer => {
      console.log(`   ${customer.code}: ${customer.name} ${customer.surname}`);
      console.log(`     phone: "${customer.phone}"`);
      console.log(`     phone1: "${customer.phone1}"`);
      console.log(`     phone2: "${customer.phone2}"`);
      console.log(`     phone3: "${customer.phone3}"`);
      console.log('');
    });
    
    // 4. Check data migration status
    console.log('\n4. 📊 Data migration status:');
    const migrationStatus = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) as with_old_phone,
        SUM(CASE WHEN phone1 IS NOT NULL AND phone1 != '' THEN 1 ELSE 0 END) as with_phone1,
        SUM(CASE WHEN phone2 IS NOT NULL AND phone2 != '' THEN 1 ELSE 0 END) as with_phone2,
        SUM(CASE WHEN phone3 IS NOT NULL AND phone3 != '' THEN 1 ELSE 0 END) as with_phone3
      FROM customers
    `);
    
    const status = migrationStatus[0];
    console.log(`   Total customers: ${status.total}`);
    console.log(`   With old phone: ${status.with_old_phone}`);
    console.log(`   With phone1: ${status.with_phone1}`);
    console.log(`   With phone2: ${status.with_phone2}`);
    console.log(`   With phone3: ${status.with_phone3}`);
    
    // 5. Test API query
    console.log('\n5. 🧪 Testing API query:');
    const apiTest = await query(`
      SELECT 
        c.id, c.code, c.name, c.surname,
        c.phone, c.phone1, c.phone2, c.phone3,
        COALESCE(c.phone1, c.phone2, c.phone3, c.phone, '') as primary_phone
      FROM customers c
      ORDER BY c.id 
      LIMIT 3
    `);
    
    apiTest.forEach(customer => {
      console.log(`   ${customer.code}: ${customer.name} ${customer.surname}`);
      console.log(`     Primary phone: "${customer.primary_phone}"`);
      console.log('');
    });
    
    // 6. Check if data needs migration
    const needsMigration = await query(`
      SELECT COUNT(*) as count 
      FROM customers 
      WHERE (phone1 IS NULL OR phone1 = '') AND phone IS NOT NULL AND phone != ''
    `);
    
    if (needsMigration[0].count > 0) {
      console.log(`\n6. 🔄 ${needsMigration[0].count} customers need phone data migration`);
      console.log('   Running migration...');
      
      const updateResult = await query(`
        UPDATE customers 
        SET phone1 = phone 
        WHERE (phone1 IS NULL OR phone1 = '') AND phone IS NOT NULL AND phone != ''
      `);
      
      console.log(`   ✅ Updated ${updateResult.affectedRows} customers`);
    } else {
      console.log('\n6. ✅ Phone data is already migrated');
    }
    
    // 7. Final test
    console.log('\n7. 🎯 Final test after migration:');
    const finalTest = await query(`
      SELECT 
        c.id, c.code, c.name, c.surname,
        COALESCE(c.phone1, c.phone2, c.phone3, c.phone, '') as primary_phone
      FROM customers c
      ORDER BY c.id 
      LIMIT 5
    `);
    
    finalTest.forEach(customer => {
      const phoneDisplay = customer.primary_phone || 'ไม่มีเบอร์โทร';
      console.log(`   ${customer.code}: ${customer.name} ${customer.surname} - ${phoneDisplay}`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging phone:', error);
  } finally {
    process.exit(0);
  }
}

debugPhone(); 