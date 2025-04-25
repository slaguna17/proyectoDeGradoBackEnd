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

    createProduct: async (productData, storeData) => {
      if ( !productData.name || !productData.category_id) {
        throw new Error('Nombre y categoría son obligatorios.');
      }

      if (!storeData.store_id || storeData.stock === undefined) {
        throw new Error('Tienda y stock son obligatorios.');
      }
      return await ProductModel.createProduct(productData, storeData);
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
    },

    getProductsByStore: async (storeId) => {
      const products = await ProductModel.getProductsByStore(storeId);
      if (!products || products.length === 0) {
          throw new Error('No hay productos para esta tienda.');
      }
      return products;
    },

    getProductsByCategoryAndStore: async (categoryId, storeId) => {
      const products = await ProductModel.getProductsByCategoryAndStore(categoryId, storeId);
      if (!products || products.length === 0) {
        throw new Error('No hay productos para esta tienda y/o categoria.');
    }
      return products;
    }

  };

module.exports = ProductService;