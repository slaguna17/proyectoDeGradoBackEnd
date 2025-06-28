const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const cors = require('cors');

//Importar rutas
const userRoutes = require('./routes/user-routes');
const storeRoutes = require('./routes/store-routes');
const categoryRoutes = require('./routes/category-routes');
const productRoutes = require('./routes/product-routes');
const inventoryRoutes = require('./routes/inventory-routes');
const providerRoutes = require('./routes/provider-routes');
const scheduleRoutes = require('./routes/schedule-routes');
const imageRoutes = require('./routes/image-routes');
const roleRoutes = require('./routes/role-routes');
const permitRoutes = require('./routes/permit-routes')
const cashboxRoutes = require('./routes/cashbox-routes')
const purchaseRoutes = require('./routes/purchase-routes')
const salesRoutes = require('./routes/sales-routes')

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
app.use('/api/inventory', inventoryRoutes)
app.use('/api/providers',providerRoutes);
app.use('/api/schedules',scheduleRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permits', permitRoutes);
app.use('/api/cashbox', cashboxRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/sales', salesRoutes);

module.exports = app;