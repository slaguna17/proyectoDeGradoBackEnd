const ProductService = require('../services/product-service');
const { attachImageUrl, attachImageUrlMany, replaceImageKey } = require('../utils/image-helpers');

const ProductController = {
  // --- TUS FUNCIONES ORIGINALES ---
  getAllProducts: async (req, res) => {
    try {
      const signed = String(req.query.signed).toLowerCase() === 'true';
      const products = await ProductService.getAllProductsWithRelations();
      const out = await attachImageUrlMany(products, 'image', { signed });
      res.status(200).json(out);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving products with relations' });
    }
  },
  getProductById: async (req, res) => {
    try {
      const signed = String(req.query.signed).toLowerCase() === 'true';
      const product = await ProductService.getProductById(req.params.id);
      const out = await attachImageUrl(product, 'image', { signed });
      res.status(200).json(out);
    } catch (error) {
      console.error(error.message);
      res.status(404).send("Product not found");
    }
  },
  createProduct: async (req, res) => {
    const { SKU, name, description, image_key, image, brand, category_id, store_id, stock, expiration_date } = req.body;
    if (!SKU || !name || !category_id || !store_id || stock == null) {
      return res.status(400).json({ error: 'SKU, name, category_id, store_id and stock are required' });
    }
    try {
      const productData = { SKU, name, description, brand, category_id, image: image_key ?? image ?? null };
      const storeData = { store_id, stock, expiration_date };
      const created = await ProductService.createProduct(productData, storeData);
      const out = await attachImageUrl(created, 'image', { signed: false });
      res.status(201).json({ message: 'Product created successfully', product: out });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Error creating product' });
    }
  },
  updateProduct: async (req, res) => {
    const { id } = req.params;
    const { SKU, name, description, image_key, image, brand, category_id, removeImage = false } = req.body;
    if (!SKU || !name || !category_id) {
      return res.status(400).json({ error: 'SKU, name and category_id are required' });
    }
    try {
      const prev = await ProductService.getProductById(id);
      let nextImage = prev?.image ?? null;
      if (removeImage) {
        if (prev?.image) await replaceImageKey(prev.image, null);
        nextImage = null;
      } else if (image_key != null || image != null) {
        nextImage = await replaceImageKey(prev?.image, image_key ?? image);
      }
      const updated = await ProductService.updateProduct(id, {
        SKU, name, description, brand, category_id, image: nextImage
      });
      if (updated) {
        const fresh = await ProductService.getProductById(id);
        const out = await attachImageUrl(fresh, 'image', { signed: false });
        res.status(200).json({ message: 'Product updated successfully', product: out });
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
      const prev = await ProductService.getProductById(id).catch(() => null);
      const result = await ProductService.deleteProduct(id);
      if (result === 'in_use') {
        return res.status(400).json({ error: 'Cannot delete product: it is linked to sales or purchases' });
      }
      if (result) {
        if (prev?.image) {
          try { const { deleteObject } = require('../services/image-service'); await deleteObject(prev.image); } catch (_) {}
        }
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
      const signed = String(req.query.signed).toLowerCase() === 'true';
      const products = await ProductService.getProductsByCategory(req.params.category_id);
      const out = await attachImageUrlMany(products, 'image', { signed });
      res.status(200).json(out);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error, couldn't get Products");
    }
  },
  getProductsByStore: async (req, res) => {
    try {
      const signed = String(req.query.signed).toLowerCase() === 'true';
      const products = await ProductService.getProductsByStore(req.params.storeId);
      const out = await attachImageUrlMany(products, 'image', { signed });
      res.status(200).json(out);
    } catch (error) {
      console.error(error.message);
      res.status(404).json({ message: error.message });
    }
  },
  getProductsByCategoryAndStore: async (req, res) => {
    try {
      const signed = String(req.query.signed).toLowerCase() === 'true';
      const products = await ProductService.getProductsByCategoryAndStore(req.params.categoryId, req.params.storeId);
      const out = await attachImageUrlMany(products, 'image', { signed });
      res.json(out);
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
  },

  // --- NUEVA FUNCIÓN AÑADIDA ---
  upsertStoreProduct: async (req, res) => {
    try {
      const { storeId, productId, stock, expirationDate } = req.body;
      if (storeId == null || productId == null || stock == null) {
        return res.status(400).json({ message: 'storeId, productId and stock are required' });
      }
      await ProductService.upsertStoreProduct({ storeId, productId, stock, expirationDate });
      return res.status(200).json({ message: 'OK' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: `Server error: ${error.message}` });
    }
  },

  // --- NUEVA FUNCIÓN AÑADIDA ---
  removeStoreProduct: async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      const productId = parseInt(req.params.productId, 10);
      await ProductService.removeStoreProduct({ storeId, productId });
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: `Server error: ${error.message}` });
    }
  }
};

module.exports = ProductController;