const { updateProduct } = require('../models/product-model');
const ProductService = require('../services/product-service');

const ProductController = {
    getProducts: async (req,res) => {
        try {
            const products = await ProductService.getProducts()
            res.status(200).json(products);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error, couldn't get Products")
        }
    },
    getProductById: async (req, res) => {
      try {
        const product = await ProductService.getProductById(req.params.id);
        res.status(200).json(product); // Devuelve la respuesta
      } catch (error) {
        console.error(error.message);
        res.status(404).send("Product not found")
      }
    },

    createProduct: async(req,res) => {
        try {
            const newProduct = await ProductService.createProduct(req.body);
            res.status(201).json(newProduct)
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error, couldn't create Product")
        }
    },

    updateProduct: async(req,res) => {
        try {
            const id = req.params.id;
            const updateBody = req.body;

            const updatedProduct = await ProductService.updateProduct(id, updateBody)
            res.status(201).json(updateProduct)
        } catch (error) {
            console.error(error.message);
            res.status(404).send("Couldn't update, Product not found")
        }
    },

    deleteProduct: async(req, res) => {
        try {
            const id = req.params.id
            const deleteProduct = await ProductService.deleteProduct(id)
            res.status(200).json(deleteProduct)
        } catch (error) {
            console.error(error.message);
            res.status(404).send("Couldn't delete, Product not found")
        }
    },

    getProductsByCategory: async(req, res) => {
        try {
            const category_id = req.params.category_id
            const products = await ProductService.getProductsByCategory(category_id)
            res.status(200).json(products);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server error, couldn't get Products")
        }
    }
  };

module.exports = ProductController;