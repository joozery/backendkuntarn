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
    console.log('📋 Contract number to update:', contractNumber);
    
    // Get the inventory record directly
    const getInventoryQuery = 'SELECT product_name, contract_number FROM inventory WHERE id = ?';
    const inventoryResult = await query(getInventoryQuery, [inventoryId]);
    
    if (inventoryResult.length === 0) {
      console.log('⚠️ Inventory record not found:', inventoryId);
      return false;
    }
    
    const productName = inventoryResult[0].product_name;
    const currentContractNumber = inventoryResult[0].contract_number;
    
    console.log('📦 Current inventory data:', {
      productName,
      currentContractNumber,
      newContractNumber: contractNumber
    });
    
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
      WHERE id = ? AND remaining_quantity1 > 0
    `;
    
    const result = await query(updateQuery, [sellDate, sellingCost, contractNumber, inventoryId]);
    
    if (result.affectedRows > 0) {
      console.log('✅ Inventory stock updated successfully for inventory ID:', inventoryId);
      console.log('📋 Contract number updated from:', currentContractNumber, 'to:', contractNumber);
      return true;
    } else {
      console.log('⚠️ No inventory record found or already sold for inventory ID:', inventoryId, 'branch:', branchId);
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
        i.line,
        p.due_date as dueDate
      FROM installments i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN inventory inv ON i.product_id = inv.id
      LEFT JOIN branches b ON i.branch_id = b.id
      LEFT JOIN employees e ON i.salesperson_id = e.id
      LEFT JOIN checkers ch ON i.inspector_id = ch.id
      LEFT JOIN payments p ON i.id = p.installment_id AND p.status = 'pending'
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
        email: result.customerEmail,
        nickname: result.customerNickname,
        idCard: result.customerIdCard
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
        c.nickname as customerNickname,
        c.id_card as customerIdCard,
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
        email: results[0].customerEmail,
        nickname: results[0].customerNickname,
        idCard: results[0].customerIdCard
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
    
    let sqlQuery = `
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
      sqlQuery += ' AND p.status = ?';
      params.push(status);
    }
    
    sqlQuery += ' ORDER BY p.due_date ASC';
    
    const results = await query(sqlQuery, params);
    
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
    
    let sqlQuery = `
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
      sqlQuery += ' AND pc.status = ?';
      params.push(status);
    }
    
    sqlQuery += ' ORDER BY pc.payment_date DESC';
    
    const results = await query(sqlQuery, params);
    
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

// POST /api/installments/:id/payments - Create new payment
router.post('/:id/payments', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_date, due_date, status, notes } = req.body;
    
    console.log('🔍 POST payment request:', { id, amount, payment_date, due_date, status, notes });
    
    // ฟังก์ชันแปลงวันที่ให้ถูกต้อง
    function convertDateFormat(dateString) {
      if (!dateString) return null;
      
      try {
        // ถ้าเป็นรูปแบบ DD-MM-YYYY (เช่น 31-08-2568)
        if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
          const parts = dateString.split('-');
          const day = parts[0];
          const month = parts[1];
          const year = parts[2];
          
          // แปลงปี พ.ศ. เป็น ค.ศ.
          const christianYear = parseInt(year) - 543;
          
          return `${christianYear}-${month}-${day}`;
        }
        
        // ถ้าเป็นรูปแบบอื่น ให้แปลงเป็น YYYY-MM-DD
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return null;
        }
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error converting date:', dateString, error);
        return null;
      }
    }
    
    // Validation
    if (!amount || !payment_date) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Amount and payment date are required'
      });
    }
    
    // แปลงวันที่ให้ถูกต้อง
    const finalPaymentDate = convertDateFormat(payment_date);
    const finalDueDate = convertDateFormat(due_date) || finalPaymentDate;
    
    console.log('🔍 Final dates:', { finalPaymentDate, finalDueDate });
    
    const sqlQuery = `
      INSERT INTO payments (installment_id, amount, payment_date, due_date, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const params = [id, amount, finalPaymentDate, finalDueDate, status || 'paid', notes || ''];
    
    const result = await query(sqlQuery, params);
    
    // Update installment remaining amount
    const updateQuery = `
      UPDATE installments 
      SET remaining_amount = remaining_amount - ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await query(updateQuery, [amount, id]);
    
    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: {
        id: result.insertId,
        installment_id: id,
        amount,
        payment_date: finalPaymentDate,
        due_date: finalDueDate,
        status: status || 'paid',
        notes: notes || ''
      }
    });
  } catch (error) {
    console.error('Error in payment POST:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// PUT /api/installments/:id/payments/:paymentId - Update payment
router.put('/:id/payments/:paymentId', async (req, res) => {
  try {
    const { id, paymentId } = req.params;
    const { amount, payment_date, due_date, status, notes } = req.body;
    
    console.log('🔍 PUT payment request:', { id, paymentId, amount, payment_date, due_date, status, notes });
    
    // ฟังก์ชันแปลงวันที่ให้ถูกต้อง
    function convertDateFormat(dateString) {
      if (!dateString) return null;
      
      try {
        // ถ้าเป็นรูปแบบ DD-MM-YYYY (เช่น 31-08-2568)
        if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
          const parts = dateString.split('-');
          const day = parts[0];
          const month = parts[1];
          const year = parts[2];
          
          // แปลงปี พ.ศ. เป็น ค.ศ.
          const christianYear = parseInt(year) - 543;
          
          return `${christianYear}-${month}-${day}`;
        }
        
        // ถ้าเป็นรูปแบบอื่น ให้แปลงเป็น YYYY-MM-DD
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return null;
        }
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error converting date:', dateString, error);
        return null;
      }
    }
    
    // Get current payment data first
    const getPaymentQuery = 'SELECT amount, due_date FROM payments WHERE id = ? AND installment_id = ?';
    const currentPayment = await query(getPaymentQuery, [paymentId, id]);
    
    if (currentPayment.length === 0) {
      return res.status(404).json({ 
        error: 'Payment not found' 
      });
    }
    
    // Use current values if not provided
    const finalAmount = amount || currentPayment[0].amount;
    const finalDueDate = convertDateFormat(due_date) || currentPayment[0].due_date;
    const finalPaymentDate = convertDateFormat(payment_date);
    
    console.log('🔍 Final values:', { finalAmount, finalPaymentDate, finalDueDate, status, notes });
    
    const sqlQuery = `
      UPDATE payments 
      SET amount = ?, payment_date = ?, due_date = ?, status = ?, notes = ?, updated_at = NOW()
      WHERE id = ? AND installment_id = ?
    `;
    
    const params = [finalAmount, finalPaymentDate, finalDueDate, status, notes, paymentId, id];
    
    const result = await query(sqlQuery, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Payment not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Payment updated successfully'
    });
  } catch (error) {
    console.error('Error in payment PUT:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// DELETE /api/installments/:id/payments/:paymentId - Delete payment
router.delete('/:id/payments/:paymentId', async (req, res) => {
  try {
    const { id, paymentId } = req.params;
    
    // Get payment amount before deleting
    const getPaymentQuery = 'SELECT amount FROM payments WHERE id = ? AND installment_id = ?';
    const paymentInfo = await query(getPaymentQuery, [paymentId, id]);
    
    if (paymentInfo.length === 0) {
      return res.status(404).json({ 
        error: 'Payment not found' 
      });
    }
    
    const sqlQuery = 'DELETE FROM payments WHERE id = ? AND installment_id = ?';
    const result = await query(sqlQuery, [paymentId, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Payment not found' 
      });
    }
    
    // Restore installment remaining amount
    const updateQuery = `
      UPDATE installments 
      SET remaining_amount = remaining_amount + ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await query(updateQuery, [paymentInfo[0].amount, id]);
    
    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Error in payment DELETE:', error);
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
      
      // Customer details (flat fields)
      customerTitle,
      customerAge,
      customerMoo,
      customerRoad,
      customerSubdistrict,
      customerDistrict,
      customerProvince,
      customerPhone1,
      customerPhone2,
      customerPhone3,
      customerEmail,
      customerIdCard,
      customerName,
      customerSurname,
      customerNickname,
      customerAddress,
      
      // Guarantor details (flat fields)
      guarantorId,
      guarantorTitle,
      guarantorName,
      guarantorSurname,
      guarantorNickname,
      guarantorAge,
      guarantorIdCard,
      guarantorAddress,
      guarantorMoo,
      guarantorRoad,
      guarantorSubdistrict,
      guarantorDistrict,
      guarantorProvince,
      guarantorPhone1,
      guarantorPhone2,
      guarantorPhone3,
      guarantorEmail,
      
      // Product details (flat fields)
      productDescription,
      productCategory,
      productModel,
      productSerialNumber,
      
      // Employee details
      inspectorId,
      line,
      
      // Plan details (flat fields)
      downPayment,
      monthlyPayment,
      months,
      collectionDate
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
    
    // Use monthlyPayment from request body if installmentAmount is not provided
    const finalMonthlyPayment = installmentAmount || monthlyPayment;
    if (!finalMonthlyPayment) {
      console.log('❌ Missing monthly payment');
      return res.status(400).json({ 
        error: 'Missing monthly payment',
        message: 'Either installmentAmount or monthlyPayment is required' 
      });
    }
    
    // Note: Customer, guarantor, and product information are now stored directly in installments table
    // No need to update separate tables
    
    // Insert installment record with all details
    const sqlQuery = `
      INSERT INTO installments (
        contract_number, contract_date, customer_id, product_id, product_name, 
        total_amount, installment_amount, remaining_amount, installment_period, 
        start_date, end_date, branch_id, salesperson_id, inspector_id, line,
        customer_title, customer_age, customer_moo, customer_road, customer_subdistrict, 
        customer_district, customer_province, customer_phone1, customer_phone2, customer_phone3, customer_email,
        customer_id_card, customer_name, customer_surname, customer_nickname,
        guarantor_id, guarantor_title, guarantor_name, guarantor_surname, guarantor_nickname,
        guarantor_age, guarantor_id_card, guarantor_address, guarantor_moo, guarantor_road,
        guarantor_subdistrict, guarantor_district, guarantor_province, guarantor_phone1,
        guarantor_phone2, guarantor_phone3, guarantor_email,
        product_description, product_category, product_model, product_serial_number,
        down_payment, monthly_payment, months, collection_date,
        status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;
    
    const remainingAmount = totalAmount - (downPayment || 0);
    const finalDownPayment = downPayment || 0;
    const finalMonths = months || installmentPeriod;
    
    // Use flat fields directly
    const guarantorIdValue = guarantorId || null;
    
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
    
    const finalCollectionDate = convertDateFormat(collectionDate);
    
    const params = [
      finalContractNumber, contractDate, customerId, productId, productName, totalAmount,
      finalMonthlyPayment, remainingAmount, installmentPeriod, startDate,
      endDate, branchId, salespersonId, inspectorId, line,
      customerTitle, customerAge, customerMoo, customerRoad, customerSubdistrict,
      customerDistrict, customerProvince, customerPhone1, customerPhone2, customerPhone3, customerEmail,
      customerIdCard, customerName, customerSurname, customerNickname,
      guarantorIdValue, guarantorTitle, guarantorName, guarantorSurname, guarantorNickname,
      guarantorAge, guarantorIdCard, guarantorAddress, guarantorMoo, guarantorRoad,
      guarantorSubdistrict, guarantorDistrict, guarantorProvince, guarantorPhone1,
      guarantorPhone2, guarantorPhone3, guarantorEmail,
      productDescription, productCategory, productModel, productSerialNumber,
      finalDownPayment, finalMonthlyPayment, finalMonths, finalCollectionDate
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
        email: installment[0].customerEmail,
        nickname: installment[0].customerNickname,
        idCard: installment[0].customerIdCard
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
      console.log('📋 Product ID type:', typeof productId, 'value:', productId);
      console.log('📋 Contract number:', finalContractNumber);
      console.log('📋 Branch ID:', branchId);
      
      if (!productId) {
        console.log('⚠️ Product ID is null or undefined, skipping inventory update');
      } else {
        const sellDate = contractDate || new Date().toISOString().split('T')[0];
        const sellingCost = totalAmount || 0;
        const updateResult = await updateInventoryStock(productId, branchId, sellDate, sellingCost, finalContractNumber);
        console.log('📋 Inventory update result:', updateResult);
      }
    } catch (inventoryError) {
      console.log('⚠️ Inventory stock update failed, but installment was created:', inventoryError.message);
      console.error('❌ Inventory error details:', inventoryError);
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
router.put('/:id/payment-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      paymentStatus, 
      napheoRed, 
      napheoBlack, 
      pBlack, 
      pRed, 
      pBlue, 
      amountCollected,
      collectionDate 
    } = req.body;

    console.log('🔄 Updating payment status for installment:', id);
    console.log('📊 Payment data:', req.body);

    // อัพเดทหรือสร้างข้อมูลใน payment_tracking
    const upsertQuery = `
      INSERT INTO payment_tracking (
        installment_id, 
        contract_number, 
        inspector_id,
        payment_status, 
        napheo_red, 
        napheo_black, 
        p_black, 
        p_red, 
        p_blue, 
        amount_collected,
        collection_date,
        amount_to_collect,
        remaining_debt
      ) 
      SELECT 
        ?, 
        i.contract_number, 
        i.inspector_id,
        ?, 
        ?, 
        ?, 
        ?, 
        ?, 
        ?, 
        ?,
        ?,
        i.installment_amount,
        i.installment_amount - ?
      FROM installments i 
      WHERE i.id = ?
      ON DUPLICATE KEY UPDATE 
        payment_status = VALUES(payment_status),
        napheo_red = VALUES(napheo_red),
        napheo_black = VALUES(napheo_black),
        p_black = VALUES(p_black),
        p_red = VALUES(p_red),
        p_blue = VALUES(p_blue),
        amount_collected = VALUES(amount_collected),
        collection_date = VALUES(collection_date),
        remaining_debt = VALUES(remaining_debt),
        updated_at = CURRENT_TIMESTAMP
    `;

    const params = [
      id,
      paymentStatus || 'pending',
      napheoRed || 0,
      napheoBlack || 0,
      pBlack || 0,
      pRed || 0,
      pBlue || 0,
      amountCollected || 0,
      collectionDate,
      amountCollected || 0,
      id
    ];

    await query(upsertQuery, params);

    console.log('✅ Payment status updated successfully');

    res.json({
      success: true,
      message: 'Payment status updated successfully'
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
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
          customer_id_card = ?, customer_name = ?, customer_surname = ?, customer_nickname = ?,
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
      customerIdCard, customerName, customerSurname, customerNickname,
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

// GET /api/installments/checker/:checkerId/report - Get installment report for checker
router.get('/checker/:checkerId/report', async (req, res) => {
  try {
    const { checkerId } = req.params;
    const { month, year } = req.query;
    
    console.log('🔍 Getting installment report for checker:', checkerId);
    console.log('📅 Month:', month, 'Year:', year);

    let sqlQuery = `
      SELECT 
        i.id,
        i.contract_number as contract,
        CONCAT(c.name, ' ', c.surname) as customerName,
        pt.collection_date as collectionDate,
        pt.amount_to_collect as amountToCollect,
        pt.amount_collected as amountCollected,
        pt.remaining_debt as remainingDebt,
        pt.payment_status as paymentStatus,
        pt.napheo_red as napheoRed,
        pt.napheo_black as napheoBlack,
        pt.p_black as pBlack,
        pt.p_red as pRed,
        pt.p_blue as pBlue,
        i.created_at as createdAt,
        pt.updated_at as updatedAt
      FROM installments i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN payment_tracking pt ON i.id = pt.installment_id
      WHERE i.inspector_id = ?
    `;
    
    const params = [checkerId];
    
    if (month && year) {
      sqlQuery += ' AND MONTH(pt.collection_date) = ? AND YEAR(pt.collection_date) = ?';
      params.push(month, year);
    }
    
    sqlQuery += ' ORDER BY pt.collection_date ASC';
    
    const results = await query(sqlQuery, params);
    
    console.log('📊 Found', results.length, 'installments for checker');
    
    // คำนวณยอดรวม
    const summary = {
      totalCards: results.length,
      cardsToCollect: results.filter(item => item.paymentStatus === 'pending').length,
      cardsCollected: results.filter(item => item.paymentStatus === 'completed').length,
      
      // P เขียว
      pGreen: results.filter(item => item.pBlue > 0).length,
      pRed: results.filter(item => item.pRed > 0).length,
      totalPCards: results.length,
      
      // P เก็บได้
      pGreenCollected: results.filter(item => item.pBlue > 0).length,
      pRedCollected: results.filter(item => item.pRed > 0).length,
      totalPCardsCollected: results.filter(item => item.pBlue > 0 || item.pRed > 0).length,
      
      // จำนวนเงิน
      totalMoney: results.reduce((sum, item) => sum + (parseFloat(item.amountToCollect) || 0), 0),
      moneyToCollect: results.reduce((sum, item) => sum + (parseFloat(item.amountToCollect) || 0), 0),
      moneyCollected: results.reduce((sum, item) => sum + (parseFloat(item.amountCollected) || 0), 0)
    };
    
    // แปลงข้อมูลให้ตรงกับ frontend
    const processedResults = results.map((result, index) => ({
      id: result.id,
      sequence: index + 1,
      contract: result.contract,
      name: result.customerName,
      collectionDate: result.collectionDate ? new Date(result.collectionDate).toLocaleDateString('th-TH') : '-',
      amountToCollect: parseFloat(result.amountToCollect) || 0,
      amountCollected: parseFloat(result.amountCollected) || 0,
      remainingDebt: parseFloat(result.remainingDebt) || 0,
      napheoRed: parseInt(result.napheoRed) || 0,
      napheoBlack: parseInt(result.napheoBlack) || 0,
      pBlack: parseInt(result.pBlack) || 0,
      pRed: parseInt(result.pRed) || 0,
      pBlue: parseInt(result.pBlue) || 0,
      paymentStatus: result.paymentStatus || 'pending'
    }));

    res.json({
      success: true,
      data: {
        installments: processedResults,
        summary: summary
      },
      total: processedResults.length
    });
    
  } catch (error) {
    console.error('Error getting checker installment report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 