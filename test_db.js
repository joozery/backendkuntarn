const { query } = require('./db/db');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test payments table
    const paymentsTable = await query('SHOW TABLES LIKE "payments"');
    console.log('Payments table exists:', paymentsTable.length > 0);
    
    if (paymentsTable.length > 0) {
      const paymentsCount = await query('SELECT COUNT(*) as count FROM payments');
      console.log('Payments count:', paymentsCount[0].count);
    }
    
    // Test installments table
    const installmentsTable = await query('SHOW TABLES LIKE "installments"');
    console.log('Installments table exists:', installmentsTable.length > 0);
    
    if (installmentsTable.length > 0) {
      const installmentsCount = await query('SELECT COUNT(*) as count FROM installments');
      console.log('Installments count:', installmentsCount[0].count);
    }
    
  } catch (error) {
    console.error('Database test error:', error);
  }
}

testDatabase(); 