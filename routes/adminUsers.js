const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { query } = require('../db/db');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  // TODO: Implement proper authentication middleware
  // For now, we'll skip authentication for development
  next();
};

// Middleware to check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    // TODO: Implement role-based access control
    // For now, we'll skip role checking for development
    next();
  };
};

// GET /api/admin-users - Get all admin users
router.get('/', requireAuth, async (req, res) => {
  try {
    const { branch_id, role, is_active, search } = req.query;
    
    let sqlQuery = `
      SELECT 
        au.*,
        b.name as branch_name
      FROM admin_users au
      LEFT JOIN branches b ON au.branch_id = b.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branch_id) {
      sqlQuery += ' AND au.branch_id = ?';
      params.push(branch_id);
    }
    
    if (role) {
      sqlQuery += ' AND au.role = ?';
      params.push(role);
    }
    
    if (is_active !== undefined) {
      sqlQuery += ' AND au.is_active = ?';
      params.push(is_active === 'true');
    }
    
    if (search) {
      sqlQuery += ` AND (
        au.username LIKE ? OR 
        au.email LIKE ? OR 
        au.full_name LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sqlQuery += ' ORDER BY au.created_at DESC';
    
    const results = await query(sqlQuery, params);
    
    // Remove password hash from response
    const users = results.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/admin-users/:id - Get admin user by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = `
      SELECT 
        au.*,
        b.name as branch_name
      FROM admin_users au
      LEFT JOIN branches b ON au.branch_id = b.id
      WHERE au.id = ?
    `;
    
    const results = await query(sqlQuery, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = results[0];
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error fetching admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/admin-users - Create new admin user
router.post('/', requireAuth, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      full_name,
      role,
      branch_id,
      permissions,
      is_active
    } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !full_name || !role) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }
    
    // Check if username already exists
    const existingUser = await query('SELECT id FROM admin_users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const sqlQuery = `
      INSERT INTO admin_users (
        username, email, password_hash, full_name, role, 
        branch_id, permissions, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      username,
      email,
      passwordHash,
      full_name,
      role,
      branch_id || null,
      JSON.stringify(permissions || []),
      is_active !== undefined ? is_active : true
    ];
    
    const result = await query(sqlQuery, params);
    
    // Fetch the created user
    const userQuery = `
      SELECT 
        au.*,
        b.name as branch_name
      FROM admin_users au
      LEFT JOIN branches b ON au.branch_id = b.id
      WHERE au.id = ?
    `;
    
    const user = await query(userQuery, [result.insertId]);
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user[0];
    
    res.status(201).json({
      success: true,
      message: 'สร้างผู้ใช้งานใหม่เรียบร้อยแล้ว',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/admin-users/:id - Update admin user
router.put('/:id', requireAuth, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      full_name,
      role,
      branch_id,
      permissions,
      is_active
    } = req.body;
    
    // Validate required fields
    if (!username || !email || !full_name || !role) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }
    
    // Check if username/email already exists for other users
    const existingUser = await query('SELECT id FROM admin_users WHERE (username = ? OR email = ?) AND id != ?', [username, email, id]);
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว'
      });
    }
    
    const sqlQuery = `
      UPDATE admin_users SET
        username = ?, email = ?, full_name = ?, role = ?, 
        branch_id = ?, permissions = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [
      username,
      email,
      full_name,
      role,
      branch_id || null,
      JSON.stringify(permissions || []),
      is_active,
      id
    ];
    
    const result = await query(sqlQuery, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้งานที่ต้องการแก้ไข'
      });
    }
    
    // Fetch the updated user
    const userQuery = `
      SELECT 
        au.*,
        b.name as branch_name
      FROM admin_users au
      LEFT JOIN branches b ON au.branch_id = b.id
      WHERE au.id = ?
    `;
    
    const user = await query(userQuery, [id]);
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user[0];
    
    res.json({
      success: true,
      message: 'อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/admin-users/:id - Delete admin user
router.delete('/:id', requireAuth, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting own account
    // TODO: Get current user ID from authentication
    // if (id === currentUserId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'ไม่สามารถลบบัญชีของตัวเองได้'
    //   });
    // }
    
    const sqlQuery = 'DELETE FROM admin_users WHERE id = ?';
    const result = await query(sqlQuery, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้งานที่ต้องการลบ'
      });
    }
    
    res.json({
      success: true,
      message: 'ลบผู้ใช้งานเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PATCH /api/admin-users/:id/status - Toggle user status
router.patch('/:id/status', requireAuth, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const sqlQuery = 'UPDATE admin_users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await query(sqlQuery, [is_active, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้งานที่ต้องการแก้ไข'
      });
    }
    
    res.json({
      success: true,
      message: `${is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}ผู้ใช้งานเรียบร้อยแล้ว`
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/admin-users/:id/reset-password - Reset user password
router.post('/:id/reset-password', requireAuth, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Generate new password
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    
    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    const sqlQuery = 'UPDATE admin_users SET password_hash = ?, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await query(sqlQuery, [passwordHash, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้งานที่ต้องการรีเซ็ตรหัสผ่าน'
      });
    }
    
    res.json({
      success: true,
      message: 'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว',
      new_password: newPassword
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/admin-users/:id/change-password - Change user password
router.post('/:id/change-password', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;
    
    // TODO: Verify current password
    // For now, we'll skip this check
    
    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(new_password, saltRounds);
    
    const sqlQuery = 'UPDATE admin_users SET password_hash = ?, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await query(sqlQuery, [passwordHash, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้งานที่ต้องการเปลี่ยนรหัสผ่าน'
      });
    }
    
    res.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/admin-users/permissions - Get available permissions
router.get('/permissions', requireAuth, async (req, res) => {
  try {
    const permissions = [
      { id: 'dashboard.view', name: 'ดูแดชบอร์ด', category: 'dashboard' },
      { id: 'branches.view', name: 'ดูข้อมูลสาขา', category: 'branches' },
      { id: 'branches.create', name: 'เพิ่มสาขา', category: 'branches' },
      { id: 'branches.edit', name: 'แก้ไขสาขา', category: 'branches' },
      { id: 'branches.delete', name: 'ลบสาขา', category: 'branches' },
      { id: 'customers.view', name: 'ดูข้อมูลลูกค้า', category: 'customers' },
      { id: 'customers.create', name: 'เพิ่มลูกค้า', category: 'customers' },
      { id: 'customers.edit', name: 'แก้ไขลูกค้า', category: 'customers' },
      { id: 'customers.delete', name: 'ลบลูกค้า', category: 'customers' },
      { id: 'products.view', name: 'ดูข้อมูลสินค้า', category: 'products' },
      { id: 'products.create', name: 'เพิ่มสินค้า', category: 'products' },
      { id: 'products.edit', name: 'แก้ไขสินค้า', category: 'products' },
      { id: 'products.delete', name: 'ลบสินค้า', category: 'products' },
      { id: 'contracts.view', name: 'ดูสัญญา', category: 'contracts' },
      { id: 'contracts.create', name: 'สร้างสัญญา', category: 'contracts' },
      { id: 'contracts.edit', name: 'แก้ไขสัญญา', category: 'contracts' },
      { id: 'contracts.delete', name: 'ลบสัญญา', category: 'contracts' },
      { id: 'payments.view', name: 'ดูการชำระเงิน', category: 'payments' },
      { id: 'payments.create', name: 'บันทึกการชำระ', category: 'payments' },
      { id: 'payments.edit', name: 'แก้ไขการชำระ', category: 'payments' },
      { id: 'reports.view', name: 'ดูรายงาน', category: 'reports' },
      { id: 'reports.export', name: 'ส่งออกรายงาน', category: 'reports' },
      { id: 'settings.view', name: 'ดูการตั้งค่า', category: 'settings' },
      { id: 'settings.edit', name: 'แก้ไขการตั้งค่า', category: 'settings' },
      { id: 'users.view', name: 'ดูผู้ใช้งาน', category: 'users' },
      { id: 'users.create', name: 'เพิ่มผู้ใช้งาน', category: 'users' },
      { id: 'users.edit', name: 'แก้ไขผู้ใช้งาน', category: 'users' },
      { id: 'users.delete', name: 'ลบผู้ใช้งาน', category: 'users' }
    ];
    
    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/admin-users/me - Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    // TODO: Get current user ID from authentication
    // For now, return a mock response
    res.json({
      success: true,
      data: {
        id: 1,
        username: 'admin',
        email: 'admin@kuntarn.com',
        full_name: 'System Administrator',
        role: 'super_admin',
        branch_id: null,
        branch_name: 'ทุกสาขา',
        permissions: ['*'],
        is_active: true,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/admin-users/me - Update current user profile
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { full_name, email } = req.body;
    
    // TODO: Get current user ID from authentication
    const currentUserId = 1;
    
    const sqlQuery = 'UPDATE admin_users SET full_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await query(sqlQuery, [full_name, email, currentUserId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้งานที่ต้องการแก้ไข'
      });
    }
    
    res.json({
      success: true,
      message: 'อัปเดตโปรไฟล์เรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 