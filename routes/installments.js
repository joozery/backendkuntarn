const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

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
    
    query += ' ORDER BY p.payment_date DESC';
    
    const results = await query(query, params);
    
    res.json({
      success: true,
      data: results,
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
    
    const sqlQuery = `
      INSERT INTO installments (
        contract_number, contract_date, customer_id, product_id, product_name, 
        total_amount, installment_amount, remaining_amount, installment_period, 
        start_date, end_date, branch_id, salesperson_id, inspector_id, line,
        
        -- Customer details
        customer_title, customer_age, customer_moo, customer_road, 
        customer_subdistrict, customer_district, customer_province,
        customer_phone1, customer_phone2, customer_phone3, customer_email,
        
        -- Guarantor details
        guarantor_id, guarantor_title, guarantor_name, guarantor_surname,
        guarantor_nickname, guarantor_age, guarantor_id_card, guarantor_address,
        guarantor_moo, guarantor_road, guarantor_subdistrict, guarantor_district,
        guarantor_province, guarantor_phone1, guarantor_phone2, guarantor_phone3,
        guarantor_email,
        
        -- Product details
        product_description, product_category, product_model, product_serial_number,
        
        -- Plan details
        down_payment, monthly_payment, months, collection_date,
        
        status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;
    
    const remainingAmount = totalAmount - (plan?.downPayment || 0);
    
    const result = await query(sqlQuery, [
      // Basic contract info
      contractNumber, contractDate, customerId, productId, productName, totalAmount,
      monthlyPayment, remainingAmount, installmentPeriod, startDate,
      endDate, branchId, salespersonId, inspectorId, line,
      
      // Customer details
      customerDetails?.title || null, customerDetails?.age || null,
      customerDetails?.moo || null, customerDetails?.road || null,
      customerDetails?.subdistrict || null, customerDetails?.district || null,
      customerDetails?.province || null, customerDetails?.phone1 || null,
      customerDetails?.phone2 || null, customerDetails?.phone3 || null,
      customerDetails?.email || null,
      
      // Guarantor details
      guarantorId || null, guarantorDetails?.title || null,
      guarantorDetails?.name || null, guarantorDetails?.surname || null,
      guarantorDetails?.nickname || null, guarantorDetails?.age || null,
      guarantorDetails?.idCard || null, guarantorDetails?.address || null,
      guarantorDetails?.moo || null, guarantorDetails?.road || null,
      guarantorDetails?.subdistrict || null, guarantorDetails?.district || null,
      guarantorDetails?.province || null, guarantorDetails?.phone1 || null,
      guarantorDetails?.phone2 || null, guarantorDetails?.phone3 || null,
      guarantorDetails?.email || null,
      
      // Product details
      productDetails?.description || null, productDetails?.category || null,
      productDetails?.model || null, productDetails?.serialNumber || null,
      
      // Plan details
      plan?.downPayment || 0, plan?.monthlyPayment || null,
      plan?.months || null, plan?.collectionDate || null
    ]);
    
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
    
    res.status(201).json({
      success: true,
      data: installment[0],
      message: 'Installment created successfully'
    });
  } catch (error) {
    console.error('Error in installment POST:', error);
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