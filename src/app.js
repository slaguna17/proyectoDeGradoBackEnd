const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Route imports
const userRoutes = require("./routes/user-routes");
const storeRoutes = require("./routes/store-routes");
const categoryRoutes = require("./routes/category-routes");
const productRoutes = require("./routes/product-routes");
const inventoryRoutes = require("./routes/inventory-routes");
const providerRoutes = require("./routes/provider-routes");
const scheduleRoutes = require("./routes/schedule-routes");
const imageRoutes = require("./routes/image-routes");
const roleRoutes = require("./routes/role-routes");
const permitRoutes = require("./routes/permit-routes");
const cashboxRoutes = require("./routes/cashbox-routes");
const purchaseRoutes = require("./routes/purchase-routes");
const salesRoutes = require("./routes/sales-routes");
const menuRoutes = require("./routes/menu-routes");

// Configs
dotenv.config();
const app = express();

// CORS from .env
const origins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: ['http://localhost:5173', 'http://10.0.2.2:3000'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsers
app.use(express.json({ limit: process.env.JSON_LIMIT || "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permits", permitRoutes);
app.use("/api/cashbox", cashboxRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/sales", salesRoutes);
app.use('/api/menu', menuRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Manejador de errores (opcional, pero útil)
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
