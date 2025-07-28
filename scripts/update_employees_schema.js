const { query } = require('../db/db');

async function updateEmployeesSchema() {
  try {
    console.log('🔄 กำลังอัปเดต schema ของตาราง employees...');

    // ตรวจสอบว่าคอลัมน์ status มีอยู่แล้วหรือไม่
    const checkColumnQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'employees' 
      AND COLUMN_NAME = 'status'
    `;
    
    const existingColumns = await query(checkColumnQuery);
    
    if (existingColumns.length === 0) {
      console.log('📝 เพิ่มคอลัมน์ status ในตาราง employees...');
      
      // เพิ่มคอลัมน์ status
      const addStatusColumnQuery = `
        ALTER TABLE employees 
        ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active' 
        AFTER position
      `;
      
      await query(addStatusColumnQuery);
      console.log('✅ เพิ่มคอลัมน์ status สำเร็จ');
    } else {
      console.log('ℹ️ คอลัมน์ status มีอยู่แล้ว');
    }

    // ตรวจสอบว่าคอลัมน์ position มีอยู่แล้วหรือไม่
    const checkPositionQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'employees' 
      AND COLUMN_NAME = 'position'
    `;
    
    const existingPosition = await query(checkPositionQuery);
    
    if (existingPosition.length === 0) {
      console.log('📝 เพิ่มคอลัมน์ position ในตาราง employees...');
      
      // เพิ่มคอลัมน์ position
      const addPositionColumnQuery = `
        ALTER TABLE employees 
        ADD COLUMN position VARCHAR(255) 
        AFTER email
      `;
      
      await query(addPositionColumnQuery);
      console.log('✅ เพิ่มคอลัมน์ position สำเร็จ');
    } else {
      console.log('ℹ️ คอลัมน์ position มีอยู่แล้ว');
    }

    // อัปเดตข้อมูลพนักงานที่มีอยู่ให้มี status = 'active'
    const updateExistingEmployeesQuery = `
      UPDATE employees 
      SET status = 'active' 
      WHERE status IS NULL
    `;
    
    const updateResult = await query(updateExistingEmployeesQuery);
    console.log(`✅ อัปเดตพนักงาน ${updateResult.affectedRows} คนให้มี status = 'active'`);

    console.log('🎉 อัปเดต schema ของตาราง employees เสร็จสิ้น!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการอัปเดต schema:', error);
    throw error;
  }
}

// รัน script ถ้าเรียกโดยตรง
if (require.main === module) {
  updateEmployeesSchema()
    .then(() => {
      console.log('✅ Script เสร็จสิ้น');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script ล้มเหลว:', error);
      process.exit(1);
    });
}

module.exports = { updateEmployeesSchema }; 