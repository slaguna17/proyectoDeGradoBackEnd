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
            const updatedProduct = await ProductService.updateProduct(req.params.id, req.body);
            res.status(200).json(updatedProduct)
        } catch (error) {
            console.error(error.message);
            res.status(404).send({ error: "Couldn't update, Product not found" })
        }
    },

    deleteProduct: async(req, res) => {
        try {
            await ProductService.deleteProduct(req.params.id);
            res.status(200).json({message: "Category deleted successfully"});
        } catch (error) {
            console.error(error.message);
            res.status(404).send({ error: "Couldn't delete, Product not found" })
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