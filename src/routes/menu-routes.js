const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth-middleware');
const MenuController = require('../controllers/menu-controller');

// GET /api/menu
router.get('/', verifyToken, MenuController.getMenu);

module.exports = router;
