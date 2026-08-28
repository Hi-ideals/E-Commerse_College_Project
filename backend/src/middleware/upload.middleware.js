const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const env = require("../config/env");
const ApiError = require("../utils/apiError");

const PRODUCTS_DIR = path.join(env.uploadDir, "products");
fs.mkdirSync(PRODUCTS_DIR, { recursive: true });

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PRODUCTS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = crypto.randomBytes(16).toString("hex");
    cb(null, `${Date.now()}-${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(ApiError.badRequest("Only JPEG, PNG, or WEBP images are allowed"));
  }
  cb(null, true);
}

const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
}).single("image");

module.exports = { uploadProductImage, PRODUCTS_DIR };
