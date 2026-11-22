const ProductService = require('../services/product-service');
const { attachImageUrl, attachImageUrlMany, replaceImageKey } = require('../utils/image-helpers');

function parseOptionalStoreId(query) {
  const rawStoreId = query.storeId ?? query.store_id;
  if (rawStoreId == null) return { storeId: undefined };

  if (typeof rawStoreId === 'boolean' || String(rawStoreId).trim() === '') {
    return { error: 'storeId must be a positive integer' };
  }

  const storeId = Number(rawStoreId);
  if (!Number.isInteger(storeId) || storeId <= 0) {
    return { error: 'storeId must be a positive integer' };
  }

  return { storeId };
}

function parseOptionalMinStock(body) {
  const hasMinStock =
    Object.prototype.hasOwnProperty.call(body, 'min_stock') ||
    Object.prototype.hasOwnProperty.call(body, 'minStock');

  if (!hasMinStock) return { hasMinStock: false };

  const rawMinStock = body.min_stock ?? body.minStock;
  if (typeof rawMinStock === 'boolean' || String(rawMinStock).trim() === '') {
    return { error: 'min_stock must be an integer greater than or equal to 0' };
  }

  const minStock = Number(rawMinStock);
  if (!Number.isInteger(minStock) || minStock < 0) {
    return { error: 'min_stock must be an integer greater than or equal to 0' };
  }

  return { hasMinStock: true, minStock };
}

const ProductController = {
  getAllProducts: async (req, res) => {
    try {
      const signed = req.query.signed !== 'false';
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
      const signed = req.query.signed !== 'false';
      const product = await ProductService.getProductById(req.params.id);
      const out = await attachImageUrl(product, 'image', { signed });
      res.status(200).json(out);
    } catch (error) {
      console.error(error.message);
      res.status(404).send("Product not found");
    }
  },

  getLowStockProducts: async (req, res) => {
    const { storeId, error } = parseOptionalStoreId(req.query);
    if (error) return res.status(400).json({ error });

    try {
      const products = await ProductService.getLowStockProducts(storeId);
      res.status(200).json({ count: products.length, products });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving low stock products' });
    }
  },

  getStockAlertsSummary: async (req, res) => {
    const { storeId, error } = parseOptionalStoreId(req.query);
    if (error) return res.status(400).json({ error });

    try {
      const summary = await ProductService.getStockAlertsSummary(storeId);
      res.status(200).json(summary);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving stock alerts summary' });
    }
  },

  createProduct: async (req, res) => {
    try {
      const body = req.body || {};
      const {
        SKU,
        name,
        description,
        image_key,
        image,
        brand,
        category_id,
        store_id,
        stock,
        expiration_date,
        sale_price,
        purchase_price,
        providerIds = []
      } = body;

      const minStockResult = parseOptionalMinStock(body);
      if (minStockResult.error) {
        return res.status(400).json({ error: minStockResult.error });
      }

      if (!SKU || !name || !category_id || !store_id || stock == null || sale_price == null || purchase_price == null) {
        return res.status(400).json({
          error: 'SKU, name, category_id, store_id, stock, sale_price and purchase_price are required'
        });
      }

      const productData = {
        SKU,
        name,
        description,
        brand,
        category_id,
        image: image_key ?? image ?? null,
        sale_price,
        purchase_price
      };

      if (minStockResult.hasMinStock) {
        productData.min_stock = minStockResult.minStock;
      }

      const storeData = {
        store_id,
        stock,
        expiration_date
      };

      const created = await ProductService.createProduct(productData, storeData);

      if (Array.isArray(providerIds) && providerIds.length > 0) {
        await ProductService.assignRelations(created.id, [], providerIds);
      }

      const fresh = await ProductService.getProductById(created.id);
      const out = await attachImageUrl(fresh, 'image', { signed: true });

      res.status(201).json(out);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Error creating product' });
    }
  },

  updateProduct: async (req, res) => {
    const { id } = req.params;
    try {
      const body = req.body || {};
      const { SKU, name, description, image_key, image, brand, category_id, removeImage = false, sale_price, purchase_price } = body;
      const minStockResult = parseOptionalMinStock(body);
      if (minStockResult.error) {
        return res.status(400).json({ error: minStockResult.error });
      }

      if (!SKU || !name || !category_id || sale_price == null || purchase_price == null) {
        return res.status(400).json({ error: 'SKU, name, sale_price y purchase_price and category_id are required' });
      }

      const prev = await ProductService.getProductById(id);
      let nextImage = prev?.image ?? null;
      if (removeImage) {
        if (prev?.image) await replaceImageKey(prev.image, null);
        nextImage = null;
      } else if (image_key != null || image != null) {
        nextImage = await replaceImageKey(prev?.image, image_key ?? image);
      }
      const productData = {
        SKU, name, description, brand, category_id, image: nextImage, sale_price, purchase_price
      };

      if (minStockResult.hasMinStock) {
        productData.min_stock = minStockResult.minStock;
      }

      const updated = await ProductService.updateProduct(id, productData);
      if (updated) {
        const fresh = await ProductService.getProductById(id);
        const out = await attachImageUrl(fresh, 'image', { signed: true });
        res.status(204).send();
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
      const signed = req.query.signed !== 'false';
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
      const signed = req.query.signed !== 'false';
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
      const signed = req.query.signed !== 'false';
      const products = await ProductService.getProductsByCategoryAndStore(req.params.categoryId, req.params.storeId);
      const out = await attachImageUrlMany(products, 'image', { signed });
      res.json(out);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching products' });
    }
  },

  assignRelations: async (req, res) => {
    const { id } = req.params;
    try {
      const body = req.body || {};
      const storeEntries = Array.isArray(body.storeEntries)
        ? body.storeEntries
        : Array.isArray(body.storeIds)
          ? body.storeIds
          : [];

      const providerIds = Array.isArray(body.providerIds)
        ? body.providerIds
        : [];

      if (storeEntries.length === 0 && providerIds.length === 0) {
        return res.status(400).json({
          error: 'At least one of storeEntries or providerIds is required'
        });
      }

      await ProductService.assignRelations(id, storeEntries, providerIds);
      res.status(200).json({ message: 'Relations assigned successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error assigning relations' });
    }
  },

  upsertStoreProduct: async (req, res) => {
    try {
      const { storeId, productId, stock } = req.body;

      const hasExpirationDate =
        Object.prototype.hasOwnProperty.call(req.body, 'expiration_date') ||
        Object.prototype.hasOwnProperty.call(req.body, 'expirationDate');

      const expiration_date = req.body.expiration_date ?? req.body.expirationDate ?? null;

      if (storeId == null || productId == null || stock == null || isNaN(Number(stock))) {
        return res.status(400).json({
          message: 'storeId, productId and stock are required'
        });
      }

      const result = await ProductService.upsertStoreProduct({
        storeId: Number(storeId),
        productId: Number(productId),
        stock: Number(stock),
        expiration_date,
        hasExpirationDate
      });

      return res.status(200).json({
        message: 'Store product upserted successfully',
        data: result
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: `Server error: ${error.message}` });
    }
  },

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
