const fs = require('fs');
const path = require('path');
const { query } = require('../db/db');

async function setupDatabase() {
  try {
    console.log('🔄 Starting database setup...');
    
    // Read SQL files
    const updateSchemaPath = path.join(__dirname, '../db/update_schema.sql');
    const seedDataPath = path.join(__dirname, '../db/seed_data.sql');
    
    const updateSchemaSQL = fs.readFileSync(updateSchemaPath, 'utf8');
    const seedDataSQL = fs.readFileSync(seedDataPath, 'utf8');
    
    // Split SQL into individual statements
    const updateStatements = updateSchemaSQL.split(';').filter(stmt => stmt.trim());
    const seedStatements = seedDataSQL.split(';').filter(stmt => stmt.trim());
    
    console.log('📝 Running schema updates...');
    
    // Execute update schema statements
    for (let i = 0; i < updateStatements.length; i++) {
      const statement = updateStatements[i].trim();
      if (statement) {
        try {
          await query(statement);
          console.log(`✅ Schema update ${i + 1}/${updateStatements.length} completed`);
        } catch (error) {
          console.log(`⚠️  Schema update ${i + 1} skipped (may already exist): ${error.message}`);
        }
      }
    }
    
    console.log('🌱 Running seed data...');
    
    // Execute seed data statements
    for (let i = 0; i < seedStatements.length; i++) {
      const statement = seedStatements[i].trim();
      if (statement) {
        try {
          await query(statement);
          console.log(`✅ Seed data ${i + 1}/${seedStatements.length} completed`);
        } catch (error) {
          console.log(`⚠️  Seed data ${i + 1} skipped (may already exist): ${error.message}`);
        }
      }
    }
    
    console.log('🎉 Database setup completed successfully!');
    
    // Verify data
    console.log('🔍 Verifying data...');
    const branches = await query('SELECT COUNT(*) as count FROM branches');
    const checkers = await query('SELECT COUNT(*) as count FROM checkers');
    const customers = await query('SELECT COUNT(*) as count FROM customers');
    const products = await query('SELECT COUNT(*) as count FROM products');
    
    console.log(`📊 Database contains:`);
    console.log(`   - Branches: ${branches[0].count}`);
    console.log(`   - Checkers: ${checkers[0].count}`);
    console.log(`   - Customers: ${customers[0].count}`);
    console.log(`   - Products: ${products[0].count}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase().then(() => {
    console.log('✅ Setup script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Setup script failed:', error);
    process.exit(1);
  });
}

module.exports = { setupDatabase }; 