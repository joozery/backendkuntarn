const { createMissingTables } = require('./create_missing_tables');
const { updateCustomersSchema } = require('./update_customers_schema');
const { updateEmployeesSchema } = require('./update_employees_schema');

async function setupDatabase() {
  try {
    console.log('🚀 เริ่มต้นการตั้งค่าฐานข้อมูล...\n');

    // 1. สร้างตารางที่ขาดหายไป
    console.log('📋 ขั้นตอนที่ 1: สร้างตารางที่ขาดหายไป');
    await createMissingTables();
    console.log('✅ เสร็จสิ้น\n');

    // 2. อัปเดต customers schema
    console.log('📋 ขั้นตอนที่ 2: อัปเดต customers schema');
    await updateCustomersSchema();
    console.log('✅ เสร็จสิ้น\n');

    // 3. อัปเดต employees schema
    console.log('📋 ขั้นตอนที่ 3: อัปเดต employees schema');
    await updateEmployeesSchema();
    console.log('✅ เสร็จสิ้น\n');

    console.log('🎉 การตั้งค่าฐานข้อมูลเสร็จสิ้น!');
    console.log('\n📊 สรุปการทำงาน:');
    console.log('✅ สร้างตาราง products, installments, payments, payment_collections');
    console.log('✅ เพิ่มฟิลด์ใหม่ในตาราง customers');
    console.log('✅ เพิ่มฟิลด์ใหม่ในตาราง employees');
    console.log('✅ สร้าง indexes สำหรับประสิทธิภาพ');
    console.log('✅ เพิ่มข้อมูลตัวอย่าง');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตั้งค่าฐานข้อมูล:', error);
    throw error;
  }
}

// รัน script ถ้าเรียกโดยตรง
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('\n✅ การตั้งค่าฐานข้อมูลเสร็จสิ้น');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ การตั้งค่าฐานข้อมูลล้มเหลว:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase }; 