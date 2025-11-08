const pool = require('../config/database');

// Отримати всі замовлення користувача
const getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const connection = await pool.getConnection();

    try {
      // Отримуємо замовлення користувача з деталями адрес
      const [orders] = await connection.execute(`
        SELECT 
          o.*,
          a.city,
          a.street,
          a.postal_code,
          a.phone,
          GROUP_CONCAT(
            CONCAT(p.name, ' x', oi.quantity, ' (', oi.price, ' грн)')
            SEPARATOR '; '
          ) as items
        FROM orders o
        LEFT JOIN addresses a ON o.address_id = a.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `, [userId]);

      connection.release();

      // Форматуємо дані для фронтенду
      const formattedOrders = orders.map(order => ({
        id: order.id,
        orderNumber: `#${order.id.toString().padStart(6, '0')}`,
        date: order.created_at,
        status: order.status,
        totalAmount: order.total_amount,
        items: order.items || 'Немає товарів',
        shippingAddress: order.city && order.street ? 
          `${order.city}, ${order.street}${order.postal_code ? ` (${order.postal_code})` : ''}` : 
          'Адреса не вказана',
        phone: order.phone,
        paymentMethod: order.payment_method
      }));

      res.json(formattedOrders);
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Помилка отримання замовлень' });
  }
};

// Отримати деталі конкретного замовлення
const getOrderDetails = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    const connection = await pool.getConnection();

    try {
      // Перевіряємо чи замовлення належить користувачу та отримуємо дані з адресою
      const [orders] = await connection.execute(`
        SELECT 
          o.*,
          a.city,
          a.street,
          a.postal_code,
          a.phone
        FROM orders o
        LEFT JOIN addresses a ON o.address_id = a.id
        WHERE o.id = ? AND o.user_id = ?
      `, [orderId, userId]);

      if (orders.length === 0) {
        connection.release();
        return res.status(404).json({ error: 'Замовлення не знайдено' });
      }

      const order = orders[0];

      // Отримуємо товари замовлення
      const [orderItems] = await connection.execute(`
        SELECT 
          oi.*,
          p.name as product_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [orderId]);

      connection.release();

      const orderDetails = {
        ...order,
        orderNumber: `#${order.id.toString().padStart(6, '0')}`,
        items: orderItems,
        shippingAddress: order.city && order.street ? 
          `${order.city}, ${order.street}${order.postal_code ? ` (${order.postal_code})` : ''}` : 
          'Адреса не вказана'
      };

      res.json(orderDetails);
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Помилка отримання деталей замовлення' });
  }
};

module.exports = {
  getUserOrders,
  getOrderDetails
};