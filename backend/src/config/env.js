// Loads and validates environment variables once, at process start.
require("dotenv").config();

function required(name, fallback) {
  const val = process.env[name] ?? fallback;
  if (val === undefined || val === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),

  databaseUrl: required("DATABASE_URL"),
  pgSsl: process.env.PGSSL === "true",

  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),

  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB || "5", 10),

  // Product prices are tax-inclusive — no separate tax line. A flat shipping
  // fee applies to every order regardless of order value.
  flatShippingFee: parseFloat(process.env.FLAT_SHIPPING_FEE || "40"),
};

module.exports = env;
