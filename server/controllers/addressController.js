const { pool } = require('../config/database');

// Отримати всі адреси користувача
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [addresses] = await connection.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY id DESC',
      [userId]
    );

    connection.release();

    res.json({ addresses });
  } catch (error) {
    console.error('Помилка отримання адрес:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Додати нову адресу
const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { city, street, postal_code, phone } = req.body;

    if (!city || !street) {
      return res.status(400).json({ message: 'Місто і вулиця обов\'язкові' });
    }

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'INSERT INTO addresses (user_id, city, street, postal_code, phone) VALUES (?, ?, ?, ?, ?)',
      [userId, city, street, postal_code || null, phone || null]
    );

    connection.release();

    res.status(201).json({
      message: 'Адреса додана успішно',
      address: {
        id: result.insertId,
        city,
        street,
        postal_code,
        phone
      }
    });
  } catch (error) {
    console.error('Помилка додавання адреси:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Оновити адресу
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { city, street, postal_code, phone } = req.body;

    const connection = await pool.getConnection();

    // Перевірка що адреса належить користувачу
    const [addresses] = await connection.query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (addresses.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Адресу не знайдено' });
    }

    await connection.query(
      'UPDATE addresses SET city = ?, street = ?, postal_code = ?, phone = ? WHERE id = ? AND user_id = ?',
      [city, street, postal_code || null, phone || null, id, userId]
    );

    connection.release();

    res.json({
      message: 'Адреса оновлена успішно',
      address: { id, city, street, postal_code, phone }
    });
  } catch (error) {
    console.error('Помилка оновлення адреси:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Видалити адресу
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'DELETE FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Адресу не знайдено' });
    }

    res.json({ message: 'Адресу видалено успішно' });
  } catch (error) {
    console.error('Помилка видалення адреси:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

module.exports = {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress
};
