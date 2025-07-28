const { query } = require('../db/db');

async function checkMySQLTables() {
  console.log('🔍 ตรวจสอบ Table MySQL ทั้งหมด...\n');

  try {
    // 1. ดูรายชื่อ tables ทั้งหมด
    console.log('1. รายชื่อ Tables ทั้งหมด:');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      ORDER BY table_name
    `);
    
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });
    console.log('');

    // 2. ตรวจสอบแต่ละ table
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`2. โครงสร้าง Table: ${tableName}`);
      
      // ดูโครงสร้าง columns
      const structure = await query(`DESCRIBE ${tableName}`);
      console.log('   Columns:');
      structure.forEach(col => {
        const key = col.Key ? ` (${col.Key})` : '';
        const nullStr = col.Null === 'NO' ? ' NOT NULL' : '';
        const defaultStr = col.Default ? ` DEFAULT ${col.Default}` : '';
        console.log(`     - ${col.Field}: ${col.Type}${nullStr}${defaultStr}${key}`);
      });
      
      // ดูจำนวนข้อมูล
      const countResult = await query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = countResult[0].count;
      console.log(`   จำนวนข้อมูล: ${count} รายการ`);
      
      // ดูข้อมูลตัวอย่าง (ถ้ามี)
      if (count > 0) {
        const sampleData = await query(`SELECT * FROM ${tableName} LIMIT 3`);
        console.log('   ข้อมูลตัวอย่าง:');
        sampleData.forEach((row, index) => {
          console.log(`     ${index + 1}. ${JSON.stringify(row, null, 2)}`);
        });
      }
      
      console.log('');
    }

    // 3. ตรวจสอบ Foreign Keys
    console.log('3. Foreign Keys:');
    const foreignKeys = await query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
      AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);
    
    if (foreignKeys.length > 0) {
      foreignKeys.forEach(fk => {
        console.log(`   ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      });
    } else {
      console.log('   ไม่มี Foreign Keys');
    }
    console.log('');

    // 4. ตรวจสอบ Indexes
    console.log('4. Indexes:');
    const indexes = await query(`
      SELECT 
        TABLE_NAME,
        INDEX_NAME,
        COLUMN_NAME,
        NON_UNIQUE
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
      AND INDEX_NAME != 'PRIMARY'
      ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
    `);
    
    if (indexes.length > 0) {
      indexes.forEach(idx => {
        const unique = idx.NON_UNIQUE === 0 ? 'UNIQUE' : '';
        console.log(`   ${idx.TABLE_NAME}.${idx.INDEX_NAME} (${idx.COLUMN_NAME}) ${unique}`);
      });
    } else {
      console.log('   ไม่มี Indexes เพิ่มเติม');
    }
    console.log('');

    // 5. สรุป
    console.log('5. สรุป:');
    console.log(`   - จำนวน Tables: ${tables.length}`);
    console.log(`   - จำนวน Foreign Keys: ${foreignKeys.length}`);
    console.log(`   - จำนวน Indexes: ${indexes.length}`);
    
    // ตรวจสอบ tables ที่สำคัญ
    const importantTables = ['customers', 'products', 'installments', 'employees', 'checkers', 'branches'];
    console.log('\n   Tables ที่สำคัญ:');
    for (const tableName of importantTables) {
      const exists = tables.some(t => t.table_name === tableName);
      const status = exists ? '✅ มีอยู่' : '❌ ไม่มี';
      console.log(`     ${tableName}: ${status}`);
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตรวจสอบ:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
  }
}

// รันการตรวจสอบ
checkMySQLTables()
  .then(() => {
    console.log('\n🏁 การตรวจสอบเสร็จสิ้น');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 การตรวจสอบล้มเหลว:', error);
    process.exit(1);
  }); 