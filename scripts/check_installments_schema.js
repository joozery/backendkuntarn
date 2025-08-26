const path = require('path');
const fs = require('fs');
const { query } = require('../db/db');

// Script to check and fix installments table schema
// This will help ensure all necessary columns exist for the contract edit form

async function checkInstallmentsSchema() {
  console.log('🔍 Checking Installments Table Schema...\n');
  
  try {
    // 1. Check current table structure
    console.log('1. Checking current table structure...');
    const describeResult = await query('DESCRIBE installments');
    console.log('✅ Table structure:');
    describeResult.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Check critical columns
    console.log('2. Checking critical columns...');
    const criticalColumns = ['product_id', 'collector_id', 'line', 'inspector_id'];
    
    for (const colName of criticalColumns) {
      const columnExists = describeResult.some(col => col.Field === colName);
      console.log(`   - ${colName}: ${columnExists ? '✅ EXISTS' : '❌ MISSING'}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Check data integrity
    console.log('3. Checking data integrity...');
    
    // Check contracts without product_id
    const contractsWithoutProduct = await query(`
      SELECT COUNT(*) as count 
      FROM installments 
      WHERE product_id IS NULL OR product_id = 0
    `);
    console.log(`   - Contracts without product_id: ${contractsWithoutProduct[0].count}`);
    
    // Check contracts without collector_id
    const contractsWithoutCollector = await query(`
      SELECT COUNT(*) as count 
      FROM installments 
      WHERE collector_id IS NULL OR collector_id = 0
    `);
    console.log(`   - Contracts without collector_id: ${contractsWithoutCollector[0].count}`);
    
    // Check contracts without line
    const contractsWithoutLine = await query(`
      SELECT COUNT(*) as count 
      FROM installments 
      WHERE line IS NULL OR line = ''
    `);
    console.log(`   - Contracts without line: ${contractsWithoutLine[0].count}`);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. Sample data check
    console.log('4. Sample data check...');
    const sampleContracts = await query(`
      SELECT 
        id,
        contract_number,
        product_id,
        collector_id,
        line,
        inspector_id,
        customer_id,
        salesperson_id
      FROM installments 
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    console.log('✅ Sample contracts:');
    sampleContracts.forEach((contract, index) => {
      console.log(`   Contract ${index + 1}:`);
      console.log(`     - ID: ${contract.id}`);
      console.log(`     - Number: ${contract.contract_number}`);
      console.log(`     - Product ID: ${contract.product_id || 'NULL'}`);
      console.log(`     - Collector ID: ${contract.collector_id || 'NULL'}`);
      console.log(`     - Line: ${contract.line || 'NULL'}`);
      console.log(`     - Inspector ID: ${contract.inspector_id || 'NULL'}`);
      console.log(`     - Customer ID: ${contract.customer_id || 'NULL'}`);
      console.log(`     - Salesperson ID: ${contract.salesperson_id || 'NULL'}`);
      console.log('');
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 5. Check foreign key relationships
    console.log('5. Checking foreign key relationships...');
    
    // Check product_id references
    const invalidProductRefs = await query(`
      SELECT 
        i.id as contract_id,
        i.contract_number,
        i.product_id
      FROM installments i
      LEFT JOIN inventory inv ON i.product_id = inv.id
      WHERE i.product_id IS NOT NULL 
        AND i.product_id != 0 
        AND inv.id IS NULL
    `);
    
    if (invalidProductRefs.length > 0) {
      console.log('⚠️ Invalid product_id references:');
      invalidProductRefs.forEach(ref => {
        console.log(`     - Contract ${ref.contract_number} (ID: ${ref.contract_id}) has invalid product_id: ${ref.product_id}`);
      });
    } else {
      console.log('✅ All product_id references are valid');
    }
    
    // Check collector_id references
    const invalidCollectorRefs = await query(`
      SELECT 
        i.id as contract_id,
        i.contract_number,
        i.collector_id
      FROM installments i
      LEFT JOIN employees e ON i.collector_id = e.id
      WHERE i.collector_id IS NOT NULL 
        AND i.collector_id != 0 
        AND e.id IS NULL
    `);
    
    if (invalidCollectorRefs.length > 0) {
      console.log('⚠️ Invalid collector_id references:');
      invalidCollectorRefs.forEach(ref => {
        console.log(`     - Contract ${ref.contract_number} (ID: ${ref.contract_id}) has invalid collector_id: ${ref.collector_id}`);
      });
    } else {
      console.log('✅ All collector_id references are valid');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 6. Summary and recommendations
    console.log('6. Summary and Recommendations...');
    
    const totalContracts = await query('SELECT COUNT(*) as count FROM installments');
    console.log(`📊 Total contracts in system: ${totalContracts[0].count}`);
    
    if (contractsWithoutProduct[0].count > 0) {
      console.log(`⚠️ ${contractsWithoutProduct[0].count} contracts missing product_id`);
    }
    
    if (contractsWithoutCollector[0].count > 0) {
      console.log(`⚠️ ${contractsWithoutCollector[0].count} contracts missing collector_id`);
    }
    
    if (contractsWithoutLine[0].count > 0) {
      console.log(`⚠️ ${contractsWithoutLine[0].count} contracts missing line`);
    }
    
    console.log('\n🔧 Recommendations:');
    console.log('   1. Ensure all contracts have valid product_id');
    console.log('   2. Add collector_id to contracts that are missing it');
    console.log('   3. Set line values for contracts that are missing them');
    console.log('   4. Verify that all foreign key references are valid');
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

// Run the check
checkInstallmentsSchema().catch(console.error);

console.log('\n📋 To run this script:');
console.log('   1. Make sure database connection is working');
console.log('   2. Run: node scripts/check_installments_schema.js');
console.log('   3. Review the output for any issues');
console.log('   4. Fix any missing columns or data integrity issues');
