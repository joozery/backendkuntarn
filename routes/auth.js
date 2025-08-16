const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db/db');

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// POST /api/auth/login - Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน'
      });
    }

    // Find user by username
    const sqlQuery = `
      SELECT 
        au.*,
        b.name as branch_name
      FROM admin_users au
      LEFT JOIN branches b ON au.branch_id = b.id
      WHERE au.username = ? AND au.is_active = 1
    `;

    const users = await query(sqlQuery, [username]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // Update last login
    await query('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        branch_id: user.branch_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Parse permissions from JSON string
    let permissions = [];
    try {
      permissions = JSON.parse(user.permissions || '[]');
    } catch (error) {
      console.error('Error parsing permissions:', error);
      permissions = [];
    }

    const userData = {
      ...userWithoutPassword,
      permissions
    };

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/auth/logout - Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/auth/validate - Validate token
router.get('/validate', authenticateToken, async (req, res) => {
  try {
    // Token is already validated by middleware
    res.json({
      success: true,
      valid: true,
      user: req.user
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/auth/refresh - Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Generate new token
    const token = jwt.sign(
      {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        branch_id: req.user.branch_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/auth/change-password - Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่'
      });
    }

    // Get current user
    const users = await query('SELECT * FROM admin_users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้งาน'
      });
    }

    const user = users[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await query(
      'UPDATE admin_users SET password_hash = ?, password_changed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกอีเมล'
      });
    }

    // Check if user exists
    const users = await query('SELECT * FROM admin_users WHERE email = ? AND is_active = 1', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้งานที่มีอีเมลนี้'
      });
    }

    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Send email with reset link
    // 3. Store reset token in database with expiration

    // For now, we'll just return success
    res.json({
      success: true,
      message: 'ส่งคำขอรีเซ็ตรหัสผ่านสำเร็จ กรุณาตรวจสอบอีเมล'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/auth/reset-password - Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // In a real application, you would:
    // 1. Verify reset token
    // 2. Check token expiration
    // 3. Update password
    // 4. Invalidate token

    // For now, we'll just return success
    res.json({
      success: true,
      message: 'รีเซ็ตรหัสผ่านสำเร็จ'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const sqlQuery = `
      SELECT 
        au.*,
        b.name as branch_name
      FROM admin_users au
      LEFT JOIN branches b ON au.branch_id = b.id
      WHERE au.id = ?
    `;

    const users = await query(sqlQuery, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้งาน'
      });
    }

    const user = users[0];
    const { password_hash, ...userWithoutPassword } = user;

    // Parse permissions
    let permissions = [];
    try {
      permissions = JSON.parse(user.permissions || '[]');
    } catch (error) {
      console.error('Error parsing permissions:', error);
      permissions = [];
    }

    const userData = {
      ...userWithoutPassword,
      permissions
    };

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 