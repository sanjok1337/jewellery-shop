const { pool } = require('../config/database');

// Додати товар до віш-ліста
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'ID товару обов\'язковий'
      });
    }

    // Перевіряємо, чи існує товар
    const [products] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Товар не знайдено'
      });
    }

    // Перевіряємо, чи не додано товар вже до віш-ліста
    const [existingItems] = await pool.execute(
      'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existingItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Товар вже є у віш-ліст'
      });
    }

    // Додаємо товар до віш-ліста
    await pool.execute(
      'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    );

    res.json({
      success: true,
      message: 'Товар додано до віш-ліста'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка додавання до віш-ліста'
    });
  }
};

// Отримати віш-ліст користувача
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const connection = await pool.getConnection();
    const [wishlistItems] = await connection.query(`
      SELECT 
        w.id,
        p.id as product_id,
        p.name,
        p.price,
        pi.image_url,
        c.name as category
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId]);
    connection.release();

    res.json({
      success: true,
      items: wishlistItems
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання віш-ліста'
    });
  }
};

// Видалити товар з віш-ліста
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    await pool.execute(
      'DELETE FROM wishlist WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    res.json({
      success: true,
      message: 'Товар видалено з віш-ліста'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка видалення з віш-ліста'
    });
  }
};

// Видалити товар з віш-ліста за product_id
const removeFromWishlistByProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await pool.execute(
      'DELETE FROM wishlist WHERE product_id = ? AND user_id = ?',
      [productId, userId]
    );

    res.json({
      success: true,
      message: 'Товар видалено з віш-ліста'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка видалення з віш-ліста'
    });
  }
};

// Очистити віш-ліст
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.execute('DELETE FROM wishlist WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'Віш-ліст очищено'
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка очищення віш-ліста'
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  removeFromWishlistByProduct,
  clearWishlist
};