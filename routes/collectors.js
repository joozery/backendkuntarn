const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

// GET /api/collectors - Get all collectors
router.get('/', async (req, res) => {
  try {
    const { branchId, search, status, page = 1, limit = 15 } = req.query;
    
    let sqlQuery = `
      SELECT 
        c.id,
        c.code,
        c.name,
        c.surname,
        c.full_name,
        c.nickname,
        c.phone,
        c.phone2,
        c.email,
        c.address,
        c.position,
        c.hire_date,
        c.salary,
        c.commission_rate,
        c.branch_id,
        c.assigned_areas,
        c.vehicle_info,
        c.total_collections,
        c.collections_count,
        c.success_rate,
        c.status,
        c.is_supervisor,
        c.can_approve_payments,
        c.created_at,
        c.updated_at,
        b.name as branch_name
      FROM collectors c
      LEFT JOIN branches b ON c.branch_id = b.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branchId) {
      sqlQuery += ' AND c.branch_id = ?';
      params.push(branchId);
    }
    
    if (status && status !== 'all') {
      sqlQuery += ' AND c.status = ?';
      params.push(status);
    }
    
    if (search) {
      sqlQuery += ` AND (
        c.code LIKE ? OR 
        c.name LIKE ? OR 
        c.surname LIKE ? OR 
        c.full_name LIKE ? OR 
        c.nickname LIKE ? OR
        c.phone LIKE ? OR
        c.phone2 LIKE ? OR
        c.email LIKE ? OR
        c.position LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Get total count for pagination
    const countQuery = sqlQuery.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await query(countQuery, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;
    
    // Add pagination and ordering
    sqlQuery += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
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
      console.error('Error fetching collectors:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in collectors GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/collectors/:id - Get collector by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = `
      SELECT 
        c.id,
        c.code,
        c.name,
        c.surname,
        c.full_name,
        c.nickname,
        c.phone,
        c.phone2,
        c.email,
        c.address,
        c.position,
        c.hire_date,
        c.salary,
        c.commission_rate,
        c.branch_id,
        c.assigned_areas,
        c.vehicle_info,
        c.total_collections,
        c.collections_count,
        c.success_rate,
        c.status,
        c.is_supervisor,
        c.can_approve_payments,
        c.created_at,
        c.updated_at,
        b.name as branch_name
      FROM collectors c
      LEFT JOIN branches b ON c.branch_id = b.id
      WHERE c.id = ?
    `;
    
    try {
      const results = await query(sqlQuery, [id]);
      
      if (results.length === 0) {
        return res.status(404).json({ 
          error: 'Collector not found' 
        });
      }
      
      res.json({
        success: true,
        data: results[0]
      });
    } catch (err) {
      console.error('Error fetching collector:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in collector GET by ID:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// POST /api/collectors - Create new collector
router.post('/', async (req, res) => {
  try {
    const { 
      code, name, surname, full_name, nickname, phone, phone2, email, address,
      position, hire_date, salary, commission_rate, branch_id, assigned_areas,
      vehicle_info, is_supervisor, can_approve_payments
    } = req.body;
    
    // Validation
    if (!code || !name || !full_name || !branch_id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Code, name, full name, and branch ID are required'
      });
    }
    
    // Check if code already exists
    const existingCodeQuery = 'SELECT id FROM collectors WHERE code = ?';
    const existingCodeResult = await query(existingCodeQuery, [code]);
    if (existingCodeResult.length > 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Collector code already exists'
      });
    }
    
    const sqlQuery = `
      INSERT INTO collectors (
        code, name, surname, full_name, nickname, phone, phone2, email, address,
        position, hire_date, salary, commission_rate, branch_id, assigned_areas,
        vehicle_info, is_supervisor, can_approve_payments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      code, name || '', surname || '', full_name, nickname || '', 
      phone || '', phone2 || '', email || '', address || '',
      position || 'พนักงานเก็บเงิน', hire_date || null, salary || 0, 
      commission_rate || 0, branch_id, assigned_areas || '', 
      vehicle_info || '', is_supervisor || false, can_approve_payments || false
    ];
    
    try {
      const result = await query(sqlQuery, params);
      
      // Get the created collector
      const getQuery = `
        SELECT 
          c.id,
          c.code,
          c.name,
          c.surname,
          c.full_name,
          c.nickname,
          c.phone,
          c.phone2,
          c.email,
          c.address,
          c.position,
          c.hire_date,
          c.salary,
          c.commission_rate,
          c.branch_id,
          c.assigned_areas,
          c.vehicle_info,
          c.total_collections,
          c.collections_count,
          c.success_rate,
          c.status,
          c.is_supervisor,
          c.can_approve_payments,
          c.created_at,
          c.updated_at,
          b.name as branch_name
        FROM collectors c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE c.id = ?
      `;
      
      const results = await query(getQuery, [result.insertId]);
      
      res.status(201).json({
        success: true,
        message: 'Collector created successfully',
        data: results[0]
      });
    } catch (err) {
      console.error('Error creating collector:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in collector POST:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// PUT /api/collectors/:id - Update collector
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      code, name, surname, full_name, nickname, phone, phone2, email, address,
      position, hire_date, salary, commission_rate, branch_id, assigned_areas,
      vehicle_info, is_supervisor, can_approve_payments, status
    } = req.body;
    
    // Validation
    if (!name || !full_name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name and full name are required'
      });
    }
    
    // Check if code already exists (excluding current collector)
    if (code) {
      const existingCodeQuery = 'SELECT id FROM collectors WHERE code = ? AND id != ?';
      const existingCodeResult = await query(existingCodeQuery, [code, id]);
      if (existingCodeResult.length > 0) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Collector code already exists'
        });
      }
    }
    
    const sqlQuery = `
      UPDATE collectors 
      SET 
        code = ?, name = ?, surname = ?, full_name = ?, nickname = ?,
        phone = ?, phone2 = ?, email = ?, address = ?, position = ?,
        hire_date = ?, salary = ?, commission_rate = ?, branch_id = ?,
        assigned_areas = ?, vehicle_info = ?, is_supervisor = ?,
        can_approve_payments = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const params = [
      code || null, name, surname || null, full_name, nickname || null,
      phone || null, phone2 || null, email || null, address || null, position || 'พนักงานเก็บเงิน',
      hire_date || null, salary || 0, commission_rate || 0, branch_id,
      assigned_areas || null, vehicle_info || null, is_supervisor || false,
      can_approve_payments || false, status || 'active', id
    ];
    
    try {
      const result = await query(sqlQuery, params);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Collector not found' 
        });
      }
      
      // Get the updated collector
      const getQuery = `
        SELECT 
          c.id,
          c.code,
          c.name,
          c.surname,
          c.full_name,
          c.nickname,
          c.phone,
          c.phone2,
          c.email,
          c.address,
          c.position,
          c.hire_date,
          c.salary,
          c.commission_rate,
          c.branch_id,
          c.assigned_areas,
          c.vehicle_info,
          c.total_collections,
          c.collections_count,
          c.success_rate,
          c.status,
          c.is_supervisor,
          c.can_approve_payments,
          c.created_at,
          c.updated_at,
          b.name as branch_name
        FROM collectors c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE c.id = ?
      `;
      
      const results = await query(getQuery, [id]);
      
      res.json({
        success: true,
        message: 'Collector updated successfully',
        data: results[0]
      });
    } catch (err) {
      console.error('Error updating collector:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in collector PUT:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// DELETE /api/collectors/:id - Delete collector
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = 'DELETE FROM collectors WHERE id = ?';
    
    try {
      const result = await query(sqlQuery, [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Collector not found' 
        });
      }
      
      res.json({
        success: true,
        message: 'Collector deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting collector:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in collector DELETE:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

// GET /api/collectors/:id/performance - Get collector performance statistics
router.get('/:id/performance', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    let sqlQuery = `
      SELECT 
        c.id,
        c.full_name,
        c.total_collections,
        c.collections_count,
        c.success_rate,
        c.commission_rate,
        COUNT(pc.id) as total_payments,
        SUM(pc.amount) as total_amount,
        AVG(pc.amount) as avg_amount,
        COUNT(CASE WHEN pc.status = 'completed' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN pc.status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN pc.status = 'failed' THEN 1 END) as failed_payments
      FROM collectors c
      LEFT JOIN payment_collections pc ON c.id = pc.collector_id
      WHERE c.id = ?
    `;
    
    const params = [id];
    
    if (startDate && endDate) {
      sqlQuery += ' AND pc.payment_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    sqlQuery += ' GROUP BY c.id, c.full_name, c.total_collections, c.collections_count, c.success_rate, c.commission_rate';
    
    try {
      const results = await query(sqlQuery, params);
      
      if (results.length === 0) {
        return res.status(404).json({ 
          error: 'Collector not found' 
        });
      }
      
      const performance = results[0];
      
      // Calculate additional metrics
      const successRate = performance.total_payments > 0 ? 
        (performance.successful_payments / performance.total_payments * 100).toFixed(2) : 0;
      
      const commissionEarned = performance.total_amount * (performance.commission_rate / 100);
      
      res.json({
        success: true,
        data: {
          ...performance,
          calculated_success_rate: parseFloat(successRate),
          commission_earned: commissionEarned,
          period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
        }
      });
    } catch (err) {
      console.error('Error fetching collector performance:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
    }
  } catch (error) {
    console.error('Error in collector performance GET:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

module.exports = router; 