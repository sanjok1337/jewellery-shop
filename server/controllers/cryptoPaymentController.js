const { pool } = require('../config/database');

// Simulated crypto wallet addresses for different cryptocurrencies
const WALLET_ADDRESSES = {
  bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ethereum: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  usdt: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' // USDT ERC-20
};

// Simulated exchange rates (in production, fetch from API like CoinGecko)
const getExchangeRates = async () => {
  // Simulated rates - in production use real API
  return {
    bitcoin: 0.000024,   // 1 USD = 0.000024 BTC (~$41,666 per BTC)
    ethereum: 0.00045,   // 1 USD = 0.00045 ETH (~$2,222 per ETH)
    usdt: 1.0            // 1 USD = 1 USDT (stablecoin)
  };
};

// Generate crypto payment details for an order
const generateCryptoPayment = async (req, res) => {
  const userId = req.user.id;
  const { order_id, crypto_type } = req.body;

  if (!order_id || !crypto_type) {
    return res.status(400).json({
      success: false,
      message: 'Order ID and crypto type are required'
    });
  }

  const validCryptoTypes = ['bitcoin', 'ethereum', 'usdt'];
  if (!validCryptoTypes.includes(crypto_type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid cryptocurrency type. Supported: bitcoin, ethereum, usdt'
    });
  }

  try {
    const connection = await pool.getConnection();

    try {
      // Get order details and verify ownership
      const [orders] = await connection.execute(
        'SELECT * FROM orders WHERE id = ? AND user_id = ?',
        [order_id, userId]
      );

      if (orders.length === 0) {
        connection.release();
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const order = orders[0];

      if (order.status !== 'pending') {
        connection.release();
        return res.status(400).json({
          success: false,
          message: 'Order is not pending payment'
        });
      }

      // Get exchange rates
      const rates = await getExchangeRates();
      const cryptoAmount = (order.total_amount * rates[crypto_type]).toFixed(8);

      // Generate a unique payment reference
      const paymentReference = `AURUM-${order_id}-${Date.now().toString(36).toUpperCase()}`;

      // Store crypto payment details in database
      await connection.execute(`
        INSERT INTO crypto_payments (
          order_id,
          user_id,
          crypto_type,
          crypto_amount,
          usd_amount,
          wallet_address,
          payment_reference,
          status,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        ON DUPLICATE KEY UPDATE
          crypto_type = VALUES(crypto_type),
          crypto_amount = VALUES(crypto_amount),
          wallet_address = VALUES(wallet_address),
          payment_reference = VALUES(payment_reference),
          status = 'pending',
          updated_at = NOW()
      `, [
        order_id,
        userId,
        crypto_type,
        cryptoAmount,
        order.total_amount,
        WALLET_ADDRESSES[crypto_type],
        paymentReference
      ]);

      connection.release();

      res.json({
        success: true,
        payment: {
          order_id: order_id,
          crypto_type: crypto_type,
          crypto_amount: cryptoAmount,
          usd_amount: order.total_amount,
          wallet_address: WALLET_ADDRESSES[crypto_type],
          payment_reference: paymentReference,
          expires_in: 30 * 60, // 30 minutes in seconds
          qr_data: `${crypto_type}:${WALLET_ADDRESSES[crypto_type]}?amount=${cryptoAmount}&label=${paymentReference}`
        }
      });

    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Generate crypto payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating crypto payment',
      error: error.message
    });
  }
};

