const { query } = require('../db/db');

async function updateCustomersSchema() {
  try {
    console.log('🔄 กำลังอัปเดต schema ของตาราง customers...');

    // ฟิลด์ใหม่ที่ต้องเพิ่ม
    const newFields = [
      { name: 'title', type: 'VARCHAR(10) DEFAULT "นาย"' },
      { name: 'age', type: 'INT' },
      { name: 'moo', type: 'VARCHAR(50)' },
      { name: 'road', type: 'VARCHAR(255)' },
      { name: 'subdistrict', type: 'VARCHAR(255)' },
      { name: 'district', type: 'VARCHAR(255)' },
      { name: 'province', type: 'VARCHAR(255)' },
      { name: 'phone1', type: 'VARCHAR(20)' },
      { name: 'phone2', type: 'VARCHAR(20)' },
      { name: 'phone3', type: 'VARCHAR(20)' }
    ];

    // ตรวจสอบและเพิ่มฟิลด์ใหม่
    for (const field of newFields) {
      const checkColumnQuery = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'customers' 
        AND COLUMN_NAME = ?
      `;
      
      const existingColumns = await query(checkColumnQuery, [field.name]);
      
      if (existingColumns.length === 0) {
        console.log(`📝 เพิ่มคอลัมน์ ${field.name} ในตาราง customers...`);
        
        const addColumnQuery = `
          ALTER TABLE customers 
          ADD COLUMN ${field.name} ${field.type}
        `;
        
        await query(addColumnQuery);
        console.log(`✅ เพิ่มคอลัมน์ ${field.name} สำเร็จ`);
      } else {
        console.log(`ℹ️ คอลัมน์ ${field.name} มีอยู่แล้ว`);
      }
    }

    // อัปเดตข้อมูลลูกค้าที่มีอยู่
    console.log('🔄 อัปเดตข้อมูลลูกค้าที่มีอยู่...');
    
    // อัปเดต phone1 จาก phone เดิม
    const updatePhone1Query = `
      UPDATE customers 
      SET phone1 = phone 
      WHERE phone1 IS NULL AND phone IS NOT NULL
    `;
    const phone1Result = await query(updatePhone1Query);
    console.log(`✅ อัปเดต phone1 จาก phone เดิม: ${phone1Result.affectedRows} รายการ`);

    // อัปเดต title เป็น 'นาย' สำหรับลูกค้าที่ไม่มี title
    const updateTitleQuery = `
      UPDATE customers 
      SET title = 'นาย' 
      WHERE title IS NULL
    `;
    const titleResult = await query(updateTitleQuery);
    console.log(`✅ อัปเดต title เป็น 'นาย': ${titleResult.affectedRows} รายการ`);

    console.log('🎉 อัปเดต schema ของตาราง customers เสร็จสิ้น!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการอัปเดต schema:', error);
    throw error;
  }
}

// รัน script ถ้าเรียกโดยตรง
if (require.main === module) {
  updateCustomersSchema()
    .then(() => {
      console.log('✅ Script เสร็จสิ้น');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script ล้มเหลว:', error);
      process.exit(1);
    });
}

module.exports = { updateCustomersSchema }; 