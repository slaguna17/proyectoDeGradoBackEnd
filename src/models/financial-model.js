const db = require('../config/db');

const FinancialModel = {
  /**
   * Obtiene todos los movimientos (ingresos y egresos) de una tienda,
   * ordenados por fecha de creación descendente.
   * @param {number} storeId - El ID de la tienda.
   * @returns {Promise<Array>} - Una lista de movimientos.
   */
  getAllMovementsByStore: async (storeId) => {
    return db('cash_movement')
      .where({ store_id: storeId })
      .orderBy('created_at', 'desc');
  },

  /**
   * Obtiene solo los movimientos de ingreso ('IN') de una tienda.
   * @param {number} storeId - El ID de la tienda.
   * @returns {Promise<Array>} - Una lista de ingresos.
   */
  getIncomeByStore: async (storeId) => {
    return db('cash_movement')
      .where({ store_id: storeId, direction: 'IN' })
      .orderBy('created_at', 'desc');
  },

  /**
   * Obtiene solo los movimientos de egreso ('OUT') de una tienda.
   * @param {number} storeId - El ID de la tienda.
   * @returns {Promise<Array>} - Una lista de egresos.
   */
  getExpensesByStore: async (storeId) => {
    return db('cash_movement')
      .where({ store_id: storeId, direction: 'OUT' })
      .orderBy('created_at', 'desc');
  }
};

module.exports = FinancialModel;