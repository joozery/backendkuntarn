const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

// GET /api/inventory - Get all inventory items
router.get('/', async (req, res) => {
  try {
    const { branchId, search, status, page = 1, limit = 15 } = req.query;
    
    let sqlQuery = `
      SELECT 
        i.id,
        i.sequence,
        i.receive_date,
        i.product_code,
        i.product_name,
        i.shop_name,
        i.contract_number,
        i.cost_price,
        i.sell_date,
        i.selling_cost,
        i.remaining_quantity1,
        i.received_quantity,
        i.sold_quantity,
        i.remaining_quantity2,
        i.remarks,
        i.status,
        i.branch_id,
        i.created_at,
        i.updated_at,
        b.name as branch_name
      FROM inventory i
      LEFT JOIN branches b ON i.branch_id = b.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branchId) {
      sqlQuery += ' AND i.branch_id = ?';
      params.push(branchId);
    }
    
    if (status && status !== 'all') {
      sqlQuery += ' AND i.status = ?';
      params.push(status);
    }
    
    if (search) {
      sqlQuery += ` AND (
        i.product_name LIKE ? OR 
        i.product_code LIKE ? OR 
        i.shop_name LIKE ? OR
        i.contract_number LIKE ? OR
        i.remarks LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Get total count for pagination
    const countQuery = sqlQuery.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await query(countQuery, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;
    
    // Add pagination and ordering
    sqlQuery += ' ORDER BY i.sequence DESC, i.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    try {
      const results = await query(sqlQuery, params);
      
      res.json({
        success: true,
        data: results,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (err) {
      console.error('Error fetching inventory:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in inventory GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/inventory/:id - Get inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = `
      SELECT 
        i.id,
        i.sequence,
        i.receive_date,
        i.product_code,
        i.product_name,
        i.shop_name,
        i.contract_number,
        i.cost_price,
        i.sell_date,
        i.selling_cost,
        i.remaining_quantity1,
        i.received_quantity,
        i.sold_quantity,
        i.remaining_quantity2,
        i.remarks,
        i.status,
        i.branch_id,
        i.created_at,
        i.updated_at,
        b.name as branch_name
      FROM inventory i
      LEFT JOIN branches b ON i.branch_id = b.id
      WHERE i.id = ?
    `;
    
    try {
      const results = await query(sqlQuery, [id]);
      
      if (results.length === 0) {
        return res.status(404).json({ 
          error: 'Inventory item not found' 
        });
      }
      
      res.json({
        success: true,
        data: results[0]
      });
    } catch (err) {
      console.error('Error fetching inventory item:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in inventory GET by ID:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// POST /api/inventory - Create new inventory item
router.post('/', async (req, res) => {
  try {
    const { 
      sequence, receive_date, product_code, product_name, shop_name, contract_number,
      cost_price, sell_date, selling_cost, remaining_quantity1,
      received_quantity, sold_quantity, remaining_quantity2, remarks, branch_id
    } = req.body;
    
    // Validation
    if (!product_name || !branch_id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Product name and branch ID are required'
      });
    }
    
    // Get next sequence number if not provided
    let finalSequence = sequence;
    if (!sequence) {
      const maxSeqQuery = 'SELECT MAX(sequence) as maxSeq FROM inventory WHERE branch_id = ?';
      const maxSeqResult = await query(maxSeqQuery, [branch_id]);
      finalSequence = (maxSeqResult[0].maxSeq || 0) + 1;
    }
    
    const sqlQuery = `
      INSERT INTO inventory (
        sequence, receive_date, product_code, product_name, shop_name, contract_number,
        cost_price, sell_date, selling_cost, remaining_quantity1,
        received_quantity, sold_quantity, remaining_quantity2, remarks, branch_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      finalSequence, receive_date || null, product_code || null, product_name, 
      shop_name || null, contract_number || null, cost_price || 0, sell_date || null, selling_cost || 0,
      remaining_quantity1 || 1, received_quantity || 1, sold_quantity || 0,
      remaining_quantity2 || 1, remarks || null, branch_id
    ];
    
    try {
      const result = await query(sqlQuery, params);
      
      // Get the created inventory item
      const getQuery = `
        SELECT 
          i.id,
          i.sequence,
          i.receive_date,
          i.product_code,
          i.product_name,
          i.contract_number,
          i.cost_price,
          i.sell_date,
          i.selling_cost,
          i.remaining_quantity1,
          i.received_quantity,
          i.sold_quantity,
          i.remaining_quantity2,
          i.remarks,
          i.status,
          i.branch_id,
          i.created_at,
          i.updated_at,
          b.name as branch_name
        FROM inventory i
        LEFT JOIN branches b ON i.branch_id = b.id
        WHERE i.id = ?
      `;
      
      const results = await query(getQuery, [result.insertId]);
      
      res.status(201).json({
        success: true,
        message: 'Inventory item created successfully',
        data: results[0]
      });
    } catch (err) {
      console.error('Error creating inventory item:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in inventory POST:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// PUT /api/inventory/:id - Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      sequence, receive_date, product_code, product_name, shop_name, contract_number,
      cost_price, sell_date, selling_cost, remaining_quantity1,
      received_quantity, sold_quantity, remaining_quantity2, remarks, status
    } = req.body;
    
    // Validation
    if (!product_name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Product name is required'
      });
    }
    
    const sqlQuery = `
      UPDATE inventory 
      SET 
        sequence = ?, receive_date = ?, product_code = ?, product_name = ?, shop_name = ?,
        contract_number = ?, cost_price = ?, sell_date = ?, selling_cost = ?,
        remaining_quantity1 = ?, received_quantity = ?, sold_quantity = ?,
        remaining_quantity2 = ?, remarks = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const params = [
      sequence || null, receive_date || null, product_code || null, product_name, shop_name || null,
      contract_number || null, cost_price || 0, sell_date || null, selling_cost || 0,
      remaining_quantity1 || 1, received_quantity || 1, sold_quantity || 0,
      remaining_quantity2 || 1, remarks || null, status || 'active', id
    ];
    
    try {
      const result = await query(sqlQuery, params);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Inventory item not found' 
        });
      }
      
      // Get the updated inventory item
      const getQuery = `
        SELECT 
          i.id,
          i.sequence,
          i.receive_date,
          i.product_code,
          i.product_name,
          i.shop_name,
          i.contract_number,
          i.cost_price,
          i.sell_date,
          i.selling_cost,
          i.remaining_quantity1,
          i.received_quantity,
          i.sold_quantity,
          i.remaining_quantity2,
          i.remarks,
          i.status,
          i.branch_id,
          i.created_at,
          i.updated_at,
          b.name as branch_name
        FROM inventory i
        LEFT JOIN branches b ON i.branch_id = b.id
        WHERE i.id = ?
      `;
      
      const results = await query(getQuery, [id]);
      
      res.json({
        success: true,
        message: 'Inventory item updated successfully',
        data: results[0]
      });
    } catch (err) {
      console.error('Error updating inventory item:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in inventory PUT:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// DELETE /api/inventory/:id - Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = 'DELETE FROM inventory WHERE id = ?';
    
    try {
      const result = await query(sqlQuery, [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Inventory item not found' 
        });
      }
      
      res.json({
        success: true,
        message: 'Inventory item deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in inventory DELETE:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

module.exports = router; 