const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

// GET /api/employees - Get all employees
router.get('/', async (req, res) => {
  try {
    const { branchId, search, status } = req.query;
    
    let sqlQuery = `
      SELECT 
        e.id,
        e.name,
        e.surname,
        e.full_name as fullName,
        e.position,
        e.phone,
        e.email,
        e.status,
        e.branch_id as branchId,
        e.created_at as createdAt,
        e.updated_at as updatedAt,
        b.name as branchName
      FROM employees e
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branchId) {
      sqlQuery += ' AND e.branch_id = ?';
      params.push(branchId);
    }
    
    if (search) {
      sqlQuery += ' AND (e.name LIKE ? OR e.surname LIKE ? OR e.full_name LIKE ? OR e.position LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      sqlQuery += ' AND e.status = ?';
      params.push(status);
    }
    
    sqlQuery += ' ORDER BY e.created_at DESC';
    
    const results = await query(sqlQuery, params);
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error in employees GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/employees/:id - Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = `
      SELECT 
        e.id,
        e.name,
        e.surname,
        e.full_name as fullName,
        e.position,
        e.phone,
        e.email,
        e.status,
        e.branch_id as branchId,
        e.created_at as createdAt,
        e.updated_at as updatedAt,
        b.name as branchName
      FROM employees e
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE e.id = ?
    `;
    
    const results = await query(sqlQuery, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  } catch (error) {
    console.error('Error in employee GET by ID:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// POST /api/employees - Create new employee
router.post('/', async (req, res) => {
  try {
    const { name, surname, fullName, position, phone, email, branchId } = req.body;
    
    if (!name || !position || !branchId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Name, position, and branchId are required' 
      });
    }
    
    const sqlQuery = `
      INSERT INTO employees (name, surname, full_name, position, phone, email, branch_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;
    
    const result = await query(sqlQuery, [name, surname, fullName, position, phone, email, branchId]);
    
    // Get the created employee
    const employeeQuery = `
      SELECT 
        e.id,
        e.name,
        e.surname,
        e.full_name as fullName,
        e.position,
        e.phone,
        e.email,
        e.status,
        e.branch_id as branchId,
        e.created_at as createdAt,
        e.updated_at as updatedAt,
        b.name as branchName
      FROM employees e
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE e.id = ?
    `;
    
    const employee = await query(employeeQuery, [result.insertId]);
    
    res.status(201).json({
      success: true,
      data: employee[0],
      message: 'Employee created successfully'
    });
  } catch (error) {
    console.error('Error in employee POST:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, fullName, position, phone, email, status } = req.body;
    
    const sqlQuery = `
      UPDATE employees 
      SET name = ?, surname = ?, full_name = ?, position = ?, phone = ?, email = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await query(sqlQuery, [name, surname, fullName, position, phone, email, status, id]);
    
    // Get the updated employee
    const employeeQuery = `
      SELECT 
        e.id,
        e.name,
        e.surname,
        e.full_name as fullName,
        e.position,
        e.phone,
        e.email,
        e.status,
        e.branch_id as branchId,
        e.created_at as createdAt,
        e.updated_at as updatedAt,
        b.name as branchName
      FROM employees e
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE e.id = ?
    `;
    
    const employee = await query(employeeQuery, [id]);
    
    if (employee.length === 0) {
      return res.status(404).json({ 
        error: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      data: employee[0],
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Error in employee PUT:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = 'DELETE FROM employees WHERE id = ?';
    const result = await query(sqlQuery, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error in employee DELETE:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

module.exports = router; 