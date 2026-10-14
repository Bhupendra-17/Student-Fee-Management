require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory fallback dataset in case MySQL is unreachable
const fallbackStudents = [
  { id: 1, name: 'Aman Sharma', class: '10', totalFee: 5000, paidAmount: 3000, pendingAmount: 2000 },
  { id: 2, name: 'Priya Verma', class: '9', totalFee: 4000, paidAmount: 4000, pendingAmount: 0 },
  { id: 3, name: 'Rahul Patel', class: '10', totalFee: 6000, paidAmount: 2500, pendingAmount: 3500 },
  { id: 4, name: 'Neha Singh', class: '8', totalFee: 3000, paidAmount: 0, pendingAmount: 3000 },
  { id: 5, name: 'Rohan Das', class: '9', totalFee: 5500, paidAmount: 2000, pendingAmount: 3500 },
];

let dbPool = null;

// Initialize MySQL Pool
async function initDB() {
  try {
    dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'student_fee_db',
      waitForConnections: true,
      connectionLimit: 10,
    });
    // Test query
    await dbPool.query('SELECT 1');
    console.log('✅ Connected to MySQL Database (student_fee_db)');
  } catch (err) {
    console.warn('⚠️ MySQL connection failed, operating with mock fallback mode:', err.message);
    dbPool = null;
  }
}

// 1. Health & Connection Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: dbPool ? 'connected' : 'fallback-mode',
  });
});

// 2. Retrieve All Students with Calculated Total, Paid, and Pending Fees
app.get('/api/students', async (req, res) => {
  if (!dbPool) {
    return res.json({ source: 'fallback', data: fallbackStudents });
  }

  try {
    const query = `
      SELECT 
        s.id,
        s.name,
        s.class,
        ROUND(s.total_fee, 2) AS totalFee,
        ROUND(COALESCE(SUM(p.amount), 0), 2) AS paidAmount,
        ROUND(GREATEST(0, s.total_fee - COALESCE(SUM(p.amount), 0)), 2) AS pendingAmount
      FROM students s
      LEFT JOIN payments p ON s.id = p.student_id
      GROUP BY s.id, s.name, s.class, s.total_fee
      ORDER BY s.id ASC;
    `;
    const [rows] = await dbPool.query(query);
    res.json({ source: 'mysql', data: rows });
  } catch (err) {
    console.error('Error fetching students from MySQL:', err.message);
    res.status(500).json({ error: 'Failed to fetch student data', details: err.message });
  }
});

// 3. Record a Payment (Optional Live Transaction Support)
app.post('/api/payments', async (req, res) => {
  const { studentId, amount, remarks } = req.body;
  if (!studentId || !amount || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid studentId and positive amount are required.' });
  }

  if (!dbPool) {
    // In-memory update
    const student = fallbackStudents.find(s => s.id === Number(studentId));
    if (!student) return res.status(404).json({ error: 'Student not found' });
    student.paidAmount += Number(amount);
    student.pendingAmount = Math.max(0, student.totalFee - student.paidAmount);
    return res.json({ success: true, message: 'Payment recorded (in-memory mode)', student });
  }

  try {
    const paymentDate = new Date().toISOString().split('T')[0];
    await dbPool.query(
      'INSERT INTO payments (student_id, amount, payment_date, remarks) VALUES (?, ?, ?, ?)',
      [studentId, amount, paymentDate, remarks || 'Dashboard Payment']
    );
    res.json({ success: true, message: 'Payment recorded in MySQL successfully' });
  } catch (err) {
    console.error('Error recording payment:', err.message);
    res.status(500).json({ error: 'Database payment insert failed', details: err.message });
  }
});

// Start Server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Student Fee API running on http://localhost:${PORT}`);
  });
});
