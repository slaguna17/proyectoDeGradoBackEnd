const UserService = require('../services/user-service');
const { buildMenu } = require('../utils/menu-builder');

const MenuController = {
  // GET /api/menu
  getMenu: async (req, res) => {
    try {
      const userId = req.user.userId || req.user.id;
      const roles = await UserService.getRolesByUserId(userId);
      const isAdmin = roles.some(r => r.isAdmin === true) || !!req.user.isAdmin;
      const permits = await UserService.getPermitsByUserId(userId);

      const menu = buildMenu({ isAdmin, permits });
      return res.status(200).json({ isAdmin, permits, menu });
    } catch (error) {
      console.error('getMenu error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = MenuController;