// Verify crypto payment (simulated - in production integrate with blockchain API)
const verifyCryptoPayment = async (req, res) => {
  const userId = req.user.id;
  const { order_id, transaction_hash } = req.body;

  if (!order_id) {
    return res.status(400).json({
      success: false,
      message: 'Order ID is required'
    });
  }

  try {
    const connection = await pool.getConnection();

    try {
      // Get crypto payment details
      const [payments] = await connection.execute(
        'SELECT * FROM crypto_payments WHERE order_id = ? AND user_id = ?',
        [order_id, userId]
      );

      if (payments.length === 0) {
        connection.release();
        return res.status(404).json({
          success: false,
          message: 'Crypto payment not found for this order'
        });
      }

      const payment = payments[0];

      // In production: Verify transaction on blockchain
      // For now, simulate successful payment verification
      const isPaymentVerified = true; // Simulated verification

      if (isPaymentVerified) {
        await connection.beginTransaction();

        try {
          // Update crypto payment status
          await connection.execute(`
            UPDATE crypto_payments 
            SET status = 'completed', 
                transaction_hash = ?,
                confirmed_at = NOW(),
                updated_at = NOW()
            WHERE order_id = ? AND user_id = ?
          `, [transaction_hash || 'SIMULATED_TX_' + Date.now(), order_id, userId]);

          // Update order status to 'paid'
          await connection.execute(`
            UPDATE orders 
            SET status = 'paid',
                payment_confirmed_at = NOW()
            WHERE id = ? AND user_id = ?
          `, [order_id, userId]);

          await connection.commit();
          connection.release();

          res.json({
            success: true,
            message: 'Payment verified successfully',
            order: {
              id: order_id,
              status: 'paid',
              payment_method: payment.crypto_type
            }
          });

        } catch (error) {
          await connection.rollback();
          throw error;
        }
      } else {
        connection.release();
        res.status(400).json({
          success: false,
          message: 'Payment verification failed. Please try again or contact support.'
        });
      }

    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Verify crypto payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying crypto payment',
      error: error.message
    });
  }
};

// Get crypto payment status
const getCryptoPaymentStatus = async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.params;

  try {
    const connection = await pool.getConnection();

    try {
      const [payments] = await connection.execute(`
        SELECT cp.*, o.status as order_status, o.total_amount 
        FROM crypto_payments cp
        JOIN orders o ON cp.order_id = o.id
        WHERE cp.order_id = ? AND cp.user_id = ?
      `, [orderId, userId]);

      connection.release();

      if (payments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No crypto payment found for this order'
        });
      }

      const payment = payments[0];

      res.json({
        success: true,
        payment: {
          order_id: payment.order_id,
          crypto_type: payment.crypto_type,
          crypto_amount: payment.crypto_amount,
          usd_amount: payment.usd_amount,
          wallet_address: payment.wallet_address,
          payment_reference: payment.payment_reference,
          status: payment.status,
          order_status: payment.order_status,
          transaction_hash: payment.transaction_hash,
          created_at: payment.created_at,
          confirmed_at: payment.confirmed_at
        }
      });

    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Get crypto payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting payment status',
      error: error.message
    });
  }
};

// Simulate crypto payment (for testing purposes)
const simulateCryptoPayment = async (req, res) => {
  const userId = req.user.id;
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({
      success: false,
      message: 'Order ID is required'
    });
  }

  try {
    const connection = await pool.getConnection();

    try {
      // Verify order belongs to user and has pending crypto payment
      const [payments] = await connection.execute(
        'SELECT * FROM crypto_payments WHERE order_id = ? AND user_id = ? AND status = ?',
        [order_id, userId, 'pending']
      );

      if (payments.length === 0) {
        connection.release();
        return res.status(404).json({
          success: false,
          message: 'No pending crypto payment found for this order'
        });
      }

      await connection.beginTransaction();

      try {
        const simulatedTxHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

        // Update crypto payment status to completed
        await connection.execute(`
          UPDATE crypto_payments 
          SET status = 'completed', 
              transaction_hash = ?,
              confirmed_at = NOW(),
              updated_at = NOW()
          WHERE order_id = ? AND user_id = ?
        `, [simulatedTxHash, order_id, userId]);

        // Update order status to 'paid'
        await connection.execute(`
          UPDATE orders 
          SET status = 'paid',
              payment_confirmed_at = NOW()
          WHERE id = ? AND user_id = ?
        `, [order_id, userId]);

        await connection.commit();
        connection.release();

        res.json({
          success: true,
          message: 'Payment simulated successfully! Order status updated to paid.',
          order: {
            id: order_id,
            status: 'paid',
            transaction_hash: simulatedTxHash
          }
        });

      } catch (error) {
        await connection.rollback();
        throw error;
      }

    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Simulate crypto payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error simulating payment',
      error: error.message
    });
  }
};

module.exports = {
  generateCryptoPayment,
  verifyCryptoPayment,
  getCryptoPaymentStatus,
  simulateCryptoPayment
};
