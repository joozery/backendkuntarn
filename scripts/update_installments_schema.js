const { query } = require('../db/db');

async function updateInstallmentsSchema() {
  console.log('🔧 Updating installments table schema...\n');

  try {
    // 1. Add customer details columns
    console.log('1. Adding customer details columns...');
    const customerColumns = [
      'customer_title VARCHAR(10)',
      'customer_age INT',
      'customer_moo VARCHAR(50)',
      'customer_road VARCHAR(100)',
      'customer_subdistrict VARCHAR(100)',
      'customer_district VARCHAR(100)',
      'customer_province VARCHAR(100)',
      'customer_phone1 VARCHAR(20)',
      'customer_phone2 VARCHAR(20)',
      'customer_phone3 VARCHAR(20)',
      'customer_email VARCHAR(255)'
    ];

    for (const column of customerColumns) {
      try {
        await query(`ALTER TABLE installments ADD COLUMN ${column}`);
        console.log(`✅ Added column: ${column.split(' ')[0]}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️ Column already exists: ${column.split(' ')[0]}`);
        } else {
          console.error(`❌ Error adding column ${column.split(' ')[0]}:`, error.message);
        }
      }
    }

    // 2. Add guarantor details columns
    console.log('\n2. Adding guarantor details columns...');
    const guarantorColumns = [
      'guarantor_id BIGINT',
      'guarantor_title VARCHAR(10)',
      'guarantor_name VARCHAR(255)',
      'guarantor_surname VARCHAR(255)',
      'guarantor_nickname VARCHAR(100)',
      'guarantor_age INT',
      'guarantor_id_card VARCHAR(13)',
      'guarantor_address TEXT',
      'guarantor_moo VARCHAR(50)',
      'guarantor_road VARCHAR(100)',
      'guarantor_subdistrict VARCHAR(100)',
      'guarantor_district VARCHAR(100)',
      'guarantor_province VARCHAR(100)',
      'guarantor_phone1 VARCHAR(20)',
      'guarantor_phone2 VARCHAR(20)',
      'guarantor_phone3 VARCHAR(20)',
      'guarantor_email VARCHAR(255)'
    ];

    for (const column of guarantorColumns) {
      try {
        await query(`ALTER TABLE installments ADD COLUMN ${column}`);
        console.log(`✅ Added column: ${column.split(' ')[0]}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️ Column already exists: ${column.split(' ')[0]}`);
        } else {
          console.error(`❌ Error adding column ${column.split(' ')[0]}:`, error.message);
        }
      }
    }

    // 3. Add product details columns
    console.log('\n3. Adding product details columns...');
    const productColumns = [
      'product_description TEXT',
      'product_category VARCHAR(100)',
      'product_model VARCHAR(100)',
      'product_serial_number VARCHAR(100)'
    ];

    for (const column of productColumns) {
      try {
        await query(`ALTER TABLE installments ADD COLUMN ${column}`);
        console.log(`✅ Added column: ${column.split(' ')[0]}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️ Column already exists: ${column.split(' ')[0]}`);
        } else {
          console.error(`❌ Error adding column ${column.split(' ')[0]}:`, error.message);
        }
      }
    }

    // 4. Add employee and checker columns
    console.log('\n4. Adding employee and checker columns...');
    const employeeColumns = [
      'inspector_id BIGINT',
      'line VARCHAR(50)'
    ];

    for (const column of employeeColumns) {
      try {
        await query(`ALTER TABLE installments ADD COLUMN ${column}`);
        console.log(`✅ Added column: ${column.split(' ')[0]}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️ Column already exists: ${column.split(' ')[0]}`);
        } else {
          console.error(`❌ Error adding column ${column.split(' ')[0]}:`, error.message);
        }
      }
    }

    // 5. Add plan details columns
    console.log('\n5. Adding plan details columns...');
    const planColumns = [
      'down_payment DECIMAL(10,2) DEFAULT 0',
      'monthly_payment DECIMAL(10,2)',
      'months INT',
      'collection_date VARCHAR(20)',
      'contract_date DATE'
    ];

    for (const column of planColumns) {
      try {
        await query(`ALTER TABLE installments ADD COLUMN ${column}`);
        console.log(`✅ Added column: ${column.split(' ')[0]}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️ Column already exists: ${column.split(' ')[0]}`);
        } else {
          console.error(`❌ Error adding column ${column.split(' ')[0]}:`, error.message);
        }
      }
    }

    // 6. Add foreign key constraints
    console.log('\n6. Adding foreign key constraints...');
    try {
      await query(`
        ALTER TABLE installments 
        ADD CONSTRAINT fk_installments_guarantor_id 
        FOREIGN KEY (guarantor_id) REFERENCES customers(id) ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key: guarantor_id -> customers(id)');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️ Foreign key already exists: guarantor_id');
      } else {
        console.error('❌ Error adding foreign key guarantor_id:', error.message);
      }
    }

    try {
      await query(`
        ALTER TABLE installments 
        ADD CONSTRAINT fk_installments_inspector_id 
        FOREIGN KEY (inspector_id) REFERENCES checkers(id) ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key: inspector_id -> checkers(id)');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️ Foreign key already exists: inspector_id');
      } else {
        console.error('❌ Error adding foreign key inspector_id:', error.message);
      }
    }

    // 7. Create indexes for performance
    console.log('\n7. Creating indexes...');
    const indexes = [
      'idx_installments_guarantor_id',
      'idx_installments_inspector_id',
      'idx_installments_contract_date',
      'idx_installments_line'
    ];

    for (const index of indexes) {
      try {
        const column = index.replace('idx_installments_', '');
        await query(`CREATE INDEX ${index} ON installments(${column})`);
        console.log(`✅ Created index: ${index}`);
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠️ Index already exists: ${index}`);
        } else {
          console.error(`❌ Error creating index ${index}:`, error.message);
        }
      }
    }

    console.log('\n✅ Installments table schema updated successfully!');
    console.log('📋 New columns added:');
    console.log('   - Customer details: title, age, address, phones, email');
    console.log('   - Guarantor details: id, title, name, address, phones, email');
    console.log('   - Product details: description, category, model, serialNumber');
    console.log('   - Employee details: inspector_id, line');
    console.log('   - Plan details: down_payment, monthly_payment, months, collection_date, contract_date');

  } catch (error) {
    console.error('❌ Error updating installments schema:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
  }
}

// Run the update
updateInstallmentsSchema()
  .then(() => {
    console.log('\n🏁 Schema update completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Schema update failed:', error);
    process.exit(1);
  }); 