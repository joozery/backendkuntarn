const { query } = require('../db/db');

async function createSampleCheckers() {
  try {
    console.log('Creating sample checkers...');
    
    // Check if checkers table exists and has data
    const checkQuery = 'SELECT COUNT(*) as count FROM checkers';
    const checkResult = await query(checkQuery);
    
    if (checkResult[0].count > 0) {
      console.log('Checkers table already has data, skipping...');
      return;
    }
    
    // Sample checkers data
    const sampleCheckers = [
      {
        name: 'สมชาย',
        surname: 'ใจดี',
        full_name: 'สมชาย ใจดี',
        phone: '081-234-5678',
        email: 'somchai@example.com',
        branch_id: 1
      },
      {
        name: 'สมหญิง',
        surname: 'รักดี',
        full_name: 'สมหญิง รักดี',
        phone: '082-345-6789',
        email: 'somying@example.com',
        branch_id: 1
      },
      {
        name: 'สมศักดิ์',
        surname: 'มั่นคง',
        full_name: 'สมศักดิ์ มั่นคง',
        phone: '083-456-7890',
        email: 'somsak@example.com',
        branch_id: 1
      }
    ];
    
    // Insert sample checkers
    for (const checker of sampleCheckers) {
      const insertQuery = `
        INSERT INTO checkers (name, surname, full_name, phone, email, branch_id, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
      `;
      
      await query(insertQuery, [
        checker.name,
        checker.surname,
        checker.full_name,
        checker.phone,
        checker.email,
        checker.branch_id
      ]);
      
      console.log(`Created checker: ${checker.full_name}`);
    }
    
    console.log('Sample checkers created successfully!');
    
  } catch (error) {
    console.error('Error creating sample checkers:', error);
    throw error;
  }
}

// Run the function
createSampleCheckers()
  .then(() => {
    console.log('Sample checkers setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Sample checkers setup failed:', error);
    process.exit(1);
  }); 