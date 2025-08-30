require('dotenv').config();
const express = require('express');

const app = express();
const PORT = Number(process.env.PORT || 1997);
const HOST = '0.0.0.0';

// เพิ่ม middleware สำหรับ parse JSON
app.use(express.json());

// ===== CORS Middleware =====
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// ===== Import Routes =====
const adminUsersRoutes = require('./routes/adminUsers');
const authRoutes = require('./routes/auth');
const branchesRoutes = require('./routes/branches');
const checkersRoutes = require('./routes/checkers');
const collectorsRoutes = require('./routes/collectors');
const customersRoutes = require('./routes/customers');
const employeesRoutes = require('./routes/employees');
const installmentsRoutes = require('./routes/installments');
const inventoryRoutes = require('./routes/inventory');
const productsRoutes = require('./routes/products');

// ===== Use Routes =====
app.use('/api/admin-users', adminUsersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/checkers', checkersRoutes);
app.use('/api/collectors', collectorsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/installments', installmentsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/products', productsRoutes);

// ===== Health Check Endpoints =====
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, pid: process.pid, port: PORT, time: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// ===== API Root Path =====
app.get('/api/', (_req, res) => {
  res.json({
    message: 'Welcome to Kuntarn API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      adminUsers: '/api/admin-users',
      branches: '/api/branches',
      checkers: '/api/checkers',
      collectors: '/api/collectors',
      customers: '/api/customers',
      employees: '/api/employees',
      installments: '/api/installments',
      inventory: '/api/inventory',
      products: '/api/products'
    },
    timestamp: new Date().toISOString()
  });
});

process.on('uncaughtException', (e) => console.error('❌ UncaughtException:', e));
process.on('unhandledRejection', (e) => console.error('❌ UnhandledRejection:', e));

app.listen(PORT, HOST, () => {
  console.log(`🚀 Kuntarn API server listening on http://${HOST}:${PORT} (pid ${process.pid})`);
  console.log(`📚 Available routes:`);
  console.log(`   - /api/auth (login, logout, etc.)`);
  console.log(`   - /api/admin-users (admin management)`);
  console.log(`   - /api/branches (branch management)`);
  console.log(`   - /api/checkers (checker management)`);
  console.log(`   - /api/collectors (collector management)`);
  console.log(`   - /api/customers (customer management)`);
  console.log(`   - /api/employees (employee management)`);
  console.log(`   - /api/installments (installment management)`);
  console.log(`   - /api/inventory (inventory management)`);
  console.log(`   - /api/products (product management)`);
  console.log(`🌐 CORS enabled for all origins`);
});
