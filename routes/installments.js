const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

// Helper function to safely parse JSON
function safeJsonParse(jsonString) {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn('Failed to parse JSON:', e);
    return null;
  }
}

// Helper function to generate unique contract number
async function generateUniqueContractNumber() {
  try {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    // Get the latest contract number for today
    const latestContract = await query(
      'SELECT contract_number FROM installments WHERE contract_number LIKE ? ORDER BY contract_number DESC LIMIT 1',
      [`CT${year}${month}${day}%`]
    );
    
    let sequence = 1;
    if (latestContract.length > 0) {
      const lastNumber = latestContract[0].contract_number;
      const lastSequence = parseInt(lastNumber.slice(-4)); // Get last 4 digits
      sequence = lastSequence + 1;
    }
    
    const contractNumber = `CT${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
    console.log('🔍 Generated contract number:', contractNumber);
    
    return contractNumber;
  } catch (error) {
    console.error('❌ Error generating contract number:', error);
    // Fallback: use timestamp
    const timestamp = Date.now().toString().slice(-8);
    return `CT${timestamp}`;
  }
}

// Helper function to update inventory stock when product is sold
async function updateInventoryStock(inventoryId, branchId, sellDate, sellingCost, contractNumber) {
  try {
    console.log('🔍 Updating inventory stock for inventory ID:', inventoryId, 'branch:', branchId);
    
    // Get the inventory record directly
    const getInventoryQuery = 'SELECT product_name FROM inventory WHERE id = ?';
    const inventoryResult = await query(getInventoryQuery, [inventoryId]);
    
    if (inventoryResult.length === 0) {
      console.log('⚠️ Inventory record not found:', inventoryId);
      return false;
    }
    
    const productName = inventoryResult[0].product_name;
    
    // Update inventory: decrease remaining quantity, increase sold quantity, set sell date, selling cost, and contract number
    const updateQuery = `
      UPDATE inventory 
      SET 
        sold_quantity = sold_quantity + 1,
        remaining_quantity1 = 0,
        remaining_quantity2 = 0,
        sell_date = ?,
        selling_cost = ?,
        contract_number = ?,
        status = 'sold',
        updated_at = NOW()
      WHERE product_name = ? AND branch_id = ? AND remaining_quantity1 > 0
      ORDER BY receive_date ASC
      LIMIT 1
    `;
    
    const result = await query(updateQuery, [sellDate, sellingCost, contractNumber, productName, branchId]);
    
    if (result.affectedRows > 0) {
      console.log('✅ Inventory stock updated successfully for inventory ID:', inventoryId);
      return true;
    } else {
      console.log('⚠️ No inventory record found for inventory ID:', inventoryId, 'branch:', branchId);
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating inventory stock:', error);
    return false;
  }
}

// Helper function to create payment schedule
async function createPaymentSchedule(installmentId, installmentPeriod, monthlyPayment, startDate) {
  try {
    console.log('🔍 Creating payment schedule:', {
      installmentId,
      installmentPeriod,
      monthlyPayment,
      startDate
    });
    
    const payments = [];
    const start = new Date(startDate);
    
    // Create payment records for each month
    for (let i = 0; i < installmentPeriod; i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      // First payment is due on start date, others are monthly
      const paymentDate = i === 0 ? start : dueDate;
      
      payments.push({
        installment_id: installmentId,
        amount: monthlyPayment,
        payment_date: i === 0 ? paymentDate.toISOString().split('T')[0] : null, // First payment is paid
        due_date: dueDate.toISOString().split('T')[0],
        status: i === 0 ? 'paid' : 'pending', // First payment is paid, others are pending
        notes: i === 0 ? 'เงินดาวน์/งวดแรก' : `งวดที่ ${i + 1}`
      });
    }
    
    // Insert all payments
    const insertQuery = `
      INSERT INTO payments (installment_id, amount, payment_date, due_date, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    for (const payment of payments) {
      await query(insertQuery, [
        payment.installment_id,
        payment.amount,
        payment.payment_date,
        payment.due_date,
        payment.status,
        payment.notes
      ]);
    }
    
    console.log(`✅ Created ${payments.length} payment records for installment ${installmentId}`);
    
  } catch (error) {
    console.error('❌ Error creating payment schedule:', error);
    throw error;
  }
}

// GET /api/installments - Get all installments
router.get('/', async (req, res) => {
  try {
    const { branchId, status, customerId, search, month, year } = req.query;
    
    let sqlQuery = `
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
        i.customer_id_card as customerIdCard,
        i.customer_nickname as customerNickname,
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
        inv.product_name as productName,
        inv.cost_price as productPrice,
        b.name as branchName,
        e.name as salespersonName,
        e.surname as salespersonSurname,
        e.full_name as salespersonFullName,
        ch.name as inspectorName,
        ch.surname as inspectorSurname,
        ch.full_name as inspectorFullName,
        i.line
      FROM installments i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN inventory inv ON i.product_id = inv.id
      LEFT JOIN branches b ON i.branch_id = b.id
      LEFT JOIN employees e ON i.salesperson_id = e.id
      LEFT JOIN checkers ch ON i.inspector_id = ch.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branchId) {
      sqlQuery += ' AND i.branch_id = ?';
      params.push(branchId);
    }
    
    if (status) {
      sqlQuery += ' AND i.status = ?';
      params.push(status);
    }
    
    if (customerId) {
      sqlQuery += ' AND i.customer_id = ?';
      params.push(customerId);
    }
    
    if (month && year) {
      sqlQuery += ' AND MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?';
      params.push(month, year);
    }
    
    if (search) {
      sqlQuery += ' AND (i.contract_number LIKE ? OR c.full_name LIKE ? OR p.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sqlQuery += ' ORDER BY i.created_at DESC';
    
    const results = await query(sqlQuery, params);
    
    // Build structured objects from individual fields
    const processedResults = results.map(result => ({
      ...result,
      // Add employee information for frontend
      employeeName: result.salespersonFullName || result.salespersonName || 'ไม่ระบุ',
      inspectorName: result.inspectorFullName || result.inspectorName || 'ไม่ระบุ',
      line: result.line || 'ไม่ระบุ',
      customerDetails: {
        title: result.customerTitle,
        age: result.customerAge,
        moo: result.customerMoo,
        road: result.customerRoad,
        subdistrict: result.customerSubdistrict,
        district: result.customerDistrict,
        province: result.customerProvince,
        phone1: result.customerPhone1,
        phone2: result.customerPhone2,
        phone3: result.customerPhone3,
        email: result.customerEmail
      },
      guarantorDetails: {
        id: result.guarantorId,
        title: result.guarantorTitle,
        name: result.guarantorName,
        surname: result.guarantorSurname,
        nickname: result.guarantorNickname,
        age: result.guarantorAge,
        idCard: result.guarantorIdCard,
        address: result.guarantorAddress,
        moo: result.guarantorMoo,
        road: result.guarantorRoad,
        subdistrict: result.guarantorSubdistrict,
        district: result.guarantorDistrict,
        province: result.guarantorProvince,
        phone1: result.guarantorPhone1,
        phone2: result.guarantorPhone2,
        phone3: result.guarantorPhone3,
        email: result.guarantorEmail
      },
      productDetails: {
        description: result.productDescription,
        category: result.productCategory,
        model: result.productModel,
        serialNumber: result.productSerialNumber
      },
      plan: {
        downPayment: result.downPayment,
        monthlyPayment: result.monthlyPayment,
        months: result.months,
        collectionDate: result.collectionDate
      }
    }));
    
    res.json({
      success: true,
      data: processedResults,
      count: processedResults.length
    });
  } catch (error) {
    console.error('Error in installments GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/installments/:id - Get installment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 GET /api/installments/:id called with id:', id);
    
    const sqlQuery = `
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
        inv.product_name as productName,
        inv.cost_price as productPrice,
        b.name as branchName,
        e.name as salespersonName,
        e.surname as salespersonSurname,
        e.full_name as salespersonFullName
      FROM installments i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN inventory inv ON i.product_id = inv.id
      LEFT JOIN branches b ON i.branch_id = b.id
      LEFT JOIN employees e ON i.salesperson_id = e.id
      WHERE i.id = ?
    `;
    
    const results = await query(sqlQuery, [id]);
    console.log('🔍 Query results for id', id, ':', results.length, 'records');
    
    if (results.length === 0) {
      console.log('❌ No installment found for id:', id);
      return res.status(404).json({ 
        error: 'Installment not found' 
      });
    }
    
    // Build structured objects from individual fields
    const result = {
      ...results[0],
      customerDetails: {
        title: results[0].customerTitle,
        age: results[0].customerAge,
        moo: results[0].customerMoo,
        road: results[0].customerRoad,
        subdistrict: results[0].customerSubdistrict,
        district: results[0].customerDistrict,
        province: results[0].customerProvince,
        phone1: results[0].customerPhone1,
        phone2: results[0].customerPhone2,
        phone3: results[0].customerPhone3,
        email: results[0].customerEmail
      },
      guarantorDetails: {
        id: results[0].guarantorId,
        title: results[0].guarantorTitle,
        name: results[0].guarantorName,
        surname: results[0].guarantorSurname,
        nickname: results[0].guarantorNickname,
        age: results[0].guarantorAge,
        idCard: results[0].guarantorIdCard,
        address: results[0].guarantorAddress,
        moo: results[0].guarantorMoo,
        road: results[0].guarantorRoad,
        subdistrict: results[0].guarantorSubdistrict,
        district: results[0].guarantorDistrict,
        province: results[0].guarantorProvince,
        phone1: results[0].guarantorPhone1,
        phone2: results[0].guarantorPhone2,
        phone3: results[0].guarantorPhone3,
        email: results[0].guarantorEmail
      },
      productDetails: {
        description: results[0].productDescription,
        category: results[0].productCategory,
        model: results[0].productModel,
        serialNumber: results[0].productSerialNumber
      },
      plan: {
        downPayment: results[0].downPayment,
        monthlyPayment: results[0].monthlyPayment,
        months: results[0].months
      }
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in installment GET by ID:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/installments/:id/payments - Get installment payments
router.get('/:id/payments', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    let query = `
      SELECT 
        p.id,
        p.installment_id as installmentId,
        p.amount,
        p.payment_date as paymentDate,
        p.due_date as dueDate,
        p.status,
        p.notes,
        p.created_at as createdAt,
        pc.checker_id as checkerId,
        ch.name as checkerName,
        ch.surname as checkerSurname,
        ch.full_name as checkerFullName
      FROM payments p
      LEFT JOIN payment_collections pc ON p.id = pc.payment_id
      LEFT JOIN checkers ch ON pc.checker_id = ch.id
      WHERE p.installment_id = ?
    `;
    
    const params = [id];
    
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY p.due_date ASC';
    
    const results = await query(query, params);
    
    // Calculate summary
    const totalPayments = results.length;
    const paidPayments = results.filter(p => p.status === 'paid');
    const pendingPayments = results.filter(p => p.status === 'pending');
    const overduePayments = results.filter(p => {
      if (p.status === 'paid') return false;
      return new Date(p.dueDate) < new Date();
    });
    
    const summary = {
      totalPayments,
      paidCount: paidPayments.length,
      pendingCount: pendingPayments.length,
      overdueCount: overduePayments.length,
      paidAmount: paidPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
      remainingAmount: (pendingPayments.length + overduePayments.length) * parseFloat(results[0]?.amount || 0)
    };
    
    res.json({
      success: true,
      data: results,
      summary,
      count: results.length
    });
  } catch (error) {
    console.error('Error in installment payments GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/installments/:id/collections - Get installment collections
router.get('/:id/collections', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    let query = `
      SELECT 
        pc.id,
        pc.checker_id as checkerId,
        pc.customer_id as customerId,
        pc.installment_id as installmentId,
        pc.amount,
        pc.payment_date as paymentDate,
        pc.status,
        pc.notes,
        pc.created_at as createdAt,
        ch.name as checkerName,
        ch.surname as checkerSurname,
        ch.full_name as checkerFullName,
        c.name as customerName,
        c.surname as customerSurname,
        c.full_name as customerFullName
      FROM payment_collections pc
      LEFT JOIN checkers ch ON pc.checker_id = ch.id
      LEFT JOIN customers c ON pc.customer_id = c.id
      WHERE pc.installment_id = ?
    `;
    
    const params = [id];
    
    if (status) {
      query += ' AND pc.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY pc.payment_date DESC';
    
    const results = await query(query, params);
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error in installment collections GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// POST /api/installments - Create new installment
router.post('/', async (req, res) => {
  try {
    const {
      // Basic contract info
      contractNumber,
      contractDate,
      customerId,
      productId,
      productName,
      totalAmount,
      installmentAmount,
      installmentPeriod,
      startDate,
      endDate,
      branchId,
      salespersonId,
      
      // Customer details
      customerDetails,
      
      // Guarantor details
      guarantorId,
      guarantorDetails,
      
      // Product details
      productDetails,
      
      // Employee details
      inspectorId,
      line,
      
      // Plan details
      plan
    } = req.body;
    
    console.log('🔍 POST /api/installments - Request body:', req.body);
    
    // Generate unique contract number if not provided or if duplicate
    let finalContractNumber = contractNumber;
    let contractNumberWarning = null;
    
    if (!finalContractNumber) {
      // If no contract number provided, generate automatically
      finalContractNumber = await generateUniqueContractNumber();
      console.log('🔍 No contract number provided, generated:', finalContractNumber);
    } else {
      // If contract number provided, check if it already exists
      const existingContract = await query(
        'SELECT id FROM installments WHERE contract_number = ?',
        [finalContractNumber]
      );
      
      if (existingContract.length > 0) {
        // If duplicate, generate new one and notify user
        const originalNumber = finalContractNumber;
        finalContractNumber = await generateUniqueContractNumber();
        contractNumberWarning = `เลขที่สัญญา "${originalNumber}" มีอยู่แล้ว ระบบได้สร้างเลขใหม่: "${finalContractNumber}"`;
        console.log(`🔍 Contract number "${originalNumber}" already exists, generated new one:`, finalContractNumber);
      } else {
        console.log('🔍 Using provided contract number:', finalContractNumber);
      }
    }
    
    console.log('🔍 Using contract number:', finalContractNumber);
    
    // Check required fields
    const requiredFields = {
      customerId,
      productId,
      totalAmount,
      branchId
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: `Required fields missing: ${missingFields.join(', ')}`,
        missingFields
      });
    }
    
    // Use plan.monthlyPayment if installmentAmount is not provided
    const monthlyPayment = installmentAmount || plan?.monthlyPayment;
    if (!monthlyPayment) {
      console.log('❌ Missing monthly payment');
      return res.status(400).json({ 
        error: 'Missing monthly payment',
        message: 'Either installmentAmount or plan.monthlyPayment is required' 
      });
    }
    
    // Update customer information if customerDetails provided
    if (customerDetails && customerId) {
      try {
        const customerUpdateQuery = `
          UPDATE customers SET 
            name = ?, 
            surname = ?, 
            full_name = ?,
            nickname = ?,
            phone = ?,
            address = ?,
            updated_at = NOW()
          WHERE id = ?
        `;
        
        const fullName = `${customerDetails.title || ''} ${customerDetails.name || ''}`.trim();
        const address = [
          customerDetails.address,
          customerDetails.moo,
          customerDetails.road,
          customerDetails.subdistrict,
          customerDetails.district,
          customerDetails.province
        ].filter(Boolean).join(' ');
        
        await query(customerUpdateQuery, [
          customerDetails.name || '',
          customerDetails.surname || '',
          fullName,
          customerDetails.nickname || '',
          customerDetails.phone1 || '',
          address,
          customerId
        ]);
        
        console.log('✅ Updated customer information');
      } catch (customerError) {
        console.log('⚠️ Failed to update customer information:', customerError.message);
      }
    }
    
    // Update or create guarantor if guarantorDetails provided
    if (guarantorDetails && guarantorId) {
      try {
        const guarantorUpdateQuery = `
          UPDATE customers SET 
            guarantor_name = ?,
            guarantor_id_card = ?,
            guarantor_nickname = ?,
            guarantor_phone = ?,
            guarantor_address = ?,
            updated_at = NOW()
          WHERE id = ?
        `;
        
        const guarantorAddress = [
          guarantorDetails.address,
          guarantorDetails.moo,
          guarantorDetails.road,
          guarantorDetails.subdistrict,
          guarantorDetails.district,
          guarantorDetails.province
        ].filter(Boolean).join(' ');
        
        await query(guarantorUpdateQuery, [
          guarantorDetails.name || '',
          guarantorDetails.idCard || '',
          guarantorDetails.nickname || '',
          guarantorDetails.phone1 || '',
          guarantorAddress,
          guarantorId
        ]);
        
        console.log('✅ Updated guarantor information');
      } catch (guarantorError) {
        console.log('⚠️ Failed to update guarantor information:', guarantorError.message);
      }
    }
    
    // Update product information if productDetails provided
    if (productDetails && productId) {
      try {
        const productUpdateQuery = `
          UPDATE products SET 
            description = ?,
            updated_at = NOW()
          WHERE id = ?
        `;
        
        const productDescription = [
          `รุ่น: ${productDetails.model || ''}`,
          `S/N: ${productDetails.serialNumber || ''}`,
          productDetails.description || ''
        ].filter(Boolean).join(' | ');
        
        await query(productUpdateQuery, [
          productDescription,
          productId
        ]);
        
        console.log('✅ Updated product information');
      } catch (productError) {
        console.log('⚠️ Failed to update product information:', productError.message);
      }
    }
    
    // Insert installment record with all details
    const sqlQuery = `
      INSERT INTO installments (
        contract_number, contract_date, customer_id, product_id, product_name, 
        total_amount, installment_amount, remaining_amount, installment_period, 
        start_date, end_date, branch_id, salesperson_id, inspector_id, line,
        customer_title, customer_age, customer_moo, customer_road, customer_subdistrict, 
        customer_district, customer_province, customer_phone1, customer_phone2, customer_phone3, customer_email,
        guarantor_id, guarantor_title, guarantor_name, guarantor_surname, guarantor_nickname,
        guarantor_age, guarantor_id_card, guarantor_address, guarantor_moo, guarantor_road,
        guarantor_subdistrict, guarantor_district, guarantor_province, guarantor_phone1,
        guarantor_phone2, guarantor_phone3, guarantor_email,
        product_description, product_category, product_model, product_serial_number,
        down_payment, monthly_payment, months, collection_date,
        status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;
    
    const remainingAmount = totalAmount - (plan?.downPayment || 0);
    const downPayment = plan?.downPayment || 0;
    const months = plan?.months || installmentPeriod;
    
    // Extract customer details
    const customerTitle = customerDetails?.title || null;
    const customerAge = customerDetails?.age || null;
    const customerMoo = customerDetails?.moo || null;
    const customerRoad = customerDetails?.road || null;
    const customerSubdistrict = customerDetails?.subdistrict || null;
    const customerDistrict = customerDetails?.district || null;
    const customerProvince = customerDetails?.province || null;
    const customerPhone1 = customerDetails?.phone1 || null;
    const customerPhone2 = customerDetails?.phone2 || null;
    const customerPhone3 = customerDetails?.phone3 || null;
    const customerEmail = customerDetails?.email || null;
    
    // Extract guarantor details
    const guarantorIdValue = guarantorId || null;
    const guarantorTitle = guarantorDetails?.title || null;
    const guarantorName = guarantorDetails?.name || null;
    const guarantorSurname = guarantorDetails?.surname || null;
    const guarantorNickname = guarantorDetails?.nickname || null;
    const guarantorAge = guarantorDetails?.age || null;
    const guarantorIdCard = guarantorDetails?.idCard || null;
    const guarantorAddress = guarantorDetails?.address || null;
    const guarantorMoo = guarantorDetails?.moo || null;
    const guarantorRoad = guarantorDetails?.road || null;
    const guarantorSubdistrict = guarantorDetails?.subdistrict || null;
    const guarantorDistrict = guarantorDetails?.district || null;
    const guarantorProvince = guarantorDetails?.province || null;
    const guarantorPhone1 = guarantorDetails?.phone1 || null;
    const guarantorPhone2 = guarantorDetails?.phone2 || null;
    const guarantorPhone3 = guarantorDetails?.phone3 || null;
    const guarantorEmail = guarantorDetails?.email || null;
    
    // Extract product details
    const productDescription = productDetails?.description || null;
    const productCategory = productDetails?.category || null;
    const productModel = productDetails?.model || null;
    const productSerialNumber = productDetails?.serialNumber || null;
    
    // Helper function to convert date format
    function convertDateFormat(dateString) {
      if (!dateString) return null;
      
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // If it's in DD-MM-YYYY format, convert to YYYY-MM-DD
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const parts = dateString.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      
      // If it's in DD-MM-YYYY format (Thai year), convert to YYYY-MM-DD
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const parts = dateString.split('-');
        const thaiYear = parseInt(parts[2]);
        const adYear = thaiYear - 543; // Convert Thai year to AD year
        return `${adYear}-${parts[1]}-${parts[0]}`;
      }
      
      // If it's just a day number, return null (we'll handle this differently)
      if (/^\d{1,2}$/.test(dateString)) {
        return null;
      }
      
      return null;
    }
    
    const collectionDate = convertDateFormat(plan?.collectionDate);
    
    const params = [
      finalContractNumber, contractDate, customerId, productId, productName, totalAmount,
      monthlyPayment, remainingAmount, installmentPeriod, startDate,
      endDate, branchId, salespersonId, inspectorId, line,
      customerTitle, customerAge, customerMoo, customerRoad, customerSubdistrict,
      customerDistrict, customerProvince, customerPhone1, customerPhone2, customerPhone3, customerEmail,
      guarantorIdValue, guarantorTitle, guarantorName, guarantorSurname, guarantorNickname,
      guarantorAge, guarantorIdCard, guarantorAddress, guarantorMoo, guarantorRoad,
      guarantorSubdistrict, guarantorDistrict, guarantorProvince, guarantorPhone1,
      guarantorPhone2, guarantorPhone3, guarantorEmail,
      productDescription, productCategory, productModel, productSerialNumber,
      downPayment, monthlyPayment, months, collectionDate
    ];
    
    console.log('🔍 SQL Query:', sqlQuery);
    console.log('🔍 Parameters:', params);
    
    const result = await query(sqlQuery, params);
    
    // Get the created installment
    const installmentQuery = `
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
        i.inspector_id as inspectorId,
        i.line,
        i.down_payment as downPayment,
        i.monthly_payment as monthlyPayment,
        i.months,
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
    
    const installment = await query(installmentQuery, [result.insertId]);
    
    // Build structured objects for response
    const installmentData = {
      ...installment[0],
      contractNumber: finalContractNumber,
      customerDetails: {
        title: installment[0].customerTitle,
        age: installment[0].customerAge,
        moo: installment[0].customerMoo,
        road: installment[0].customerRoad,
        subdistrict: installment[0].customerSubdistrict,
        district: installment[0].customerDistrict,
        province: installment[0].customerProvince,
        phone1: installment[0].customerPhone1,
        phone2: installment[0].customerPhone2,
        phone3: installment[0].customerPhone3,
        email: installment[0].customerEmail
      },
      guarantorDetails: {
        id: installment[0].guarantorId,
        title: installment[0].guarantorTitle,
        name: installment[0].guarantorName,
        surname: installment[0].guarantorSurname,
        nickname: installment[0].guarantorNickname,
        age: installment[0].guarantorAge,
        idCard: installment[0].guarantorIdCard,
        address: installment[0].guarantorAddress,
        moo: installment[0].guarantorMoo,
        road: installment[0].guarantorRoad,
        subdistrict: installment[0].guarantorSubdistrict,
        district: installment[0].guarantorDistrict,
        province: installment[0].guarantorProvince,
        phone1: installment[0].guarantorPhone1,
        phone2: installment[0].guarantorPhone2,
        phone3: installment[0].guarantorPhone3,
        email: installment[0].guarantorEmail
      },
      productDetails: {
        description: installment[0].productDescription,
        category: installment[0].productCategory,
        model: installment[0].productModel,
        serialNumber: installment[0].productSerialNumber
      },
      plan: {
        downPayment: installment[0].downPayment,
        monthlyPayment: installment[0].monthlyPayment,
        months: installment[0].months,
        collectionDate: installment[0].collectionDate || plan?.collectionDate || null
      }
    };
    
    // Update inventory stock when product is sold
    try {
      console.log('🔍 Updating inventory stock for inventory ID:', productId);
      const sellDate = contractDate || new Date().toISOString().split('T')[0];
      const sellingCost = totalAmount || 0;
      await updateInventoryStock(productId, branchId, sellDate, sellingCost, contractNumber);
    } catch (inventoryError) {
      console.log('⚠️ Inventory stock update failed, but installment was created:', inventoryError.message);
    }
    
    // Create payment schedule automatically (if payments table exists)
    try {
      console.log('🔍 Creating payment schedule for installment:', result.insertId);
      await createPaymentSchedule(result.insertId, installmentPeriod, monthlyPayment, startDate);
      
      res.status(201).json({
        success: true,
        data: installmentData,
        message: 'Installment created successfully with payment schedule',
        warning: contractNumberWarning
      });
    } catch (paymentError) {
      console.log('⚠️ Payment schedule creation failed, but installment was created:', paymentError.message);
      
      res.status(201).json({
        success: true,
        data: installmentData,
        message: 'Installment created successfully (payment schedule will be created when database is updated)',
        warning: contractNumberWarning,
        paymentScheduleWarning: 'Payment schedule creation failed. Please run database setup script.'
      });
    }
  } catch (error) {
    console.error('Error in installment POST:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// PUT /api/installments/:id/payments/:paymentId - Update payment status
router.put('/:id/payments/:paymentId', async (req, res) => {
  try {
    const { id, paymentId } = req.params;
    const { status, paymentDate, notes, checkerId } = req.body;
    
    console.log('🔍 Updating payment:', { paymentId, status, paymentDate, notes, checkerId });
    
    // Update payment
    const updateQuery = `
      UPDATE payments 
      SET status = ?, payment_date = ?, notes = ?, updated_at = NOW()
      WHERE id = ? AND installment_id = ?
    `;
    
    await query(updateQuery, [
      status,
      status === 'paid' ? paymentDate || new Date().toISOString().split('T')[0] : null,
      notes,
      paymentId,
      id
    ]);
    
    // If payment is marked as paid and checkerId is provided, create payment collection record
    if (status === 'paid' && checkerId) {
      const collectionQuery = `
        INSERT INTO payment_collections (payment_id, checker_id, collection_date, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
        checker_id = VALUES(checker_id),
        collection_date = VALUES(collection_date),
        updated_at = NOW()
      `;
      
      await query(collectionQuery, [
        paymentId,
        checkerId,
        paymentDate || new Date().toISOString().split('T')[0]
      ]);
    }
    
    // Get updated payment
    const paymentQuery = `
      SELECT 
        p.id,
        p.installment_id as installmentId,
        p.amount,
        p.payment_date as paymentDate,
        p.due_date as dueDate,
        p.status,
        p.notes,
        p.created_at as createdAt,
        pc.checker_id as checkerId,
        ch.name as checkerName,
        ch.surname as checkerSurname,
        ch.full_name as checkerFullName
      FROM payments p
      LEFT JOIN payment_collections pc ON p.id = pc.payment_id
      LEFT JOIN checkers ch ON pc.checker_id = ch.id
      WHERE p.id = ?
    `;
    
    const payment = await query(paymentQuery, [paymentId]);
    
    res.json({
      success: true,
      data: payment[0],
      message: 'Payment updated successfully'
    });
  } catch (error) {
    console.error('Error in payment update:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// PUT /api/installments/:id - Update installment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      contractNumber,
      contractDate,
      customerId,
      productId,
      productName,
      totalAmount,
      installmentAmount,
      installmentPeriod,
      startDate,
      endDate,
      status,
      salespersonId,
      inspectorId,
      line,
      customerDetails,
      productDetails,
      guarantorDetails,
      plan
    } = req.body;
    
    // Extract customer details
    const customerTitle = customerDetails?.title || null;
    const customerAge = customerDetails?.age || null;
    const customerMoo = customerDetails?.moo || null;
    const customerRoad = customerDetails?.road || null;
    const customerSubdistrict = customerDetails?.subdistrict || null;
    const customerDistrict = customerDetails?.district || null;
    const customerProvince = customerDetails?.province || null;
    const customerPhone1 = customerDetails?.phone1 || null;
    const customerPhone2 = customerDetails?.phone2 || null;
    const customerPhone3 = customerDetails?.phone3 || null;
    const customerEmail = customerDetails?.email || null;
    
    // Extract guarantor details
    const guarantorIdValue = guarantorDetails?.id || null;
    const guarantorTitle = guarantorDetails?.title || null;
    const guarantorName = guarantorDetails?.name || null;
    const guarantorSurname = guarantorDetails?.surname || null;
    const guarantorNickname = guarantorDetails?.nickname || null;
    const guarantorAge = guarantorDetails?.age || null;
    const guarantorIdCard = guarantorDetails?.idCard || null;
    const guarantorAddress = guarantorDetails?.address || null;
    const guarantorMoo = guarantorDetails?.moo || null;
    const guarantorRoad = guarantorDetails?.road || null;
    const guarantorSubdistrict = guarantorDetails?.subdistrict || null;
    const guarantorDistrict = guarantorDetails?.district || null;
    const guarantorProvince = guarantorDetails?.province || null;
    const guarantorPhone1 = guarantorDetails?.phone1 || null;
    const guarantorPhone2 = guarantorDetails?.phone2 || null;
    const guarantorPhone3 = guarantorDetails?.phone3 || null;
    const guarantorEmail = guarantorDetails?.email || null;
    
    // Extract product details
    const productDescription = productDetails?.description || null;
    const productCategory = productDetails?.category || null;
    const productModel = productDetails?.model || null;
    const productSerialNumber = productDetails?.serialNumber || null;
    
    // Extract plan details
    const downPayment = plan?.downPayment || 0;
    const monthlyPayment = plan?.monthlyPayment || installmentAmount || 0;
    const months = plan?.months || installmentPeriod || 12;
    
    // Ensure plan values are not null
    const finalDownPayment = downPayment || 0;
    const finalMonthlyPayment = monthlyPayment || 0;
    const finalMonths = months || 12;
    
    // Ensure installmentAmount is not null
    const finalInstallmentAmount = installmentAmount || monthlyPayment || 0;
    
    // Ensure status is not null
    const finalStatus = status || 'active';
    
    // Ensure totalAmount is not null
    const finalTotalAmount = totalAmount || 0;
    
    // Ensure installmentPeriod is not null
    const finalInstallmentPeriod = installmentPeriod || months || 12;
    
    // Ensure contractNumber is not null
    const finalContractNumber = contractNumber || `CT${new Date().getTime()}`;
    
    // Ensure contractDate is not null
    const finalContractDate = contractDate || new Date().toISOString().split('T')[0];
    
    // Ensure startDate and endDate are not null
    const finalStartDate = startDate || finalContractDate;
    const finalEndDate = endDate || (() => {
      const start = new Date(finalStartDate);
      start.setMonth(start.getMonth() + finalInstallmentPeriod);
      return start.toISOString().split('T')[0];
    })();
    
    // Ensure required IDs are not null
    const finalCustomerId = customerId || 1;
    const finalProductId = productId || 1;
    const finalSalespersonId = salespersonId || 1;
    const finalInspectorId = inspectorId || 1;
    
    // Ensure productName is not null
    const finalProductName = productName || 'สินค้าไม่ระบุ';
    
    // Ensure line is not null
    const finalLine = line || 'ไม่ระบุ';
    
    // Helper function to convert date format (reuse from POST)
    function convertDateFormat(dateString) {
      if (!dateString) return null;
      
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // If it's in DD-MM-YYYY format, convert to YYYY-MM-DD
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const parts = dateString.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      
      // If it's in DD-MM-YYYY format (Thai year), convert to YYYY-MM-DD
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const parts = dateString.split('-');
        const thaiYear = parseInt(parts[2]);
        const adYear = thaiYear - 543; // Convert Thai year to AD year
        return `${adYear}-${parts[1]}-${parts[0]}`;
      }
      
      // If it's just a day number, return null
      if (/^\d{1,2}$/.test(dateString)) {
        return null;
      }
      
      return null;
    }
    
    const collectionDate = convertDateFormat(plan?.collectionDate);
    
    // Ensure collectionDate is not null
    const finalCollectionDate = collectionDate || null;
    
    const sqlQuery = `
      UPDATE installments 
      SET contract_number = ?, contract_date = ?, customer_id = ?, product_id = ?, product_name = ?, 
          total_amount = ?, installment_amount = ?, installment_period = ?, 
          start_date = ?, end_date = ?, status = ?, salesperson_id = ?, inspector_id = ?, line = ?,
          customer_title = ?, customer_age = ?, customer_moo = ?, customer_road = ?, customer_subdistrict = ?,
          customer_district = ?, customer_province = ?, customer_phone1 = ?, customer_phone2 = ?, customer_phone3 = ?, customer_email = ?,
          guarantor_id = ?, guarantor_title = ?, guarantor_name = ?, guarantor_surname = ?, guarantor_nickname = ?,
          guarantor_age = ?, guarantor_id_card = ?, guarantor_address = ?, guarantor_moo = ?, guarantor_road = ?,
          guarantor_subdistrict = ?, guarantor_district = ?, guarantor_province = ?, guarantor_phone1 = ?,
          guarantor_phone2 = ?, guarantor_phone3 = ?, guarantor_email = ?,
          product_description = ?, product_category = ?, product_model = ?, product_serial_number = ?,
          down_payment = ?, monthly_payment = ?, months = ?, collection_date = ?,
          updated_at = NOW()
      WHERE id = ?
    `;
    
    await query(sqlQuery, [
      finalContractNumber, finalContractDate, finalCustomerId, finalProductId, finalProductName, finalTotalAmount,
            finalInstallmentAmount, finalInstallmentPeriod, finalStartDate, finalEndDate, finalStatus, finalSalespersonId,
      finalInspectorId, finalLine, customerTitle, customerAge, customerMoo, customerRoad, customerSubdistrict,
      customerDistrict, customerProvince, customerPhone1, customerPhone2, customerPhone3, customerEmail,
      guarantorIdValue, guarantorTitle, guarantorName, guarantorSurname, guarantorNickname,
      guarantorAge, guarantorIdCard, guarantorAddress, guarantorMoo, guarantorRoad,
      guarantorSubdistrict, guarantorDistrict, guarantorProvince, guarantorPhone1,
      guarantorPhone2, guarantorPhone3, guarantorEmail,
      productDescription, productCategory, productModel, productSerialNumber,
      finalDownPayment, finalMonthlyPayment, finalMonths, finalCollectionDate, id
    ]);
    
    // Update inventory stock when product is changed or contract is updated
    try {
      console.log('🔍 Updating inventory stock for inventory ID:', finalProductId);
      const sellDate = finalContractDate || new Date().toISOString().split('T')[0];
      const sellingCost = finalTotalAmount || 0;
      await updateInventoryStock(finalProductId, selectedBranch, sellDate, sellingCost, finalContractNumber);
    } catch (inventoryError) {
      console.log('⚠️ Inventory stock update failed during contract update:', inventoryError.message);
    }
    
    // Get the updated installment
    const installmentQuery = `
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
        i.inspector_id as inspectorId,
        i.line,
        i.down_payment as downPayment,
        i.monthly_payment as monthlyPayment,
        i.months,
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
    
    const installment = await query(installmentQuery, [id]);
    
    if (installment.length === 0) {
      return res.status(404).json({ 
        error: 'Installment not found' 
      });
    }
    
    // Return the result directly since we're not using JSON fields anymore
    const result = installment[0];
    
    res.json({
      success: true,
      data: result,
      message: 'Installment updated successfully'
    });
  } catch (error) {
    console.error('Error in installment PUT:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// Helper function to restore inventory stock when contract is deleted
async function restoreInventoryStock(inventoryId, branchId) {
  try {
    console.log('🔍 Restoring inventory stock for inventory ID:', inventoryId, 'branch:', branchId);
    
    // Get the inventory record directly
    const getInventoryQuery = 'SELECT product_name FROM inventory WHERE id = ?';
    const inventoryResult = await query(getInventoryQuery, [inventoryId]);
    
    if (inventoryResult.length === 0) {
      console.log('⚠️ Inventory record not found:', inventoryId);
      return false;
    }
    
    const productName = inventoryResult[0].product_name;
    
    // Restore inventory: increase remaining quantity, decrease sold quantity, clear sell date, selling cost, and contract number
    const updateQuery = `
      UPDATE inventory 
      SET 
        sold_quantity = 0,
        remaining_quantity1 = 1,
        remaining_quantity2 = 1,
        sell_date = NULL,
        selling_cost = 0,
        contract_number = '-',
        status = 'active',
        updated_at = NOW()
      WHERE product_name = ? AND branch_id = ? AND sold_quantity > 0
      ORDER BY sell_date DESC
      LIMIT 1
    `;
    
    const result = await query(updateQuery, [productName, branchId]);
    
    if (result.affectedRows > 0) {
      console.log('✅ Inventory stock restored successfully for product:', productId);
      return true;
    } else {
      console.log('⚠️ No inventory record found for product:', productId, 'branch:', branchId);
      return false;
    }
  } catch (error) {
    console.error('❌ Error restoring inventory stock:', error);
    return false;
  }
}

// DELETE /api/installments/:id - Delete installment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get product info before deleting
    const getProductQuery = 'SELECT product_id, branch_id FROM installments WHERE id = ?';
    const productInfo = await query(getProductQuery, [id]);
    
    const sqlQuery = 'DELETE FROM installments WHERE id = ?';
    const result = await query(sqlQuery, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Installment not found' 
      });
    }
    
    // Restore inventory stock when contract is deleted
    if (productInfo.length > 0) {
      try {
        console.log('🔍 Restoring inventory stock for deleted contract');
        await restoreInventoryStock(productInfo[0].product_id, productInfo[0].branch_id);
      } catch (inventoryError) {
        console.log('⚠️ Inventory stock restoration failed during contract deletion:', inventoryError.message);
      }
    }
    
    res.json({
      success: true,
      message: 'Installment deleted successfully'
    });
  } catch (error) {
    console.error('Error in installment DELETE:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

module.exports = router; 