const { query } = require('../db/db');

async function checkInventory() {
  try {
    console.log('🔍 Checking inventory table...');
    const inventoryResult = await query('SELECT * FROM inventory LIMIT 5');
    console.log('Inventory data:', JSON.stringify(inventoryResult, null, 2));
    
    console.log('\n🔍 Checking products table...');
    const productsResult = await query('SELECT id, name FROM products LIMIT 5');
    console.log('Products data:', JSON.stringify(productsResult, null, 2));
    
    console.log('\n🔍 Checking if inventory table exists...');
    const tableCheck = await query("SHOW TABLES LIKE 'inventory'");
    console.log('Inventory table exists:', tableCheck.length > 0);
    
    if (tableCheck.length === 0) {
      console.log('❌ Inventory table does not exist!');
    } else {
      console.log('✅ Inventory table exists');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkInventory(); 