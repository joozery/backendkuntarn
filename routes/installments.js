const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

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
        i.customer_id as customerId,
        i.product_id as productId,
        i.product_name as productName,
        i.total_amount as totalAmount,
        i.installment_amount as installmentAmount,
        i.remaining_amount as remainingAmount,
        i.installment_period as installmentPeriod,
        i.start_date as startDate,
        i.end_date as endDate,
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
    
    res.json({
      success: true,
      data: results,
      count: results.length
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
    
    const sqlQuery = `
      SELECT 
        i.id,
        i.contract_number as contractNumber,
        i.customer_id as customerId,
        i.product_id as productId,
        i.product_name as productName,
        i.total_amount as totalAmount,
        i.installment_amount as installmentAmount,
        i.remaining_amount as remainingAmount,
        i.installment_period as installmentPeriod,
        i.start_date as startDate,
        i.end_date as endDate,
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
    
    const results = await query(sqlQuery, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Installment not found' 
      });
    }
    
    res.json({
      success: true,
      data: results[0]
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
    
    // Check required fields
    const requiredFields = {
      contractNumber,
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
    
    // Use original schema for now (before database migration)
    const sqlQuery = `
      INSERT INTO installments (
        contract_number, customer_id, product_id, product_name, 
        total_amount, installment_amount, remaining_amount, installment_period, 
        start_date, end_date, branch_id, salesperson_id, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;
    
    const remainingAmount = totalAmount - (plan?.downPayment || 0);
    
    const params = [
      contractNumber, customerId, productId, productName, totalAmount,
      monthlyPayment, remainingAmount, installmentPeriod, startDate,
      endDate, branchId, salespersonId
    ];
    
    console.log('🔍 SQL Query:', sqlQuery);
    console.log('🔍 Parameters:', params);
    
    const result = await query(sqlQuery, params);
    
    // Get the created installment
    const installmentQuery = `
      SELECT 
        i.id,
        i.contract_number as contractNumber,
        i.customer_id as customerId,
        i.product_id as productId,
        i.product_name as productName,
        i.total_amount as totalAmount,
        i.installment_amount as installmentAmount,
        i.remaining_amount as remainingAmount,
        i.installment_period as installmentPeriod,
        i.start_date as startDate,
        i.end_date as endDate,
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
    
    // Create payment schedule automatically
    console.log('🔍 Creating payment schedule for installment:', result.insertId);
    await createPaymentSchedule(result.insertId, installmentPeriod, monthlyPayment, startDate);
    
    res.status(201).json({
      success: true,
      data: installment[0],
      message: 'Installment created successfully with payment schedule'
    });
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
      customerId,
      productId,
      productName,
      totalAmount,
      installmentAmount,
      installmentPeriod,
      startDate,
      endDate,
      status,
      salespersonId
    } = req.body;
    
    const sqlQuery = `
      UPDATE installments 
      SET contract_number = ?, customer_id = ?, product_id = ?, product_name = ?, 
          total_amount = ?, installment_amount = ?, installment_period = ?, 
          start_date = ?, end_date = ?, status = ?, salesperson_id = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await query(sqlQuery, [
      contractNumber, customerId, productId, productName, totalAmount,
      installmentAmount, installmentPeriod, startDate, endDate, status, salespersonId, id
    ]);
    
    // Get the updated installment
    const installmentQuery = `
      SELECT 
        i.id,
        i.contract_number as contractNumber,
        i.customer_id as customerId,
        i.product_id as productId,
        i.product_name as productName,
        i.total_amount as totalAmount,
        i.installment_amount as installmentAmount,
        i.remaining_amount as remainingAmount,
        i.installment_period as installmentPeriod,
        i.start_date as startDate,
        i.end_date as endDate,
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
    
    res.json({
      success: true,
      data: installment[0],
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

// DELETE /api/installments/:id - Delete installment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = 'DELETE FROM installments WHERE id = ?';
    const result = await query(sqlQuery, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Installment not found' 
      });
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