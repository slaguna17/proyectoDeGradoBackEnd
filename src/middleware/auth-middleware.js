const jwt = require("jsonwebtoken");

const getAuthToken = (req) => {
  const h = req.headers.authorization || "";
  // Admits "Bearer xxx" or "bearer xxx"
  if (/^bearer\s+/i.test(h)) return h.split(" ")[1];
  return null;
};

const AuthMiddleware = {
  verifyToken: (req, res, next) => {
    const token = getAuthToken(req);
    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    try {
      const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_KEY;
      if (!JWT_SECRET) {
        return res.status(500).json({ message: "JWT secret not configured" });
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      res.status(401).json({ message: "Invalid token" });
    }
  },
};

module.exports = AuthMiddleware;
