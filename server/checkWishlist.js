const { pool } = require('./config/database');

async function getWishlistForUser() {
  try {
    console.log('🔍 Шукаємо користувача Petya...');
    
    // Знаходимо користувача Petya
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE name LIKE ?', 
      ['%Petya%']
    );
    
    console.log('👤 Знайдені користувачі:', users);
    
    if (users.length === 0) {
      console.log('❌ Користувач Petya не знайдений');
      return;
    }
    
    const user = users[0];
    console.log(`✅ Знайдено користувача: ${user.name} (ID: ${user.id})`);
    
    // Отримуємо wishlist для цього користувача
    const [wishlistItems] = await pool.execute(`
      SELECT 
        w.id as wishlist_id,
        w.user_id,
        w.product_id,
        w.created_at as added_date,
        p.name as product_name,
        p.price,
        p.description,
        p.stock,
        u.name as user_name,
        u.email as user_email
      FROM wishlist w
      LEFT JOIN products p ON w.product_id = p.id
      LEFT JOIN users u ON w.user_id = u.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [user.id]);
    
    console.log('\n📋 Wishlist для користувача', user.name);
    console.log('=' .repeat(50));
    
    if (wishlistItems.length === 0) {
      console.log('💔 Wishlist порожній');
    } else {
      console.log(`❤️ Знайдено ${wishlistItems.length} товар(ів) в wishlist:`);
      
      wishlistItems.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.product_name || 'Невідомий товар'}`);
        console.log(`   💰 Ціна: ₴${item.price || 'N/A'}`);
        console.log(`   🆔 Product ID: ${item.product_id}`);
        console.log(`   � На складі: ${item.stock || 0}`);
        console.log(`   � Додано: ${item.added_date}`);
      });
    }
    
    // Додаткова статистика
    console.log('\n📊 Додаткова інформація:');
    console.log(`👤 Користувач: ${user.name} (${user.email})`);
    console.log(`🕐 Дата реєстрації: ${user.created_at}`);
    console.log(`📦 Кількість товарів у wishlist: ${wishlistItems.length}`);
    
  } catch (error) {
    console.error('❌ Помилка при отриманні даних:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

getWishlistForUser();