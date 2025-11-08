const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Реєстрація користувача
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Валідація
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Ім\'я, email та пароль обов\'язкові' });
    }

    // Валідація пароля (мінімум 6 символів)
    if (password.length < 6) {
      return res.status(400).json({ message: 'Пароль має бути мінімум 6 символів' });
    }

    const connection = await pool.getConnection();

    // Перевірка чи користувач вже існує
    const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Користувач з такою email уже існує' });
    }

    // Хешування пароля (10 раундів солі)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Додавання користувача в БД
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    connection.release();

    const userId = result.insertId;

    // Генерація JWT токена
    const token = jwt.sign(
      { id: userId, email, name },
      process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({ 
      message: 'Користувач зареєстрований успішно',
      token,
      user: {
        id: userId,
        name,
        email
      }
    });
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

    // Перевірка пароля (розхеширування)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ message: 'Невірна email або пароль' });
    }

    connection.release();

    // Генерація JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Вхід успішний',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url
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
      name: user.name,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Помилка отримання користувача:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Logout (фронтенд видаляє токен з localStorage)
const logout = (req, res) => {
  res.json({ message: 'Вихід успішний' });
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // Перевіряємо чи всі поля заповнені
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Старий та новий пароль є обов\'язковими' 
      });
    }

    // Перевіряємо довжину нового пароля
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Новий пароль повинен містити мінімум 6 символів' 
      });
    }

    // Отримуємо з'єднання з пулу
    const connection = await pool.getConnection();

    try {
      // Отримуємо користувача з бази даних
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        connection.release();
        return res.status(404).json({ error: 'Користувача не знайдено' });
      }

      const user = users[0];

      // Перевіряємо старий пароль
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isOldPasswordValid) {
        connection.release();
        return res.status(400).json({ error: 'Неправильний старий пароль' });
      }

      // Хешуємо новий пароль
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Оновлюємо пароль в базі даних
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashedNewPassword, userId]
      );

      connection.release();

      res.json({ message: 'Пароль успішно змінено' });
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

const changeEmail = async (req, res) => {
  const { newEmail } = req.body;
  const userId = req.user.id;

  try {
    // Перевіряємо чи email заповнений
    if (!newEmail) {
      return res.status(400).json({ error: 'Email є обов\'язковим' });
    }

    // Перевіряємо формат email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ error: 'Неправильний формат email' });
    }

    // Отримуємо з'єднання з пулу
    const connection = await pool.getConnection();

    try {
      // Перевіряємо чи email вже існує
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [newEmail, userId]
      );

      if (existingUsers.length > 0) {
        connection.release();
        return res.status(400).json({ error: 'Цей email вже використовується' });
      }

      // Оновлюємо email в базі даних
      await connection.execute(
        'UPDATE users SET email = ? WHERE id = ?',
        [newEmail, userId]
      );

      connection.release();

      res.json({ message: 'Email успішно змінено', newEmail });
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

module.exports = { register, login, getCurrentUser, logout, changePassword, changeEmail };
