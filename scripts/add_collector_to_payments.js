const { query } = require('../db/db');

async function addCollectorIdToPayments() {
  try {
    console.log('🔧 เพิ่มคอลัมน์ collector_id ในตาราง payments...');
    
    // เพิ่มคอลัมน์ collector_id
    await query('ALTER TABLE payments ADD COLUMN collector_id BIGINT AFTER installment_id');
    
    console.log('✅ เพิ่มคอลัมน์ collector_id ในตาราง payments สำเร็จแล้ว!');
    
    // ตรวจสอบว่าคอลัมน์ถูกเพิ่มแล้ว
    const result = await query('DESCRIBE payments');
    const hasCollectorId = result.some(col => col.Field === 'collector_id');
    
    if (hasCollectorId) {
      console.log('✅ คอลัมน์ collector_id มีอยู่ในตาราง payments แล้ว');
    } else {
      console.log('❌ คอลัมน์ collector_id ไม่ถูกเพิ่ม');
    }
    
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('✅ คอลัมน์ collector_id มีอยู่แล้วในตาราง payments');
    } else {
      console.error('❌ เกิดข้อผิดพลาด:', error.message);
    }
  }
}

addCollectorIdToPayments(); 