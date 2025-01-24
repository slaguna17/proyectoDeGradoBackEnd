const ProductModel = require('../models/product-model');

const ProductService = {
    getProducts: async () => {
        const products = await ProductModel.getProducts();
        return products;
    },

    getProductById: async (id) => {
      if (!id) {
        throw new Error('Product ID is required');
      }
      const product = await ProductModel.getProductById(id);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    },

    createProduct: async (productData) => {
        return ProductModel.createProduct(productData)
    },

    updateProduct: async (id, updateBody) => {
        const product = await ProductModel.updateProduct(id, updateBody)
        if(!product){
            throw new Error("Product not found")
        }
        return product; 
    },

    deleteProduct: async (id) => {
        if (!id) {
            throw new Error('Product ID is required');
        }
        const deletedCount = await ProductModel.deleteProduct(id);
        if (deletedCount === 0) {
            throw new Error('Product not found');
        }
        return { message: "Product deleted successfully" };
    },

    getProductsByCategory: async (category_id) => {
      if(!category_id){
        throw new Error("Wrong category ID");
      }
      const products = await ProductModel.getProductsByCategory(category_id);
      if(!products){
        throw new Error("Products not found")
      }
      return products
    }

  };

module.exports = ProductService;