const { query } = require('../db/db');

async function updateInventoryAddShopName() {
  try {
    console.log('🔍 กำลังตรวจสอบและเพิ่มคอลัมน์ shop_name ในตาราง inventory...');
    
    // Check if shop_name column exists
    const checkQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'inventory' 
      AND COLUMN_NAME = 'shop_name'
    `;
    
    const result = await query(checkQuery);
    
    if (result.length === 0) {
      console.log('📝 คอลัมน์ shop_name ยังไม่มี กำลังเพิ่ม...');
      
      // Add shop_name column
      const addColumnQuery = `
        ALTER TABLE inventory 
        ADD COLUMN shop_name VARCHAR(255) AFTER product_name
      `;
      
      await query(addColumnQuery);
      console.log('✅ เพิ่มคอลัมน์ shop_name สำเร็จ');
      
      // Add index for better search performance
      try {
        const addIndexQuery = `
          CREATE INDEX idx_inventory_shop_name ON inventory(shop_name)
        `;
        await query(addIndexQuery);
        console.log('✅ เพิ่ม index สำหรับ shop_name สำเร็จ');
      } catch (indexError) {
        console.log('⚠️ ไม่สามารถเพิ่ม index ได้ (อาจมีอยู่แล้ว):', indexError.message);
      }
      
      // Update existing records with default value (optional)
      try {
        const updateQuery = `
          UPDATE inventory 
          SET shop_name = 'ไม่ระบุ' 
          WHERE shop_name IS NULL
        `;
        const updateResult = await query(updateQuery);
        console.log(`✅ อัปเดตข้อมูลเดิม ${updateResult.affectedRows} รายการ`);
      } catch (updateError) {
        console.log('⚠️ ไม่สามารถอัปเดตข้อมูลเดิมได้:', updateError.message);
      }
      
    } else {
      console.log('✅ คอลัมน์ shop_name มีอยู่แล้ว');
    }
    
    // Show table structure
    console.log('\n📋 โครงสร้างตาราง inventory:');
    const describeQuery = 'DESCRIBE inventory';
    const structure = await query(describeQuery);
    
    structure.forEach(column => {
      console.log(`  ${column.Field} - ${column.Type} ${column.Null === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });
    
    // Show sample data
    console.log('\n📊 ข้อมูลตัวอย่าง (5 รายการแรก):');
    const sampleQuery = 'SELECT id, product_name, shop_name, cost_price FROM inventory LIMIT 5';
    const sampleData = await query(sampleQuery);
    
    sampleData.forEach(row => {
      console.log(`  ID: ${row.id} | สินค้า: ${row.product_name} | ร้านค้า: ${row.shop_name || 'ไม่ระบุ'} | ราคา: ${row.cost_price}`);
    });
    
    console.log('\n🎉 อัปเดตตาราง inventory เสร็จสิ้น!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    process.exit(0);
  }
}

updateInventoryAddShopName(); 