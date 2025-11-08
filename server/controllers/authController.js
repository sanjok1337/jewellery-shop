const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Реєстрація користувача
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Валідація
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Всі поля обов\'язкові' });
    }

    const connection = await pool.getConnection();

    // Перевірка чи користувач вже існує
    const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Користувач з такою email уже існує' });
    }

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Додавання користувача в БД
    await connection.query(
      'INSERT INTO users (email, password, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, phone || null]
    );

    connection.release();

    res.status(201).json({ message: 'Користувач зареєстрований успішно' });
  } catch (error) {
    console.error('Помилка реєстрації:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Логін користувача
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валідація
    if (!email || !password) {
      return res.status(400).json({ message: 'Email та пароль обов\'язкові' });
    }

    const connection = await pool.getConnection();

    // Пошук користувача
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ message: 'Невірна email або пароль' });
    }

    const user = users[0];

    // Перевірка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ message: 'Невірна email або пароль' });
    }

    // Генерація JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email, firstName: user.first_name },
      process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    connection.release();

    res.json({
      message: 'Вхід успішний',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    console.error('Помилка логіну:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Отримання даних поточного користувача
const getCurrentUser = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: 'Користувач не знайден' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone
    });
  } catch (error) {
    console.error('Помилка отримання користувача:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

module.exports = { register, login, getCurrentUser };
