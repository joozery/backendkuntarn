const { query } = require('../db/db');

async function addCollectorId() {
  try {
    console.log('🔧 เพิ่มคอลัมน์ collector_id ในตาราง installments...');
    
    // เพิ่มคอลัมน์ collector_id
    await query('ALTER TABLE installments ADD COLUMN collector_id BIGINT AFTER inspector_id');
    
    console.log('✅ เพิ่มคอลัมน์ collector_id สำเร็จแล้ว!');
    
    // ตรวจสอบว่าคอลัมน์ถูกเพิ่มแล้ว
    const result = await query('DESCRIBE installments');
    const hasCollectorId = result.some(col => col.Field === 'collector_id');
    
    if (hasCollectorId) {
      console.log('✅ คอลัมน์ collector_id มีอยู่ในตาราง installments แล้ว');
    } else {
      console.log('❌ คอลัมน์ collector_id ไม่ถูกเพิ่ม');
    }
    
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('✅ คอลัมน์ collector_id มีอยู่แล้ว');
    } else {
      console.error('❌ เกิดข้อผิดพลาด:', error.message);
    }
  }
}

addCollectorId(); 