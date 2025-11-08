require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jewellery_shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ MySQL підключена успішно');
    connection.release();
  } catch (error) {
    console.error('✗ Помилка підключення MySQL:', error);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
