const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

// GET /api/customers - Get all customers
router.get('/', async (req, res) => {
  try {
    const { branchId, checkerId, search, status } = req.query;
    
    let sqlQuery = `
      SELECT 
        c.*,
        b.name as branch_name,
        ch.full_name as checker_name
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN checkers ch ON c.checker_id = ch.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branchId) {
      sqlQuery += ' AND c.branch_id = ?';
      params.push(branchId);
    }
    
    if (checkerId) {
      sqlQuery += ' AND c.checker_id = ?';
      params.push(checkerId);
    }
    
    if (search) {
      sqlQuery += ` AND (
        c.code LIKE ? OR 
        c.full_name LIKE ? OR 
        c.id_card LIKE ? OR 
        c.nickname LIKE ? OR
        c.guarantor_name LIKE ? OR
        c.guarantor_id_card LIKE ? OR
        c.guarantor_nickname LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status && status !== 'all') {
      sqlQuery += ' AND c.status = ?';
      params.push(status);
    }
    
    sqlQuery += ' ORDER BY c.created_at DESC';
    
    const results = await query(sqlQuery, params);
    
    res.json({
      success: true,
      data: results,
      total: results.length
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/customers/:id - Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = `
      SELECT 
        c.*,
        b.name as branch_name,
        ch.full_name as checker_name
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN checkers ch ON c.checker_id = ch.id
      WHERE c.id = ?
    `;
    
    const results = await query(sqlQuery, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/customers - Create new customer
router.post('/', async (req, res) => {
  try {
    const {
      code,
      name,
      surname,
      fullName,
      idCard,
      nickname,
      phone,
      email,
      address,
      guarantorName,
      guarantorIdCard,
      guarantorNickname,
      guarantorPhone,
      guarantorAddress,
      status,
      branchId,
      checkerId
    } = req.body;
    
    const sqlQuery = `
      INSERT INTO customers (
        code, name, surname, full_name, id_card, nickname, phone, email, address,
        guarantor_name, guarantor_id_card, guarantor_nickname, guarantor_phone, guarantor_address,
        status, branch_id, checker_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      code, name, surname, fullName, idCard, nickname, phone, email, address,
      guarantorName, guarantorIdCard, guarantorNickname, guarantorPhone, guarantorAddress,
      status || 'active', branchId, checkerId
    ];
    
    const result = await query(sqlQuery, params);
    
    // Fetch the created customer
    const customerQuery = `
      SELECT 
        c.*,
        b.name as branch_name,
        ch.full_name as checker_name
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN checkers ch ON c.checker_id = ch.id
      WHERE c.id = ?
    `;
    
    const customer = await query(customerQuery, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer[0]
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      surname,
      fullName,
      idCard,
      nickname,
      phone,
      email,
      address,
      guarantorName,
      guarantorIdCard,
      guarantorNickname,
      guarantorPhone,
      guarantorAddress,
      status,
      branchId,
      checkerId
    } = req.body;
    
    const sqlQuery = `
      UPDATE customers SET
        code = ?, name = ?, surname = ?, full_name = ?, id_card = ?, nickname = ?,
        phone = ?, email = ?, address = ?, guarantor_name = ?, guarantor_id_card = ?,
        guarantor_nickname = ?, guarantor_phone = ?, guarantor_address = ?,
        status = ?, branch_id = ?, checker_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [
      code, name, surname, fullName, idCard, nickname, phone, email, address,
      guarantorName, guarantorIdCard, guarantorNickname, guarantorPhone, guarantorAddress,
      status, branchId, checkerId, id
    ];
    
    const result = await query(sqlQuery, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Fetch the updated customer
    const customerQuery = `
      SELECT 
        c.*,
        b.name as branch_name,
        ch.full_name as checker_name
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN checkers ch ON c.checker_id = ch.id
      WHERE c.id = ?
    `;
    
    const customer = await query(customerQuery, [id]);
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer[0]
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = 'DELETE FROM customers WHERE id = ?';
    const result = await query(sqlQuery, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/customers/checker/:checkerId - Get customers by checker
router.get('/checker/:checkerId', async (req, res) => {
  try {
    const { checkerId } = req.params;
    const { search, status } = req.query;
    
    let sqlQuery = `
      SELECT 
        c.*,
        b.name as branch_name,
        ch.full_name as checker_name
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN checkers ch ON c.checker_id = ch.id
      WHERE c.checker_id = ?
    `;
    
    const params = [checkerId];
    
    if (search) {
      sqlQuery += ` AND (
        c.code LIKE ? OR 
        c.full_name LIKE ? OR 
        c.id_card LIKE ? OR 
        c.nickname LIKE ? OR
        c.guarantor_name LIKE ? OR
        c.guarantor_id_card LIKE ? OR
        c.guarantor_nickname LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status && status !== 'all') {
      sqlQuery += ' AND c.status = ?';
      params.push(status);
    }
    
    sqlQuery += ' ORDER BY c.created_at DESC';
    
    const results = await query(sqlQuery, params);
    
    res.json({
      success: true,
      data: results,
      total: results.length
    });
  } catch (error) {
    console.error('Error fetching customers by checker:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 