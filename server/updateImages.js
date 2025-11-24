const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jewellery_shop',
  });

  try {
    console.log('🔄 Оновлення зображень продуктів...');

    // Очищаємо старі зображення
    await connection.query('DELETE FROM product_images');
    console.log('✓ Старі зображення видалено');

    // Додаємо нові зображення
    const images = [
      // Product 1 - Gold Diamond Earrings
      [1, '/images/products/gold-earrings-with-diamonds-isolated-transparent-background_191095-13254.avif', true],
      [1, '/images/products/gold-earrings-with-diamonds-isolated-transparent-background_191095-13254.avif', false],
      
      // Product 2 - Silver Bracelet
      [2, '/images/products/braclet.svg', true],
      [2, '/images/products/braclet.svg', false],
      
      // Product 3 - Diamond Wedding Ring
      [3, '/images/products/png-transparent-wedding-ring-carat-diamond-gold-jewelry-love-gemstone-ring-thumbnail.png', true],
      [3, '/images/products/png-transparent-wedding-ring-carat-diamond-gold-jewelry-love-gemstone-ring-thumbnail.png', false],
      
      // Product 4 - Emerald Necklace
      [4, '/images/products/pngtree-green-emerald-necklace-png-image_16563776.png', true],
      [4, '/images/products/pngtree-green-emerald-necklace-png-image_16563776.png', false],
      
      // Product 5 - Sapphire Ring
      [5, '/images/products/saphire ring.jpg', true],
      [5, '/images/products/saphire ring.jpg', false],
      
      // Product 6 - Platinum Watch
      [6, '/images/products/png-clipart-watch-strap-metal-titan-company-platinum-watch-watch-accessory-fashion.png', true],
      [6, '/images/products/png-clipart-watch-strap-metal-titan-company-platinum-watch-watch-accessory-fashion.png', false],
      
      // Product 7
      [7, '/images/products/gold-earrings-with-diamonds-isolated-transparent-background_191095-13254.avif', true],
      [7, '/images/products/gold-earrings-with-diamonds-isolated-transparent-background_191095-13254.avif', false],
      
      // Product 8
      [8, '/images/products/png-transparent-wedding-ring-carat-diamond-gold-jewelry-love-gemstone-ring-thumbnail.png', true],
      [8, '/images/products/png-transparent-wedding-ring-carat-diamond-gold-jewelry-love-gemstone-ring-thumbnail.png', false],
    ];

    for (const [product_id, image_url, is_main] of images) {
      await connection.query(
        'INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)',
        [product_id, image_url, is_main]
      );
    }

    console.log('✓ Нові зображення додано');
    console.log('✅ Оновлення завершено успішно!');

  } catch (error) {
    console.error('❌ Помилка при оновленні:', error);
  } finally {
    await connection.end();
  }
}

updateImages();
