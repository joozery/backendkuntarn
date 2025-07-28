const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const { branchId, search, status } = req.query;
    
    let sqlQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.category,
        p.status,
        p.branch_id as branchId,
        p.created_at as createdAt,
        p.updated_at as updatedAt,
        b.name as branchName
      FROM products p
      LEFT JOIN branches b ON p.branch_id = b.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branchId) {
      sqlQuery += ' AND p.branch_id = ?';
      params.push(branchId);
    }
    
    if (status) {
      sqlQuery += ' AND p.status = ?';
      params.push(status);
    }
    
    if (search) {
      sqlQuery += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sqlQuery += ' ORDER BY p.created_at DESC';
    
    try {
      const results = await query(sqlQuery, params);
      res.json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in products GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.category,
        p.status,
        p.branch_id as branchId,
        p.created_at as createdAt,
        p.updated_at as updatedAt,
        b.name as branchName
      FROM products p
      LEFT JOIN branches b ON p.branch_id = b.id
      WHERE p.id = ?
    `;
    
    try {
      const results = await query(sqlQuery, [id]);
      
      if (results.length === 0) {
        return res.status(404).json({ 
          error: 'Product not found' 
        });
      }
      
      res.json({
        success: true,
        data: results[0]
      });
    } catch (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in product GET by ID:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, branchId } = req.body;
    
    // Validation
    if (!name || !price || !branchId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name, price, and branchId are required'
      });
    }
    
    const sqlQuery = `
      INSERT INTO products (name, description, price, category, branch_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;
    
    const params = [name, description, price, category, branchId];
    
    try {
      const result = await query(sqlQuery, params);
      
      // Get the created product
      const getQuery = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.category,
          p.status,
          p.branch_id as branchId,
          p.created_at as createdAt,
          p.updated_at as updatedAt,
          b.name as branchName
        FROM products p
        LEFT JOIN branches b ON p.branch_id = b.id
        WHERE p.id = ?
      `;
      
      const results = await query(getQuery, [result.insertId]);
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: results[0]
      });
    } catch (err) {
      console.error('Error creating product:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in product POST:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, status } = req.body;
    
    // Validation
    if (!name || !price) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name and price are required'
      });
    }
    
    const sqlQuery = `
      UPDATE products 
      SET name = ?, description = ?, price = ?, category = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const params = [name, description, price, category, status || 'active', id];
    
    try {
      const result = await query(sqlQuery, params);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Product not found' 
        });
      }
      
      // Get the updated product
      const getQuery = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.category,
          p.status,
          p.branch_id as branchId,
          p.created_at as createdAt,
          p.updated_at as updatedAt,
          b.name as branchName
        FROM products p
        LEFT JOIN branches b ON p.branch_id = b.id
        WHERE p.id = ?
      `;
      
      const results = await query(getQuery, [id]);
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: results[0]
      });
    } catch (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in product PUT:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = 'DELETE FROM products WHERE id = ?';
    
    try {
      const result = await query(sqlQuery, [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Product not found' 
        });
      }
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in product DELETE:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

module.exports = router; 