const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET /api/installments - Get all installments
router.get('/', async (req, res) => {
  try {
    const { branchId, status, customerId, search, month, year } = req.query;
    
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
      query += ' AND i.branch_id = ?';
      params.push(branchId);
    }
    
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }
    
    if (customerId) {
      query += ' AND i.customer_id = ?';
      params.push(customerId);
    }
    
    if (month && year) {
      query += ' AND MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?';
      params.push(month, year);
    }
    
    if (search) {
      query += ' AND (i.contract_number LIKE ? OR c.full_name LIKE ? OR p.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY i.created_at DESC';
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching installments:', err);
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
    
    const query = `
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
        p.description as productDescription,
        b.name as branchName
      FROM installments i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN products p ON i.product_id = p.id
      LEFT JOIN branches b ON i.branch_id = b.id
      WHERE i.id = ?
    `;
    
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error fetching installment:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message 
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ 
          error: 'Installment not found' 
        });
      }
      
      res.json({
        success: true,
        data: results[0]
      });
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
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching installment payments:', err);
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
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching installment collections:', err);
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
    console.error('Error in installment collections GET:', error);
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
    const { status, remainingAmount } = req.body;
    
    const query = `
      UPDATE installments 
      SET status = ?, remaining_amount = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const params = [status, remainingAmount, id];
    
    db.query(query, params, (err, result) => {
      if (err) {
        console.error('Error updating installment:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message 
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Installment not found' 
        });
      }
      
      res.json({
        success: true,
        message: 'Installment updated successfully'
      });
    });
  } catch (error) {
    console.error('Error in installment PUT:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

module.exports = router; 