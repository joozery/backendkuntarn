const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

// GET /api/inventory - Get all inventory items
router.get('/', async (req, res) => {
  try {
    const { branchId, search, status, page = 1, limit = 15 } = req.query;

    // Build WHERE clause once, reuse for count and data queries
    let whereClause = ' WHERE 1=1';
    const whereParams = [];

    if (branchId) {
      whereClause += ' AND i.branch_id = ?';
      whereParams.push(branchId);
    }

    if (status && status !== 'all') {
      whereClause += ' AND i.status = ?';
      whereParams.push(status);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      whereClause += ` AND (
        i.product_name LIKE ? OR 
        i.product_code LIKE ? OR 
        i.shop_name LIKE ? OR
        i.contract_number LIKE ? OR
        i.remarks LIKE ?
      )`;
      whereParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Count query (reliable, without regex replace)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM inventory i
      LEFT JOIN branches b ON i.branch_id = b.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, whereParams);
    const totalItems = (countResult && countResult[0] && countResult[0].total) ? Number(countResult[0].total) : 0;
    const totalPages = Math.ceil(totalItems / Number(limit || 15)) || 0;
    const offset = (Number(page || 1) - 1) * Number(limit || 15);

    // Data query
    const dataQuery = `
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
      ${whereClause}
      ORDER BY i.sequence DESC, i.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...whereParams, parseInt(limit), offset];

    try {
      const results = await query(dataQuery, dataParams);
      
      res.json({
        success: true,
        data: results,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Number.isFinite(totalPages) ? totalPages : 0,
          totalItems: Number.isFinite(totalItems) ? totalItems : 0,
          itemsPerPage: parseInt(limit),
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
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
    
    // Build dynamic SQL query to only update provided fields
    let updateFields = [];
    let params = [];
    
    if (sequence !== undefined) {
      updateFields.push('sequence = ?');
      params.push(sequence);
    }
    if (receive_date !== undefined) {
      updateFields.push('receive_date = ?');
      params.push(receive_date);
    }
    if (product_code !== undefined) {
      updateFields.push('product_code = ?');
      params.push(product_code);
    }
    if (product_name !== undefined) {
      updateFields.push('product_name = ?');
      params.push(product_name);
    }
    if (shop_name !== undefined) {
      updateFields.push('shop_name = ?');
      params.push(shop_name);
    }
    if (contract_number !== undefined) {
      updateFields.push('contract_number = ?');
      params.push(contract_number);
    }
    if (cost_price !== undefined) {
      updateFields.push('cost_price = ?');
      params.push(cost_price || 0);
    }
    if (sell_date !== undefined) {
      updateFields.push('sell_date = ?');
      params.push(sell_date);
    }
    if (selling_cost !== undefined) {
      updateFields.push('selling_cost = ?');
      params.push(selling_cost || 0);
    }
    if (remaining_quantity1 !== undefined) {
      updateFields.push('remaining_quantity1 = ?');
      params.push(remaining_quantity1 || 1);
    }
    if (received_quantity !== undefined) {
      updateFields.push('received_quantity = ?');
      params.push(received_quantity || 1);
    }
    if (sold_quantity !== undefined) {
      updateFields.push('sold_quantity = ?');
      params.push(sold_quantity || 0);
    }
    if (remaining_quantity2 !== undefined) {
      updateFields.push('remaining_quantity2 = ?');
      params.push(remaining_quantity2 || 1);
    }
    if (remarks !== undefined) {
      updateFields.push('remarks = ?');
      params.push(remarks);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      params.push(status || 'active');
    }
    
    updateFields.push('updated_at = NOW()');
    params.push(id);
    
    const sqlQuery = `
      UPDATE inventory 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
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