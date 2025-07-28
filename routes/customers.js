const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET /api/customers - Get all customers
router.get('/', async (req, res) => {
  try {
    const { branchId, search, status } = req.query;
    
    let query = `
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
      query += ' AND c.branch_id = ?';
      params.push(branchId);
    }
    
    if (search) {
      query += ' AND (c.name LIKE ? OR c.surname LIKE ? OR c.full_name LIKE ? OR c.phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching customers:', err);
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
    
    const query = `
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
    
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error fetching customer:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message 
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ 
          error: 'Customer not found' 
        });
      }
      
      res.json({
        success: true,
        data: results[0]
      });
    });
  } catch (error) {
    console.error('Error in customer GET by ID:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/customers/:id/installments - Get customer installments
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
        p.name as productName,
        p.price as productPrice
      FROM installments i
      LEFT JOIN products p ON i.product_id = p.id
      WHERE i.customer_id = ?
    `;
    
    const params = [id];
    
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY i.created_at DESC';
    
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching customer installments:', err);
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
    console.error('Error in customer installments GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

module.exports = router; 