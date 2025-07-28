const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

// GET /api/branches - Get all branches
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = `
      SELECT 
        id,
        name,
        address,
        phone,
        manager,
        is_active as isActive,
        created_at as createdAt,
        updated_at as updatedAt
      FROM branches
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND is_active = ?';
      params.push(status === 'active' ? 1 : 0);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR address LIKE ? OR manager LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC';
    
    try {
      const results = await query(query, params);
      res.json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (err) {
      console.error('Error fetching branches:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in branches GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/branches/:id - Get branch by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        name,
        address,
        phone,
        manager,
        is_active as isActive,
        created_at as createdAt,
        updated_at as updatedAt
      FROM branches
      WHERE id = ?
    `;
    
    try {
      const results = await query(query, [id]);
      
      if (results.length === 0) {
        return res.status(404).json({ 
          error: 'Branch not found' 
        });
      }
      
      res.json({
        success: true,
        data: results[0]
      });
    } catch (err) {
      console.error('Error fetching branch:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in branch GET by ID:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// POST /api/branches - Create new branch
router.post('/', async (req, res) => {
  try {
    const { name, address, phone, manager, isActive } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Branch name is required'
      });
    }
    
    const query = `
      INSERT INTO branches (name, address, phone, manager, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const params = [name, address, phone, manager, isActive !== false];
    
    db.query(query, params, (err, result) => {
      if (err) {
        console.error('Error creating branch:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message 
        });
      }
      
      // Get the created branch
      const getQuery = `
        SELECT 
          id,
          name,
          address,
          phone,
          manager,
          is_active as isActive,
          created_at as createdAt,
          updated_at as updatedAt
        FROM branches
        WHERE id = ?
      `;
      
      db.query(getQuery, [result.insertId], (err, results) => {
        if (err) {
          console.error('Error fetching created branch:', err);
          return res.status(500).json({ 
            error: 'Database error', 
            message: err.message 
          });
        }
        
        res.status(201).json({
          success: true,
          message: 'Branch created successfully',
          data: results[0]
        });
      });
    });
  } catch (error) {
    console.error('Error in branch POST:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// PUT /api/branches/:id - Update branch
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, manager, isActive } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Branch name is required'
      });
    }
    
    const query = `
      UPDATE branches 
      SET name = ?, address = ?, phone = ?, manager = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const params = [name, address, phone, manager, isActive !== false, id];
    
    db.query(query, params, (err, result) => {
      if (err) {
        console.error('Error updating branch:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message 
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Branch not found' 
        });
      }
      
      // Get the updated branch
      const getQuery = `
        SELECT 
          id,
          name,
          address,
          phone,
          manager,
          is_active as isActive,
          created_at as createdAt,
          updated_at as updatedAt
        FROM branches
        WHERE id = ?
      `;
      
      db.query(getQuery, [id], (err, results) => {
        if (err) {
          console.error('Error fetching updated branch:', err);
          return res.status(500).json({ 
            error: 'Database error', 
            message: err.message 
          });
        }
        
        res.json({
          success: true,
          message: 'Branch updated successfully',
          data: results[0]
        });
      });
    });
  } catch (error) {
    console.error('Error in branch PUT:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// DELETE /api/branches/:id - Delete branch
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if branch has related data
    const checkQuery = `
      SELECT 
        (SELECT COUNT(*) FROM checkers WHERE branch_id = ?) as checker_count,
        (SELECT COUNT(*) FROM customers WHERE branch_id = ?) as customer_count,
        (SELECT COUNT(*) FROM products WHERE branch_id = ?) as product_count,
        (SELECT COUNT(*) FROM installments WHERE branch_id = ?) as installment_count
    `;
    
    db.query(checkQuery, [id, id, id, id], (err, results) => {
      if (err) {
        console.error('Error checking branch dependencies:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message 
        });
      }
      
      const counts = results[0];
      const totalRelated = counts.checker_count + counts.customer_count + counts.product_count + counts.installment_count;
      
      if (totalRelated > 0) {
        return res.status(400).json({
          error: 'Cannot delete branch',
          message: `Branch has ${totalRelated} related records. Please remove them first.`,
          details: {
            checkers: counts.checker_count,
            customers: counts.customer_count,
            products: counts.product_count,
            installments: counts.installment_count
          }
        });
      }
      
      // Delete branch
      const deleteQuery = 'DELETE FROM branches WHERE id = ?';
      
      db.query(deleteQuery, [id], (err, result) => {
        if (err) {
          console.error('Error deleting branch:', err);
          return res.status(500).json({ 
            error: 'Database error', 
            message: err.message 
          });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ 
            error: 'Branch not found' 
          });
        }
        
        res.json({
          success: true,
          message: 'Branch deleted successfully'
        });
      });
    });
  } catch (error) {
    console.error('Error in branch DELETE:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/branches/:id/statistics - Get branch statistics
router.get('/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM checkers WHERE branch_id = ?) as total_checkers,
        (SELECT COUNT(*) FROM checkers WHERE branch_id = ? AND status = 'active') as active_checkers,
        (SELECT COUNT(*) FROM customers WHERE branch_id = ?) as total_customers,
        (SELECT COUNT(*) FROM customers WHERE branch_id = ? AND status = 'active') as active_customers,
        (SELECT COUNT(*) FROM products WHERE branch_id = ?) as total_products,
        (SELECT COUNT(*) FROM products WHERE branch_id = ? AND status = 'active') as active_products,
        (SELECT COUNT(*) FROM installments WHERE branch_id = ?) as total_installments,
        (SELECT COUNT(*) FROM installments WHERE branch_id = ? AND status = 'active') as active_installments,
        (SELECT COUNT(*) FROM installments WHERE branch_id = ? AND status = 'completed') as completed_installments,
        (SELECT COUNT(*) FROM installments WHERE branch_id = ? AND status = 'overdue') as overdue_installments,
        (SELECT COALESCE(SUM(total_amount), 0) FROM installments WHERE branch_id = ?) as total_contract_value,
        (SELECT COALESCE(SUM(remaining_amount), 0) FROM installments WHERE branch_id = ?) as total_remaining_amount,
        (SELECT COALESCE(SUM(amount), 0) FROM payment_collections pc 
         JOIN checkers c ON pc.checker_id = c.id 
         WHERE c.branch_id = ?) as total_collections
    `;
    
    const params = [id, id, id, id, id, id, id, id, id, id, id, id, id];
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching branch statistics:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message 
        });
      }
      
      res.json({
        success: true,
        data: results[0]
      });
    });
  } catch (error) {
    console.error('Error in branch statistics GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/branches/:id/checkers - Get checkers by branch
router.get('/:id/checkers', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    let query = `
      SELECT 
        id,
        name,
        surname,
        full_name as fullName,
        phone,
        email,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM checkers
      WHERE branch_id = ?
    `;
    
    const params = [id];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching branch checkers:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message 
        });
      }
      
      res.json({
        success: true,
        data: results,
        count: results.length
      });
    });
  } catch (error) {
    console.error('Error in branch checkers GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/branches/:id/customers - Get customers by branch
router.get('/:id/customers', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    let query = `
      SELECT 
        id,
        name,
        surname,
        full_name as fullName,
        phone,
        email,
        address,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM customers
      WHERE branch_id = ?
    `;
    
    const params = [id];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching branch customers:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message 
        });
      }
      
      res.json({
        success: true,
        data: results,
        count: results.length
      });
    });
  } catch (error) {
    console.error('Error in branch customers GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/branches/:id/installments - Get installments by branch
router.get('/:id/installments', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    let query = `
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
        c.phone as customerPhone
      FROM installments i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.branch_id = ?
    `;
    
    const params = [id];
    
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY i.created_at DESC';
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching branch installments:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message 
        });
      }
      
      res.json({
        success: true,
        data: results,
        count: results.length
      });
    });
  } catch (error) {
    console.error('Error in branch installments GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/branches/:id/collections - Get collections by branch
router.get('/:id/collections', async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year, status } = req.query;
    
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
        c.full_name as customerFullName,
        i.contract_number as contractNumber,
        i.product_name as productName
      FROM payment_collections pc
      LEFT JOIN checkers ch ON pc.checker_id = ch.id
      LEFT JOIN customers c ON pc.customer_id = c.id
      LEFT JOIN installments i ON pc.installment_id = i.id
      WHERE ch.branch_id = ?
    `;
    
    const params = [id];
    
    if (month && year) {
      query += ' AND MONTH(pc.payment_date) = ? AND YEAR(pc.payment_date) = ?';
      params.push(month, year);
    }
    
    if (status) {
      query += ' AND pc.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY pc.payment_date DESC';
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching branch collections:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message 
        });
      }
      
      res.json({
        success: true,
        data: results,
        count: results.length
      });
    });
  } catch (error) {
    console.error('Error in branch collections GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

module.exports = router; 