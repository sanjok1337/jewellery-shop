const { pool } = require('../config/database');

// Додати товар до кошика
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

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

    // Перевіряємо, чи є товар вже в кошику
    const [existingItems] = await pool.execute(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existingItems.length > 0) {
      // Оновлюємо кількість
      await pool.execute(
        'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity, userId, productId]
      );
    } else {
      // Додаємо новий товар
      await pool.execute(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );
    }

    res.json({
      success: true,
      message: 'Товар додано в кошик'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка додавання в кошик'
    });
  }
};

// Отримати кошик користувача
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const [cartItems] = await pool.execute(`
      SELECT 
        ci.id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.price,
        pi.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
      WHERE ci.user_id = ?
    `, [userId]);

    res.json({
      success: true,
      items: cartItems
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання кошика'
    });
  }
};

// Оновити кількість товару в кошику
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Кількість повинна бути більше 0'
      });
    }

    await pool.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, itemId, userId]
    );

    res.json({
      success: true,
      message: 'Кількість оновлено'
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка оновлення кошика'
    });
  }
};

// Видалити товар з кошика
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    await pool.execute(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    res.json({
      success: true,
      message: 'Товар видалено з кошика'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка видалення з кошика'
    });
  }
};

// Очистити кошик
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'Кошик очищено'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка очищення кошика'
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
};