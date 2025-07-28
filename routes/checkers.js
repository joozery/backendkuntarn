const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

// GET /api/checkers - Get all checkers
router.get('/', async (req, res) => {
  try {
    const { branchId, search } = req.query;
    
    let sqlQuery = `
      SELECT 
        c.id,
        c.name,
        c.surname,
        c.full_name as fullName,
        c.phone,
        c.email,
        c.status,
        c.branch_id as branchId,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        b.name as branchName
      FROM checkers c
      LEFT JOIN branches b ON c.branch_id = b.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branchId) {
      sqlQuery += ' AND c.branch_id = ?';
      params.push(branchId);
    }
    
    if (search) {
      sqlQuery += ' AND (c.name LIKE ? OR c.surname LIKE ? OR c.full_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sqlQuery += ' ORDER BY c.created_at DESC';
    
    try {
      const results = await query(sqlQuery, params);
      res.json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (err) {
      console.error('Error fetching checkers:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in checkers GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/checkers/:id - Get checker by ID
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
        c.status,
        c.branch_id as branchId,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        b.name as branchName
      FROM checkers c
      LEFT JOIN branches b ON c.branch_id = b.id
      WHERE c.id = ?
    `;
    
    try {
      const results = await query(sqlQuery, [id]);
      
      if (results.length === 0) {
        return res.status(404).json({ 
          error: 'Checker not found' 
        });
      }
      
      res.json({
        success: true,
        data: results[0]
      });
    } catch (err) {
      console.error('Error fetching checker:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in checker GET by ID:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// POST /api/checkers - Create new checker
router.post('/', async (req, res) => {
  try {
    const { name, surname, fullName, phone, email, branchId } = req.body;
    
    // Validation
    if (!name || !fullName || !branchId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name, fullName, and branchId are required'
      });
    }
    
    const sqlQuery = `
      INSERT INTO checkers (name, surname, full_name, phone, email, branch_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;
    
    const params = [name, surname, fullName, phone, email, branchId];
    
    try {
      const result = await query(sqlQuery, params);
      
      // Get the created checker
      const getQuery = `
        SELECT 
          c.id,
          c.name,
          c.surname,
          c.full_name as fullName,
          c.phone,
          c.email,
          c.status,
          c.branch_id as branchId,
          c.created_at as createdAt,
          c.updated_at as updatedAt,
          b.name as branchName
        FROM checkers c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE c.id = ?
      `;
      
      const results = await query(getQuery, [result.insertId]);
      
      res.status(201).json({
        success: true,
        message: 'Checker created successfully',
        data: results[0]
      });
    } catch (err) {
      console.error('Error creating checker:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in checker POST:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// PUT /api/checkers/:id - Update checker
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, fullName, phone, email, status } = req.body;
    
    // Validation
    if (!name || !fullName) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name and fullName are required'
      });
    }
    
    const sqlQuery = `
      UPDATE checkers 
      SET name = ?, surname = ?, full_name = ?, phone = ?, email = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const params = [name, surname, fullName, phone, email, status || 'active', id];
    
    try {
      const result = await query(sqlQuery, params);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Checker not found' 
        });
      }
      
      // Get the updated checker
      const getQuery = `
        SELECT 
          c.id,
          c.name,
          c.surname,
          c.full_name as fullName,
          c.phone,
          c.email,
          c.status,
          c.branch_id as branchId,
          c.created_at as createdAt,
          c.updated_at as updatedAt,
          b.name as branchName
        FROM checkers c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE c.id = ?
      `;
      
      const results = await query(getQuery, [id]);
      
      res.json({
        success: true,
        message: 'Checker updated successfully',
        data: results[0]
      });
    } catch (err) {
      console.error('Error updating checker:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in checker PUT:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// DELETE /api/checkers/:id - Delete checker
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = 'DELETE FROM checkers WHERE id = ?';
    
    try {
      const result = await query(sqlQuery, [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Checker not found' 
        });
      }
      
      res.json({
        success: true,
        message: 'Checker deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting checker:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in checker DELETE:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/checkers/:id/collections - Get collections by checker
router.get('/:id/collections', async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year, status } = req.query;
    
    let sqlQuery = `
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
        c.name as customerName,
        c.surname as customerSurname,
        c.full_name as customerFullName,
        c.phone as customerPhone,
        i.contract_number as contractNumber,
        i.product_name as productName,
        i.total_amount as totalAmount,
        i.installment_amount as installmentAmount,
        i.remaining_amount as remainingAmount
      FROM payment_collections pc
      LEFT JOIN customers c ON pc.customer_id = c.id
      LEFT JOIN installments i ON pc.installment_id = i.id
      WHERE pc.checker_id = ?
    `;
    
    const params = [id];
    
    if (month && year) {
      sqlQuery += ' AND MONTH(pc.payment_date) = ? AND YEAR(pc.payment_date) = ?';
      params.push(month, year);
    }
    
    if (status) {
      sqlQuery += ' AND pc.status = ?';
      params.push(status);
    }
    
    sqlQuery += ' ORDER BY pc.payment_date DESC';
    
    try {
      const results = await query(sqlQuery, params);
      
      res.json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (err) {
      console.error('Error fetching collections:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in collections GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// POST /api/checkers/:id/collections - Create new collection
router.post('/:id/collections', async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, installmentId, amount, paymentDate, notes } = req.body;
    
    // Validation
    if (!customerId || !installmentId || !amount || !paymentDate) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Customer ID, installment ID, amount, and payment date are required'
      });
    }
    
    const query = `
      INSERT INTO payment_collections (checker_id, customer_id, installment_id, amount, payment_date, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, 'completed', ?, NOW())
    `;
    
    const params = [id, customerId, installmentId, amount, paymentDate, notes];
    
    db.query(query, params, (err, result) => {
      if (err) {
        console.error('Error creating collection:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message 
        });
      }
      
      // Update installment remaining amount
      const updateQuery = `
        UPDATE installments 
        SET remaining_amount = remaining_amount - ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      db.query(updateQuery, [amount, installmentId], (err, updateResult) => {
        if (err) {
          console.error('Error updating installment:', err);
        }
        
        res.status(201).json({
          success: true,
          message: 'Collection recorded successfully',
          data: {
            id: result.insertId,
            checkerId: id,
            customerId,
            installmentId,
            amount,
            paymentDate,
            status: 'completed'
          }
        });
      });
    });
  } catch (error) {
    console.error('Error in collection POST:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/checkers/:id/reports - Get checker reports
router.get('/:id/reports', async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;
    
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();
    
    // Get monthly collection summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as totalCollections,
        SUM(amount) as totalAmount,
        COUNT(DISTINCT customer_id) as uniqueCustomers,
        COUNT(DISTINCT installment_id) as uniqueInstallments
      FROM payment_collections 
      WHERE checker_id = ? 
      AND MONTH(payment_date) = ? 
      AND YEAR(payment_date) = ?
    `;
    
    db.query(summaryQuery, [id, currentMonth, currentYear], (err, summaryResults) => {
      if (err) {
        console.error('Error fetching summary:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message 
        });
      }
      
      // Get daily collections
      const dailyQuery = `
        SELECT 
          DATE(payment_date) as date,
          COUNT(*) as collections,
          SUM(amount) as amount
        FROM payment_collections 
        WHERE checker_id = ? 
        AND MONTH(payment_date) = ? 
        AND YEAR(payment_date) = ?
        GROUP BY DATE(payment_date)
        ORDER BY date DESC
      `;
      
      db.query(dailyQuery, [id, currentMonth, currentYear], (err, dailyResults) => {
        if (err) {
          console.error('Error fetching daily data:', err);
          return res.status(500).json({ 
            error: 'Database error', 
            message: err.message 
          });
        }
        
        res.json({
          success: true,
          data: {
            summary: summaryResults[0],
            dailyCollections: dailyResults,
            month: currentMonth,
            year: currentYear
          }
        });
      });
    });
  } catch (error) {
    console.error('Error in reports GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

module.exports = router; 