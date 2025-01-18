const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const cors = require('cors');

//Importar rutas
const userRoutes = require('./routes/user-routes');
const storeRoutes = require('./routes/store-routes');
const categoryRoutes = require('./routes/category-routes');
const productRoutes = require('./routes/product-routes');
//Configs
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json())

//Rutas
app.use('/api/users',userRoutes);
app.use('/api/stores',storeRoutes);
app.use('/api/categories',categoryRoutes);
app.use('/api/products',productRoutes);

module.exports = app;