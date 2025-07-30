const { query } = require('../db/db');

async function addInventoryData() {
  try {
    console.log('🔍 Adding inventory data to match products table...');
    
    // Get all products from products table
    const products = await query('SELECT id, name, price FROM products');
    console.log('Found products:', products);
    
    // Add inventory records for each product
    for (const product of products) {
      console.log(`Adding inventory for product: ${product.name}`);
      
      const insertQuery = `
        INSERT INTO inventory (
          sequence, receive_date, product_code, product_name, contract_number,
          cost_price, sell_date, selling_cost, remaining_quantity1, received_quantity,
          sold_quantity, remaining_quantity2, remarks, branch_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        product.id, // sequence
        new Date().toISOString().split('T')[0], // receive_date
        `P${product.id.toString().padStart(3, '0')}`, // product_code
        product.name, // product_name
        '-', // contract_number
        product.price || 0, // cost_price
        null, // sell_date
        0, // selling_cost
        1, // remaining_quantity1 (1 piece in stock)
        1, // received_quantity
        0, // sold_quantity
        1, // remaining_quantity2
        `สินค้า ${product.name}`, // remarks
        1, // branch_id
        'active' // status
      ];
      
      try {
        await query(insertQuery, values);
        console.log(`✅ Added inventory for: ${product.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Inventory already exists for: ${product.name}`);
        } else {
          console.error(`❌ Error adding inventory for ${product.name}:`, error.message);
        }
      }
    }
    
    console.log('\n🔍 Final inventory check:');
    const finalInventory = await query('SELECT id, product_name, remaining_quantity1, sold_quantity, status FROM inventory');
    console.log('Inventory data:', JSON.stringify(finalInventory, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

addInventoryData(); 