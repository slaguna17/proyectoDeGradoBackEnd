const CategoryService = require('../services/category-service');
const { attachImageUrl, attachImageUrlMany, replaceImageKey } = require('../utils/image-helpers');

const CategoryController = {
  getAllCategories: async (req, res) => {
    try {
      const signed = String(req.query.signed).toLowerCase() === 'true';
      const categories = await CategoryService.getAllCategories();
      const out = await attachImageUrlMany(categories, 'image', { signed });
      res.status(200).json(out);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving categories' });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const signed = String(req.query.signed).toLowerCase() === 'true';
      const category = await CategoryService.getCategoryById(req.params.id);
      if (!category) return res.status(404).json({ error: 'Category not found' });
      const out = await attachImageUrl(category, 'image', { signed });
      res.status(200).json(out);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving category' });
    }
  },

  createCategory: async (req, res) => {
    const { name, description, image_key, image } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    try {
      const created = await CategoryService.createCategory({
        name,
        description,
        image: image_key ?? image ?? null, // save only the key
      });
      const out = await attachImageUrl(created, 'image', { signed: false });
      res.status(201).json({ message: 'Category created successfully', category: out });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating category' });
    }
  },

  updateCategory: async (req, res) => {
    const { name, description, image_key, image, removeImage = false } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    try {
      const id = req.params.id;
      const prev = await CategoryService.getCategoryById(id);
      if (!prev) return res.status(404).json({ error: 'Category not found' });

      let nextImage = prev.image ?? null;
      if (removeImage) {
        if (prev.image) await replaceImageKey(prev.image, null);
        nextImage = null;
      } else if (image_key != null || image != null) {
        nextImage = await replaceImageKey(prev.image, image_key ?? image);
      }

      const updated = await CategoryService.updateCategory(id, {
        name,
        description,
        image: nextImage,
        updated_at: new Date(),
      });

      if (!updated) return res.status(404).json({ error: 'Category not found' });

      const fresh = await CategoryService.getCategoryById(id);
      const out = await attachImageUrl(fresh, 'image', { signed: false });
      res.status(200).json({ message: 'Category updated successfully', category: out });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating category' });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const id = req.params.id;
      const prev = await CategoryService.getCategoryById(id).catch(() => null);
      const deleted = await CategoryService.deleteCategory(id);
      if (!deleted) return res.status(404).json({ error: 'Category not found' });

      if (prev?.image) {
        try { const { deleteObject } = require('../services/image-service'); await deleteObject(prev.image); } catch {}
      }
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error deleting category' });
    }
  }
};

module.exports = CategoryController;
