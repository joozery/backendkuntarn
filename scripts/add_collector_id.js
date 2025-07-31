const { query } = require('../db/db');
const fs = require('fs');
const path = require('path');

async function addCollectorIdColumn() {
  try {
    console.log('🔧 Adding collector_id column to installments table...');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '../db/add_collector_id_to_installments.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL commands
    const commands = sqlContent.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        console.log('Executing:', command.trim());
        await query(command);
      }
    }
    
    console.log('✅ Successfully added collector_id column to installments table');
    
    // Verify the column was added
    const result = await query('DESCRIBE installments');
    const hasCollectorId = result.some(col => col.Field === 'collector_id');
    
    if (hasCollectorId) {
      console.log('✅ collector_id column exists in installments table');
    } else {
      console.log('❌ collector_id column was not added');
    }
    
  } catch (error) {
    console.error('❌ Error adding collector_id column:', error);
  }
}

addCollectorIdColumn(); 