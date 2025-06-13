const ProductModel = require('../models/product-model');

const ProductService = {
  getAllProductsWithRelations: async () => await ProductModel.getAllProductsWithRelations(),

  getProductById: async (id) => {
    if (!id) throw new Error('Product ID is required');
    const product = await ProductModel.getProductById(id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  createProduct: async (productData, storeData) => await ProductModel.createProduct(productData, storeData),

  updateProduct: async (id, data) => await ProductModel.updateProduct(id, data),

  deleteProduct: async (id) => await ProductModel.deleteProduct(id),

  getProductsByCategory: async (category_id) => {
    if (!category_id) throw new Error('Wrong category ID');
    return await ProductModel.getProductsByCategory(category_id);
  },

  getProductsByStore: async (storeId) => {
    const products = await ProductModel.getProductsByStore(storeId);
    if (!products || products.length === 0) throw new Error('No hay productos para esta tienda.');
    return products;
  },

  getProductsByCategoryAndStore: async (categoryId, storeId) => {
    const products = await ProductModel.getProductsByCategoryAndStore(categoryId, storeId);
    if (!products || products.length === 0) throw new Error('No hay productos para esta tienda y/o categoria.');
    return products;
  },

  assignRelations: async (productId, storeIds, providerIds) => await ProductModel.assignRelations(productId, storeIds, providerIds)
};

module.exports = ProductService;
