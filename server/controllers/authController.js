const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { sendVerificationEmail } = require('../config/email');

// Генерація 6-значного коду
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// JWT secret для верифікації (можна використати інший ключ)
const VERIFY_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production';

// Надсилання коду верифікації на email
const sendVerificationCode = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Валідація
    if (!email) {
      return res.status(400).json({ message: 'Email обов\'язковий' });
    }

    const connection = await pool.getConnection();

    // Перевірка чи користувач вже існує
    const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    connection.release();
    
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Користувач з такою email вже існує' });
    }

    // Генеруємо 6-значний код
    const code = generateCode();
    
    // Створюємо JWT токен з кодом та даними користувача (діє 10 хвилин)
    const verificationToken = jwt.sign(
      { 
        email, 
        name, 
        password,
        code,
        type: 'registration' 
      },
      VERIFY_SECRET,
      { expiresIn: '10m' }
    );

    // Надсилаємо email
    const result = await sendVerificationEmail(email, code);
    
    console.log('📧 Verification code sent to:', email);
    console.log('📧 Code:', code); // Для дебагу - прибрати в продакшн!
    
    res.json({ 
      message: 'Код підтвердження надіслано на email',
      verificationToken,
      // Для тестування - показуємо URL листа (прибрати в продакшн!)
      ...(result.previewUrl && { previewUrl: result.previewUrl })
    });
  } catch (error) {
    console.error('Помилка надсилання коду:', error);
    res.status(500).json({ message: 'Помилка надсилання коду', error: error.message });
  }
};

// Перевірка коду та завершення реєстрації
const verifyCodeAndRegister = async (req, res) => {
  try {
    const { verificationToken, code } = req.body;

    if (!verificationToken || !code) {
      return res.status(400).json({ message: 'Токен та код обов\'язкові' });
    }

    // Перевіряємо JWT токен
    let decoded;
    try {
      decoded = jwt.verify(verificationToken, VERIFY_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({ message: 'Код підтвердження прострочений. Запросіть новий.' });
      }
      return res.status(400).json({ message: 'Невірний токен' });
    }

    // Перевіряємо код
    if (decoded.code !== code) {
      return res.status(400).json({ message: 'Невірний код підтвердження' });
    }

    const { email, name, password } = decoded;

    const connection = await pool.getConnection();

    // Повторна перевірка чи користувач не зареєструвався поки чекав
    const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Користувач з такою email вже існує' });
    }

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Додавання користувача в БД
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    connection.release();

    const userId = result.insertId;

    // Генерація JWT токена для авторизації
    const token = jwt.sign(
      { id: userId, email, name },
      VERIFY_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({ 
      message: 'Реєстрація успішна!',
      token,
      user: {
        id: userId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Помилка верифікації:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

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

// Надсилання коду верифікації для входу
const sendLoginVerificationCode = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const connection = await pool.getConnection();

    // Пошук користувача
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Перевірка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    connection.release();

    // Генеруємо 6-значний код
    const code = generateCode();
    
    // Створюємо JWT токен з кодом та ID користувача
    const verificationToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name,
        code,
        type: 'login' 
      },
      VERIFY_SECRET,
      { expiresIn: '10m' }
    );

    // Надсилаємо email
    const result = await sendVerificationEmail(email, code);
    
    console.log('📧 Login verification code sent to:', email);
    console.log('📧 Code:', code);
    
    res.json({ 
      message: 'Verification code sent to email',
      verificationToken,
      ...(result.previewUrl && { previewUrl: result.previewUrl })
    });
  } catch (error) {
    console.error('Error sending login code:', error);
    res.status(500).json({ message: 'Failed to send verification code', error: error.message });
  }
};

// Перевірка коду та завершення входу
const verifyCodeAndLogin = async (req, res) => {
  try {
    const { verificationToken, code } = req.body;

    if (!verificationToken || !code) {
      return res.status(400).json({ message: 'Token and code are required' });
    }

    // Перевіряємо JWT токен
    let decoded;
    try {
      decoded = jwt.verify(verificationToken, VERIFY_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({ message: 'Verification code expired. Please request a new one.' });
      }
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Перевіряємо тип токена
    if (decoded.type !== 'login') {
      return res.status(400).json({ message: 'Invalid token type' });
    }

    // Перевіряємо код
    if (decoded.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    const { userId, email, name } = decoded;

    // Отримуємо актуальні дані користувача
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Генерація JWT токена для авторизації
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      VERIFY_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({ 
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Login verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  register, 
  login, 
  getCurrentUser, 
  logout, 
  changePassword, 
  changeEmail,
  sendVerificationCode,
  verifyCodeAndRegister,
  sendLoginVerificationCode,
  verifyCodeAndLogin
};
