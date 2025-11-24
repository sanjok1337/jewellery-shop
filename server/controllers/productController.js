const { pool } = require('../config/database');

// Отримання товарів з фільтрами
const getProducts = async (req, res) => {
  try {
    console.log('🔍 getProducts called with query:', req.query);
    
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
    let query = `SELECT 
      p.*,
      c.name as category_name,
      pi.image_url,
      pi.is_main,
      CASE 
        WHEN p.stock > 0 THEN 'В наявності'
        ELSE 'Немає в наявності'
      END as stock_status
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
    WHERE 1=1`;
    const params = [];

    // Фільтр за категорією
    if (category) {
      query += ' AND c.name = ?';
      params.push(category);
    }

    // Фільтр за ціною
    if (minPrice) {
      query += ' AND p.price >= ?';
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(maxPrice);
    }

    // Пошук за назвою або описом
    if (search) {
      // Розділяємо пошуковий запит на окремі слова
      const searchWords = search.trim().split(/\s+/).filter(word => word.length > 0);
      
      if (searchWords.length > 0) {
        // Використовуємо FULLTEXT пошук для кращої релевантності
        const fullTextSearch = searchWords.map(word => `+${word}*`).join(' ');
        query += ` AND (
          MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE)
          OR ${searchWords.map(() => 'p.name LIKE ?').join(' OR ')}
          OR ${searchWords.map(() => 'p.description LIKE ?').join(' OR ')}
        )`;
        
        params.push(fullTextSearch);
        // Додаємо LIKE пошук для кожного слова як запасний варіант
        searchWords.forEach(word => {
          params.push(`%${word}%`);
        });
        searchWords.forEach(word => {
          params.push(`%${word}%`);
        });
      }
    }

    // Сортування
    switch (sortBy) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'name':
        query += ' ORDER BY p.name ASC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY p.created_at DESC';
    }

    // Пагінація
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const connection = await pool.getConnection();
    const [products] = await connection.query(query, params);

    // Отримання загальної кількості товарів
    let countQuery = 'SELECT COUNT(DISTINCT p.id) as total FROM products p WHERE 1=1';
    const countParams = [];

    if (category) {
      countQuery += ' AND p.category_id IN (SELECT id FROM categories WHERE name = ?)';
      countParams.push(category);
    }
    if (minPrice) {
      countQuery += ' AND p.price >= ?';
      countParams.push(minPrice);
    }
    if (maxPrice) {
      countQuery += ' AND p.price <= ?';
      countParams.push(maxPrice);
    }
    if (search) {
      // Розділяємо пошуковий запит на окремі слова для підрахунку
      const searchWords = search.trim().split(/\s+/).filter(word => word.length > 0);
      
      if (searchWords.length > 0) {
        const fullTextSearch = searchWords.map(word => `+${word}*`).join(' ');
        countQuery += ` AND (
          MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE)
          OR ${searchWords.map(() => 'p.name LIKE ?').join(' OR ')}
          OR ${searchWords.map(() => 'p.description LIKE ?').join(' OR ')}
        )`;
        
        countParams.push(fullTextSearch);
        searchWords.forEach(word => {
          countParams.push(`%${word}%`);
        });
        searchWords.forEach(word => {
          countParams.push(`%${word}%`);
        });
      }
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
    console.error('❌ Помилка отримання товарів:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Отримання одного товару
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 getProduct called for ID:', id);

    const connection = await pool.getConnection();
    
    // Отримуємо товар з категорією
    console.log('📝 Executing product query for ID:', id);
    const [products] = await connection.query(`
      SELECT 
        p.*,
        c.name as category,
        p.stock as stock_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    console.log('📦 Product query result:', products.length);
    
    if (products.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Товар не знайден' });
    }

    // Отримуємо зображення товару
    const [images] = await connection.query(
      'SELECT image_url, is_main FROM product_images WHERE product_id = ? ORDER BY is_main DESC',
      [id]
    );

    connection.release();

    const product = products[0];
    product.images = images;
    product.image_url = images.find(img => img.is_main)?.image_url || images[0]?.image_url;

    console.log('✅ Sending product:', product.name);
    res.json({ product });
  } catch (error) {
    console.error('Помилка отримання товару:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Отримання категорій
const getCategories = async (req, res) => {
  try {
    console.log('📋 getCategories called');
    const connection = await pool.getConnection();
    const [categories] = await connection.query(`
      SELECT c.id, c.name, c.slug, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON c.id = p.category_id 
      GROUP BY c.id, c.name, c.slug 
      ORDER BY c.name
    `);
    
    connection.release();
    console.log('✅ Categories found:', categories.length);

    res.json(categories);
  } catch (error) {
    console.error('❌ Помилка отримання категорій:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Отримання діапазону цін
const getPriceRange = async (req, res) => {
  try {
    console.log('💰 getPriceRange called');
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'SELECT MIN(price) as minPrice, MAX(price) as maxPrice FROM products'
    );
    
    connection.release();
    console.log('✅ Price range:', result[0]);

    res.json(result[0]);
  } catch (error) {
    console.error('❌ Помилка отримання діапазону цін:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

// Пошукові підказки (autocomplete)
const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }

    console.log('🔍 Getting search suggestions for:', query);
    
    const connection = await pool.getConnection();
    
    // Шукаємо товари, які відповідають запиту
    const searchWords = query.trim().split(/\s+/).filter(word => word.length > 0);
    const fullTextSearch = searchWords.map(word => `+${word}*`).join(' ');
    
    const [suggestions] = await connection.query(`
      SELECT DISTINCT p.name, p.id, pi.image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = 1
      WHERE MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE)
         OR p.name LIKE ?
      ORDER BY p.name ASC
      LIMIT 8
    `, [fullTextSearch, `%${query}%`]);
    
    connection.release();
    
    console.log('✅ Found suggestions:', suggestions.length);
    res.json(suggestions);
  } catch (error) {
    console.error('❌ Помилка отримання підказок:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

module.exports = { getProducts, getProduct, getCategories, getPriceRange, getSearchSuggestions };
