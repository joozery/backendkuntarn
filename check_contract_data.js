const { query } = require('./db/db');

async function checkContractData() {
  console.log('🔍 Checking Contract Data in Database...\n');

  try {
    // Check if contract ID 9 exists
    console.log('1. Checking if contract ID 9 exists...');
    const contract9 = await query('SELECT * FROM installments WHERE id = ?', [9]);
    console.log('✅ Contract 9 found:', contract9.length > 0);
    
    if (contract9.length > 0) {
      console.log('📋 Contract 9 data:', contract9[0]);
    }

    // Check all contracts
    console.log('\n2. Checking all contracts...');
    const allContracts = await query('SELECT id, contract_number, customer_id, product_id, total_amount FROM installments ORDER BY id');
    console.log('✅ Total contracts:', allContracts.length);
    
    allContracts.forEach(contract => {
      console.log(`   ID ${contract.id}: ${contract.contract_number} (Customer: ${contract.customer_id}, Product: ${contract.product_id}, Amount: ${contract.total_amount})`);
    });

    // Check if customers table has data
    console.log('\n3. Checking customers table...');
    const customers = await query('SELECT id, name, surname, full_name FROM customers LIMIT 5');
    console.log('✅ Customers found:', customers.length);
    customers.forEach(customer => {
      console.log(`   ID ${customer.id}: ${customer.full_name}`);
    });

    // Check if products table has data
    console.log('\n4. Checking products table...');
    const products = await query('SELECT id, name, price FROM products LIMIT 5');
    console.log('✅ Products found:', products.length);
    products.forEach(product => {
      console.log(`   ID ${product.id}: ${product.name} (${product.price})`);
    });

    // Test the exact query used in API
    if (contract9.length > 0) {
      console.log('\n5. Testing API query for contract 9...');
      const apiQuery = `
        SELECT 
          i.id,
          i.contract_number as contractNumber,
          i.contract_date as contractDate,
          i.customer_id as customerId,
          i.product_id as productId,
          i.product_name as productName,
          i.total_amount as totalAmount,
          i.installment_amount as installmentAmount,
          i.remaining_amount as remainingAmount,
          i.installment_period as installmentPeriod,
          i.start_date as startDate,
          i.end_date as endDate,
          i.branch_id as branchId,
          i.salesperson_id as salespersonId,
          i.inspector_id as inspectorId,
          i.line,
          i.customer_title as customerTitle,
          i.customer_age as customerAge,
          i.customer_moo as customerMoo,
          i.customer_road as customerRoad,
          i.customer_subdistrict as customerSubdistrict,
          i.customer_district as customerDistrict,
          i.customer_province as customerProvince,
          i.customer_phone1 as customerPhone1,
          i.customer_phone2 as customerPhone2,
          i.customer_phone3 as customerPhone3,
          i.customer_email as customerEmail,
          i.guarantor_id as guarantorId,
          i.guarantor_title as guarantorTitle,
          i.guarantor_name as guarantorName,
          i.guarantor_surname as guarantorSurname,
          i.guarantor_nickname as guarantorNickname,
          i.guarantor_age as guarantorAge,
          i.guarantor_id_card as guarantorIdCard,
          i.guarantor_address as guarantorAddress,
          i.guarantor_moo as guarantorMoo,
          i.guarantor_road as guarantorRoad,
          i.guarantor_subdistrict as guarantorSubdistrict,
          i.guarantor_district as guarantorDistrict,
          i.guarantor_province as guarantorProvince,
          i.guarantor_phone1 as guarantorPhone1,
          i.guarantor_phone2 as guarantorPhone2,
          i.guarantor_phone3 as guarantorPhone3,
          i.guarantor_email as guarantorEmail,
          i.product_description as productDescription,
          i.product_category as productCategory,
          i.product_model as productModel,
          i.product_serial_number as productSerialNumber,
          i.down_payment as downPayment,
          i.monthly_payment as monthlyPayment,
          i.months,
          i.collection_date as collectionDate,
          i.status,
          i.created_at as createdAt,
          i.updated_at as updatedAt,
          c.name as customerName,
          c.surname as customerSurname,
          c.full_name as customerFullName,
          c.phone as customerPhone,
          c.address as customerAddress,
          p.name as productName,
          p.price as productPrice,
          b.name as branchName,
          e.name as salespersonName,
          e.surname as salespersonSurname,
          e.full_name as salespersonFullName
        FROM installments i
        LEFT JOIN customers c ON i.customer_id = c.id
        LEFT JOIN products p ON i.product_id = p.id
        LEFT JOIN branches b ON i.branch_id = b.id
        LEFT JOIN employees e ON i.salesperson_id = e.id
        WHERE i.id = ?
      `;
      
      const apiResults = await query(apiQuery, [9]);
      console.log('✅ API query results for contract 9:', apiResults.length);
      if (apiResults.length > 0) {
        console.log('📋 API result:', {
          id: apiResults[0].id,
          contractNumber: apiResults[0].contractNumber,
          customerName: apiResults[0].customerName,
          productName: apiResults[0].productName,
          totalAmount: apiResults[0].totalAmount
        });
      }
    }

  } catch (error) {
    console.error('❌ Database check error:', error.message);
    console.error('Error details:', error);
  }
}

// Run the check
checkContractData(); 