const { query } = require('../db/db');

async function checkInventoryContracts() {
  try {
    console.log('🔍 Checking inventory contract numbers...');
    
    // Check inventory table
    const inventoryResult = await query('SELECT id, product_name, contract_number, status FROM inventory ORDER BY id');
    console.log('Inventory data:', JSON.stringify(inventoryResult, null, 2));
    
    // Check installments table
    const installmentsResult = await query('SELECT id, contract_number, product_id, product_name FROM installments ORDER BY id');
    console.log('Installments data:', JSON.stringify(installmentsResult, null, 2));
    
    // Check if there are any contracts that should update inventory
    console.log('\n🔍 Checking for contracts that should update inventory...');
    for (const contract of installmentsResult) {
      if (contract.product_id) {
        const updateQuery = `
          UPDATE inventory 
          SET contract_number = ?, status = 'sold'
          WHERE id = ? AND (contract_number IS NULL OR contract_number = '-')
        `;
        const result = await query(updateQuery, [contract.contract_number, contract.product_id]);
        if (result.affectedRows > 0) {
          console.log(`✅ Updated inventory ID ${contract.product_id} with contract ${contract.contract_number}`);
        }
      }
    }
    
    // Check final state
    console.log('\n🔍 Final inventory state:');
    const finalInventory = await query('SELECT id, product_name, contract_number, status FROM inventory ORDER BY id');
    console.log('Final inventory data:', JSON.stringify(finalInventory, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkInventoryContracts(); 