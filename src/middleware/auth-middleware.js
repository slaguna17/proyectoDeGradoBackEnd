const jwt = require('jsonwebtoken');

const AuthMiddleware = {
  verifyToken: (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded; // Adjuntar el usuario decodificado al objeto de la solicitud
      next(); // Continuar al siguiente middleware/controlador
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ message: 'Invalid token' });
    }
  },
};

module.exports = AuthMiddleware;
