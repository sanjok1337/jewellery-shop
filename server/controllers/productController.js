const { pool } = require('../config/database');

// Отримання товарів з фільтрами
const getProducts = async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      sortBy = 'newest',
      page = 1,
      limit = 12 
    } = req.query;

    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    // Фільтр за категорією
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    // Фільтр за ціною
    if (minPrice) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }

    // Пошук за назвою або описом
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Сортування
    switch (sortBy) {
      case 'price_asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY price DESC';
        break;
      case 'name':
        query += ' ORDER BY name ASC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY created_at DESC';
    }

    // Пагінація
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const connection = await pool.getConnection();
    const [products] = await connection.query(query, params);

    // Отримання загальної кількості товарів
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const countParams = [];

    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    if (minPrice) {
      countQuery += ' AND price >= ?';
      countParams.push(minPrice);
    }
    if (maxPrice) {
      countQuery += ' AND price <= ?';
      countParams.push(maxPrice);
    }
    if (search) {
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const [countResult] = await connection.query(countQuery, countParams);
    const total = countResult[0].total;

    connection.release();

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Помилка отримання товарів:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Отримання одного товару
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    const [products] = await connection.query('SELECT * FROM products WHERE id = ?', [id]);
    
    connection.release();

    if (products.length === 0) {
      return res.status(404).json({ message: 'Товар не знайден' });
    }

    res.json(products[0]);
  } catch (error) {
    console.error('Помилка отримання товару:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Отримання категорій
const getCategories = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [categories] = await connection.query('SELECT DISTINCT category FROM products ORDER BY category');
    
    connection.release();

    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Помилка отримання категорій:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Отримання діапазону цін
const getPriceRange = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'SELECT MIN(price) as minPrice, MAX(price) as maxPrice FROM products'
    );
    
    connection.release();

    res.json(result[0]);
  } catch (error) {
    console.error('Помилка отримання діапазону цін:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

module.exports = { getProducts, getProduct, getCategories, getPriceRange };
