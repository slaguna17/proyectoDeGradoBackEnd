const ProductService = require('../services/product-service');

const ProductController = {
  getAllProducts: async (req, res) => {
    try {
      const products = await ProductService.getAllProductsWithRelations();
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving products with relations' });
    }
  },

  getProductById: async (req, res) => {
    try {
      const product = await ProductService.getProductById(req.params.id);
      res.status(200).json(product);
    } catch (error) {
      console.error(error.message);
      res.status(404).send("Product not found");
    }
  },

  createProduct: async (req, res) => {
    const { SKU, name, description, image, brand, category_id, store_id, stock, expiration_date } = req.body;

    if (!SKU || !name || !category_id || !store_id || stock == null) {
      return res.status(400).json({ error: 'SKU, name, category_id, store_id and stock are required' });
    }

    try {
      const product = await ProductService.createProduct(
        { SKU, name, description, image, brand, category_id },
        { store_id, stock, expiration_date }
      );
      res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Error creating product' });
    }
  },

  updateProduct: async (req, res) => {
    const { id } = req.params;
    const { SKU, name, description, image, brand, category_id } = req.body;

    if (!SKU || !name || !category_id) {
      return res.status(400).json({ error: 'SKU, name and category_id are required' });
    }

    try {
      const updated = await ProductService.updateProduct(id, {
        SKU, name, description, image, brand, category_id
      });

      if (updated) {
        res.status(200).json({ message: 'Product updated successfully' });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating product' });
    }
  },

  deleteProduct: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await ProductService.deleteProduct(id);

      if (result === 'in_use') {
        return res.status(400).json({ error: 'Cannot delete product: it is linked to sales or purchases' });
      }

      if (result) {
        res.status(200).json({ message: 'Product deleted successfully' });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error deleting product' });
    }
  },

  getProductsByCategory: async (req, res) => {
    try {
      const products = await ProductService.getProductsByCategory(req.params.category_id);
      res.status(200).json(products);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error, couldn't get Products");
    }
  },

  getProductsByStore: async (req, res) => {
    try {
      const products = await ProductService.getProductsByStore(req.params.storeId);
      res.status(200).json(products);
    } catch (error) {
      console.error(error.message);
      res.status(404).json({ message: error.message });
    }
  },

  getProductsByCategoryAndStore: async (req, res) => {
    try {
      const products = await ProductService.getProductsByCategoryAndStore(req.params.categoryId, req.params.storeId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching products' });
    }
  },

  assignRelations: async (req, res) => {
    const { id } = req.params;
    const { storeIds, providerIds } = req.body;

    if ((!storeIds || storeIds.length === 0) && (!providerIds || providerIds.length === 0)) {
      return res.status(400).json({ error: 'At least one of storeIds or providerIds is required' });
    }

    try {
      await ProductService.assignRelations(id, storeIds, providerIds);
      res.status(200).json({ message: 'Relations assigned successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error assigning relations' });
    }
  }
};

module.exports = ProductController;