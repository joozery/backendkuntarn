const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

// GET /api/customers - Get all customers
router.get('/', async (req, res) => {
  try {
    const { branchId, search, status } = req.query;
    
    let sqlQuery = `
      SELECT 
        c.id,
        c.name,
        c.surname,
        c.full_name as fullName,
        c.phone,
        c.email,
        c.address,
        c.status,
        c.branch_id as branchId,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        b.name as branchName
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branchId) {
      sqlQuery += ' AND c.branch_id = ?';
      params.push(branchId);
    }
    
    if (search) {
      sqlQuery += ' AND (c.name LIKE ? OR c.surname LIKE ? OR c.full_name LIKE ? OR c.phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      sqlQuery += ' AND c.status = ?';
      params.push(status);
    }
    
    sqlQuery += ' ORDER BY c.created_at DESC';
    
    const results = await query(sqlQuery, params);
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error in customers GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/customers/:id - Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = `
      SELECT 
        c.id,
        c.name,
        c.surname,
        c.full_name as fullName,
        c.phone,
        c.email,
        c.address,
        c.status,
        c.branch_id as branchId,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        b.name as branchName
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      WHERE c.id = ?
    `;
    
    const results = await query(sqlQuery, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Customer not found' 
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  } catch (error) {
    console.error('Error in customer GET by ID:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// POST /api/customers - Create new customer
router.post('/', async (req, res) => {
  try {
    const { name, surname, fullName, phone, email, address, branchId } = req.body;
    
    if (!name || !phone || !branchId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Name, phone, and branchId are required' 
      });
    }
    
    const sqlQuery = `
      INSERT INTO customers (name, surname, full_name, phone, email, address, branch_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;
    
    const result = await query(sqlQuery, [name, surname, fullName, phone, email, address, branchId]);
    
    // Get the created customer
    const customerQuery = `
      SELECT 
        c.id,
        c.name,
        c.surname,
        c.full_name as fullName,
        c.phone,
        c.email,
        c.address,
        c.status,
        c.branch_id as branchId,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        b.name as branchName
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      WHERE c.id = ?
    `;
    
    const customer = await query(customerQuery, [result.insertId]);
    
    res.status(201).json({
      success: true,
      data: customer[0],
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Error in customer POST:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, fullName, phone, email, address, status } = req.body;
    
    const sqlQuery = `
      UPDATE customers 
      SET name = ?, surname = ?, full_name = ?, phone = ?, email = ?, address = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await query(sqlQuery, [name, surname, fullName, phone, email, address, status, id]);
    
    // Get the updated customer
    const customerQuery = `
      SELECT 
        c.id,
        c.name,
        c.surname,
        c.full_name as fullName,
        c.phone,
        c.email,
        c.address,
        c.status,
        c.branch_id as branchId,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        b.name as branchName
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      WHERE c.id = ?
    `;
    
    const customer = await query(customerQuery, [id]);
    
    if (customer.length === 0) {
      return res.status(404).json({ 
        error: 'Customer not found' 
      });
    }
    
    res.json({
      success: true,
      data: customer[0],
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Error in customer PUT:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
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
        error: 'Customer not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error in customer DELETE:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

module.exports = router; 