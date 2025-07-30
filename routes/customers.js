const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

// GET /api/customers - Get all customers
router.get('/', async (req, res) => {
  try {
    const { branchId, checkerId, search, status } = req.query;
    
    let sqlQuery = `
      SELECT 
        c.*,
        b.name as branch_name,
        ch.full_name as checker_name
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN checkers ch ON c.checker_id = ch.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branchId) {
      sqlQuery += ' AND c.branch_id = ?';
      params.push(branchId);
    }
    
    if (checkerId) {
      sqlQuery += ' AND c.checker_id = ?';
      params.push(checkerId);
    }
    
    if (search) {
      sqlQuery += ` AND (
        c.code LIKE ? OR 
        c.full_name LIKE ? OR 
        c.id_card LIKE ? OR 
        c.nickname LIKE ? OR
        c.phone1 LIKE ? OR
        c.phone2 LIKE ? OR
        c.phone3 LIKE ? OR
        c.guarantor_name LIKE ? OR
        c.guarantor_id_card LIKE ? OR
        c.guarantor_nickname LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status && status !== 'all') {
      sqlQuery += ' AND c.status = ?';
      params.push(status);
    }
    
    sqlQuery += ' ORDER BY c.created_at DESC';
    
    const results = await query(sqlQuery, params);
    
    res.json({
      success: true,
      data: results,
      total: results.length
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/customers/:id - Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = `
      SELECT 
        c.*,
        b.name as branch_name,
        ch.full_name as checker_name
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN checkers ch ON c.checker_id = ch.id
      WHERE c.id = ?
    `;
    
    const results = await query(sqlQuery, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/customers - Create new customer
router.post('/', async (req, res) => {
  try {
    const {
      code,
      title,
      name,
      surname,
      fullName,
      nickname,
      age,
      idCard,
      address,
      moo,
      road,
      subdistrict,
      district,
      province,
      phone1,
      phone2,
      phone3,
      email,
      guarantorName,
      guarantorIdCard,
      guarantorNickname,
      guarantorPhone,
      guarantorAddress,
      status,
      branchId,
      checkerId
    } = req.body;
    
    const sqlQuery = `
      INSERT INTO customers (
        code, title, name, surname, full_name, nickname, age, id_card, address,
        moo, road, subdistrict, district, province, phone1, phone2, phone3, email,
        guarantor_name, guarantor_id_card, guarantor_nickname, guarantor_phone, guarantor_address,
        status, branch_id, checker_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      code, title || 'นาย', name, surname, fullName, nickname, age, idCard, address,
      moo, road, subdistrict, district, province, phone1, phone2, phone3, email,
      guarantorName, guarantorIdCard, guarantorNickname, guarantorPhone, guarantorAddress,
      status || 'active', branchId, checkerId
    ];
    
    const result = await query(sqlQuery, params);
    
    // Fetch the created customer
    const customerQuery = `
      SELECT 
        c.*,
        b.name as branch_name,
        ch.full_name as checker_name
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN checkers ch ON c.checker_id = ch.id
      WHERE c.id = ?
    `;
    
    const customer = await query(customerQuery, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer[0]
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      title,
      name,
      surname,
      fullName,
      nickname,
      age,
      idCard,
      address,
      moo,
      road,
      subdistrict,
      district,
      province,
      phone1,
      phone2,
      phone3,
      email,
      guarantorName,
      guarantorIdCard,
      guarantorNickname,
      guarantorPhone,
      guarantorAddress,
      status,
      branchId,
      checkerId
    } = req.body;
    
    const sqlQuery = `
      UPDATE customers SET
        code = ?, title = ?, name = ?, surname = ?, full_name = ?, nickname = ?, age = ?,
        id_card = ?, address = ?, moo = ?, road = ?, subdistrict = ?, district = ?, province = ?,
        phone1 = ?, phone2 = ?, phone3 = ?, email = ?, guarantor_name = ?, guarantor_id_card = ?,
        guarantor_nickname = ?, guarantor_phone = ?, guarantor_address = ?,
        status = ?, branch_id = ?, checker_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [
      code, title, name, surname, fullName, nickname, age, idCard, address,
      moo, road, subdistrict, district, province, phone1, phone2, phone3, email,
      guarantorName, guarantorIdCard, guarantorNickname, guarantorPhone, guarantorAddress,
      status, branchId, checkerId, id
    ];
    
    const result = await query(sqlQuery, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Fetch the updated customer
    const customerQuery = `
      SELECT 
        c.*,
        b.name as branch_name,
        ch.full_name as checker_name
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN checkers ch ON c.checker_id = ch.id
      WHERE c.id = ?
    `;
    
    const customer = await query(customerQuery, [id]);
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer[0]
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
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
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/customers/checker/:checkerId - Get customers by checker
router.get('/checker/:checkerId', async (req, res) => {
  try {
    const { checkerId } = req.params;
    const { search, status } = req.query;
    
    // Get customers directly linked to checker
    let sqlQuery = `
      SELECT DISTINCT
        c.*,
        b.name as branch_name,
        ch.full_name as checker_name,
        COUNT(i.id) as contract_count,
        SUM(i.total_amount) as total_contracts_amount
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN checkers ch ON c.checker_id = ch.id
      LEFT JOIN installments i ON c.id = i.customer_id
      WHERE c.checker_id = ?
    `;
    
    const params = [checkerId];
    
    if (search) {
      sqlQuery += ` AND (
        c.code LIKE ? OR 
        c.full_name LIKE ? OR 
        c.id_card LIKE ? OR 
        c.nickname LIKE ? OR
        c.guarantor_name LIKE ? OR
        c.guarantor_id_card LIKE ? OR
        c.guarantor_nickname LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status && status !== 'all') {
      sqlQuery += ' AND c.status = ?';
      params.push(status);
    }
    
    sqlQuery += ' GROUP BY c.id ORDER BY c.created_at DESC';
    
    const results = await query(sqlQuery, params);
    
    console.log(`🔍 Found ${results.length} customers for checker ${checkerId}`);
    
    res.json({
      success: true,
      data: results,
      total: results.length
    });
  } catch (error) {
    console.error('Error fetching customers by checker:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/customers/checker/:checkerId/contracts - Get customers with contracts for a specific checker
router.get('/checker/:checkerId/contracts', async (req, res) => {
  try {
    const { checkerId } = req.params;
    const { search, status, page = 1, limit = 25 } = req.query;
    
    console.log('🔍 Getting customers for checker:', checkerId);
    
    // Build the base query
    let sqlQuery = `
      SELECT DISTINCT
        c.id,
        c.code,
        c.name,
        c.surname,
        c.full_name,
        c.nickname,
        c.id_card,
        c.phone1,
        c.phone2,
        c.phone3,
        c.email,
        c.address,
        c.status,
        c.guarantor_name,
        c.guarantor_id_card,
        c.guarantor_nickname,
        COUNT(i.id) as contract_count,
        SUM(i.total_amount) as total_contracts_amount,
        MAX(i.contract_date) as latest_contract_date,
        GROUP_CONCAT(DISTINCT i.contract_number ORDER BY i.contract_date DESC SEPARATOR ', ') as contract_numbers,
        CASE 
          WHEN i.discount_amount > 0 OR i.discount_percentage > 0 THEN 1 
          ELSE 0 
        END as has_discount
      FROM customers c
      INNER JOIN installments i ON c.id = i.customer_id
      WHERE i.inspector_id = ?
    `;
    
    const queryParams = [checkerId];
    
    // Add search filter
    if (search) {
      sqlQuery += ` AND (
        c.code LIKE ? OR 
        c.name LIKE ? OR 
        c.surname LIKE ? OR 
        c.full_name LIKE ? OR 
        c.nickname LIKE ? OR 
        c.id_card LIKE ? OR
        c.guarantor_name LIKE ? OR
        c.guarantor_id_card LIKE ? OR
        c.guarantor_nickname LIKE ?
      )`;
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
    }
    
    // Add status filter
    if (status && status !== 'all') {
      sqlQuery += ` AND i.status = ?`;
      queryParams.push(status);
    }
    
    // Group by customer
    sqlQuery += ` GROUP BY c.id`;
    
    // Add order by
    sqlQuery += ` ORDER BY c.full_name ASC`;
    
    // Add pagination
    const offset = (page - 1) * limit;
    sqlQuery += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);
    
    console.log('🔍 Query:', sqlQuery);
    console.log('🔍 Params:', queryParams);
    
    const customers = await query(sqlQuery, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM customers c
      INNER JOIN installments i ON c.id = i.customer_id
      WHERE i.inspector_id = ?
    `;
    
    const countParams = [checkerId];
    
    if (search) {
      countQuery += ` AND (
        c.code LIKE ? OR 
        c.name LIKE ? OR 
        c.surname LIKE ? OR 
        c.full_name LIKE ? OR 
        c.nickname LIKE ? OR 
        c.id_card LIKE ? OR
        c.guarantor_name LIKE ? OR
        c.guarantor_id_card LIKE ? OR
        c.guarantor_nickname LIKE ?
      )`;
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
    }
    
    if (status && status !== 'all') {
      countQuery += ` AND i.status = ?`;
      countParams.push(status);
    }
    
    const countResult = await query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    
    // Get checker info
    const checkerQuery = 'SELECT id, name, surname, full_name FROM checkers WHERE id = ?';
    const checkerResult = await query(checkerQuery, [checkerId]);
    const checker = checkerResult[0];
    
    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      checker,
      message: `Found ${customers.length} customers for checker ${checker?.full_name || checkerId}`
    });
    
  } catch (error) {
    console.error('Error getting customers for checker:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
});

module.exports = router; 