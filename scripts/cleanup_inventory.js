const { query } = require('../db/db');

async function cleanupInventory() {
  try {
    console.log('🔍 Cleaning up inventory data...');
    
    // Delete old inventory records with 5 pieces
    const deleteQuery = 'DELETE FROM inventory WHERE remaining_quantity1 = 5';
    const result = await query(deleteQuery);
    
    console.log(`✅ Deleted ${result.affectedRows} old inventory records`);
    
    // Show final inventory
    console.log('\n🔍 Final inventory check:');
    const finalInventory = await query('SELECT id, product_name, remaining_quantity1, sold_quantity, status FROM inventory ORDER BY id');
    console.log('Inventory data:', JSON.stringify(finalInventory, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

cleanupInventory(); 