const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const cors = require('cors');

//Importar rutas
const userRoutes = require('./routes/user-routes');

//Configs
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json())

//Rutas
app.use('/api/users',userRoutes);

module.exports = app;