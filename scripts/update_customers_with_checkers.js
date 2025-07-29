const { query } = require('../db/db');

async function updateCustomersWithCheckers() {
  try {
    console.log('🔍 Starting to update customers with checker assignments...');
    
    // Get all checkers
    const checkers = await query('SELECT id, full_name, branch_id FROM checkers WHERE status = "active"');
    console.log(`Found ${checkers.length} active checkers`);
    
    // Get all customers without checker_id
    const customers = await query('SELECT id, full_name, branch_id FROM customers WHERE checker_id IS NULL');
    console.log(`Found ${customers.length} customers without checker assignment`);
    
    if (customers.length === 0) {
      console.log('✅ All customers already have checker assignments');
      return;
    }
    
    // Assign checkers to customers based on branch
    let updatedCount = 0;
    
    for (const customer of customers) {
      // Find checkers in the same branch
      const branchCheckers = checkers.filter(c => c.branch_id === customer.branch_id);
      
      if (branchCheckers.length > 0) {
        // Assign a checker randomly (you can modify this logic)
        const randomChecker = branchCheckers[Math.floor(Math.random() * branchCheckers.length)];
        
        await query(
          'UPDATE customers SET checker_id = ?, updated_at = NOW() WHERE id = ?',
          [randomChecker.id, customer.id]
        );
        
        console.log(`✅ Assigned customer "${customer.full_name}" to checker "${randomChecker.full_name}"`);
        updatedCount++;
      } else {
        console.log(`⚠️ No checkers found for branch ${customer.branch_id}, customer: ${customer.full_name}`);
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} customers with checker assignments`);
    
    // Verify the updates
    const customersWithCheckers = await query(`
      SELECT 
        c.id,
        c.full_name as customer_name,
        c.branch_id,
        ch.full_name as checker_name,
        b.name as branch_name
      FROM customers c
      LEFT JOIN checkers ch ON c.checker_id = ch.id
      LEFT JOIN branches b ON c.branch_id = b.id
      WHERE c.checker_id IS NOT NULL
      ORDER BY c.branch_id, c.id
    `);
    
    console.log('\n📊 Customers with checker assignments:');
    customersWithCheckers.forEach(c => {
      console.log(`  - ${c.customer_name} (${c.branch_name}) → ${c.checker_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating customers with checkers:', error);
  }
}

// Run the script
updateCustomersWithCheckers()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 