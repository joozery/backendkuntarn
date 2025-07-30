const fs = require('fs');
const path = require('path');
const { query } = require('../db/db');

async function updateInstallmentsSchema() {
  try {
    console.log('🔍 Updating installments table schema...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../db/update_installments_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('🔍 Executing:', statement.trim().substring(0, 100) + '...');
        await query(statement);
        console.log('✅ Statement executed successfully');
      }
    }
    
    console.log('✅ Installments table schema updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    
    // Check if columns already exist
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ Some columns already exist, continuing...');
    } else {
      throw error;
    }
  }
  
  process.exit(0);
}

updateInstallmentsSchema(); 