const { pool } = require('../config/database');

// Отримати всі відгуки для товару
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const query = `
      SELECT 
        r.id, 
        r.product_id, 
        r.user_id, 
        r.parent_id,
        r.rating, 
        r.text, 
        r.created_at,
        u.name as user_name,
        u.avatar_url as user_avatar
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.status = 'visible'
      ORDER BY r.created_at DESC
    `;
    
    const [reviews] = await pool.execute(query, [productId]);
    
    // Обчислити середній рейтинг
    const [ratingResult] = await pool.execute(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE product_id = ? AND status = "visible" AND rating IS NOT NULL',
      [productId]
    );
    
    const avgRating = ratingResult[0].avg_rating ? parseFloat(ratingResult[0].avg_rating) : 0;
    const totalReviews = ratingResult[0].total_reviews || 0;
    
    res.json({
      reviews,
      avgRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: parseInt(totalReviews)
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Помилка при отриманні відгуків' });
  }
};

// Створити новий відгук або коментар
const createReview = async (req, res) => {
  try {
    const { productId, rating, text, parentId } = req.body;
    const userId = req.user.id;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Текст відгуку не може бути порожнім' });
    }
    
    // Якщо це відгук (не коментар), перевірити рейтинг
    if (!parentId && (!rating || rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Рейтинг повинен бути від 1 до 5' });
    }
    
    // Перевірити, чи товар існує
    const [productExists] = await pool.execute(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );
    
    if (productExists.length === 0) {
      return res.status(404).json({ message: 'Товар не знайдено' });
    }
    
    // Якщо це коментар, перевірити чи батьківський відгук існує
    if (parentId) {
      const [parentExists] = await pool.execute(
        'SELECT id FROM reviews WHERE id = ? AND product_id = ?',
        [parentId, productId]
      );
      
      if (parentExists.length === 0) {
        return res.status(404).json({ message: 'Батьківський відгук не знайдено' });
      }
    }
    
    const query = `
      INSERT INTO reviews (product_id, user_id, parent_id, rating, text, status)
      VALUES (?, ?, ?, ?, ?, 'visible')
    `;
    
    const [result] = await pool.execute(query, [
      productId,
      userId,
      parentId || null,
      parentId ? null : rating, // Коментарі не мають рейтингу
      text
    ]);
    
    // Оновити середній рейтинг товару, якщо це відгук (не коментар)
    if (!parentId) {
      await updateProductRating(productId);
    }
    
    // Отримати створений відгук з інформацією про користувача
    const [newReview] = await pool.execute(
      `SELECT 
        r.id, 
        r.product_id, 
        r.user_id, 
        r.parent_id,
        r.rating, 
        r.text, 
        r.created_at,
        u.name as user_name,
        u.avatar_url as user_avatar
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      message: parentId ? 'Коментар додано успішно' : 'Відгук додано успішно',
      review: newReview[0]
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Помилка при створенні відгуку' });
  }
};

// Оновити середній рейтинг товару
const updateProductRating = async (productId) => {
  try {
    const [result] = await pool.execute(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = ? AND status = "visible" AND rating IS NOT NULL',
      [productId]
    );
    
    const avgRating = result[0].avg_rating ? parseFloat(result[0].avg_rating) : 0;
    
    await pool.execute(
      'UPDATE products SET average_rating = ? WHERE id = ?',
      [parseFloat(avgRating.toFixed(1)), productId]
    );
  } catch (error) {
    console.error('Update product rating error:', error);
  }
};

// Видалити відгук (тільки свій)
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    
    // Перевірити, чи відгук належить користувачу
    const [review] = await pool.execute(
      'SELECT id, product_id, parent_id FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );
    
    if (review.length === 0) {
      return res.status(404).json({ message: 'Відгук не знайдено або ви не маєте прав на його видалення' });
    }
    
    const productId = review[0].product_id;
    const isParent = review[0].parent_id === null;
    
    await pool.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);
    
    // Оновити рейтинг, якщо це був відгук (не коментар)
    if (isParent) {
      await updateProductRating(productId);
    }
    
    res.json({ message: 'Відгук видалено успішно' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Помилка при видаленні відгуку' });
  }
};

// Оновити відгук
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, text } = req.body;
    const userId = req.user.id;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Текст відгуку не може бути порожнім' });
    }
    
    // Перевірити, чи відгук належить користувачу
    const [review] = await pool.execute(
      'SELECT id, product_id, parent_id FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );
    
    if (review.length === 0) {
      return res.status(404).json({ message: 'Відгук не знайдено або ви не маєте прав на його редагування' });
    }
    
    const productId = review[0].product_id;
    const isParent = review[0].parent_id === null;
    
    // Якщо це відгук (не коментар), можна оновити рейтинг
    if (isParent && rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Рейтинг повинен бути від 1 до 5' });
      }
      await pool.execute(
        'UPDATE reviews SET rating = ?, text = ? WHERE id = ?',
        [rating, text, reviewId]
      );
      await updateProductRating(productId);
    } else {
      await pool.execute(
        'UPDATE reviews SET text = ? WHERE id = ?',
        [text, reviewId]
      );
    }
    
    // Отримати оновлений відгук
    const [updatedReview] = await pool.execute(
      `SELECT 
        r.id, 
        r.product_id, 
        r.user_id, 
        r.parent_id,
        r.rating, 
        r.text, 
        r.created_at,
        u.name as user_name,
        u.avatar_url as user_avatar
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?`,
      [reviewId]
    );
    
    res.json({
      message: 'Відгук оновлено успішно',
      review: updatedReview[0]
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Помилка при оновленні відгуку' });
  }
};

module.exports = {
  getProductReviews,
  createReview,
  deleteReview,
  updateReview
};
