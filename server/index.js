require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const addressRoutes = require('./routes/addresses');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: '✓ Сервер працює' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Помилка сервера:', err);
  res.status(500).json({ message: 'Помилка сервера', error: err.message });
});

// Запуск сервера
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 Сервер запущено на http://localhost:${PORT}`);
      console.log(`📦 Middleware: CORS, JSON Parser`);
      console.log(`🔐 API Routes: /api/auth, /api/products, /api/addresses\n`);
    });
  } catch (error) {
    console.error('Помилка запуску сервера:', error);
    process.exit(1);
  }
};

startServer();
