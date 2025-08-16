const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupAdminUsers() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kuntarn_db'
    });

    console.log('🔌 Connected to database successfully');

    // Read and execute the SQL file
    const fs = require('fs');
    const path = require('path');
    
    const sqlFilePath = path.join(__dirname, '../db/create_admin_users_table.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error('❌ SQL file not found:', sqlFilePath);
      return;
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL statements by semicolon and execute each one
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`🔨 Executing statement ${i + 1}/${statements.length}...`);
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          // Continue with next statement
        }
      }
    }

    console.log('🎉 Admin users table setup completed!');

    // Verify the table was created
    const [tables] = await connection.execute('SHOW TABLES LIKE "admin_users"');
    if (tables.length > 0) {
      console.log('✅ admin_users table exists');
      
      // Check if data was inserted
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM admin_users');
      console.log(`📊 Found ${users[0].count} admin users`);
      
      // Show sample data
      const [sampleUsers] = await connection.execute('SELECT username, full_name, role, is_active FROM admin_users LIMIT 5');
      console.log('👥 Sample admin users:');
      sampleUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.full_name}) - ${user.role} - ${user.is_active ? 'Active' : 'Inactive'}`);
      });
    } else {
      console.log('❌ admin_users table was not created');
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
setupAdminUsers(); 