const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const logger = require("./utils/logger");
const requestId = require("./middleware/requestId.middleware");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const categoryRoutes = require("./modules/categories/category.routes");
const productRoutes = require("./modules/products/product.routes");
const cartRoutes = require("./modules/cart/cart.routes");
const orderRoutes = require("./modules/orders/order.routes");
const invoiceRoutes = require("./modules/invoices/invoice.routes");

const app = express();

// ---- Global middleware ----
app.set("trust proxy", 1); // accurate req.ip behind a reverse proxy/load balancer
app.use(requestId);
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Blanket ceiling so no single client can flood the API; auth routes layer
// a much stricter limiter on top of this (see auth.routes.js).
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Slow down." } },
  })
);

morgan.token("id", (req) => req.id);

if (env.nodeEnv !== "test") {
  app.use(
    morgan(env.nodeEnv === "production" ? "combined" : ":id :method :url :status :response-time ms", {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// ---- Static file serving for uploaded images/invoices ----
app.use("/uploads", express.static(env.uploadDir));

// ---- Health check ----
app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

// ---- Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/invoices", invoiceRoutes);

// ---- 404 + centralized error handler (must be last) ----
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
