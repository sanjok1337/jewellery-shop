const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Токен не знайден' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Невалідний токен', error: error.message });
  }
};

module.exports = { authMiddleware };
