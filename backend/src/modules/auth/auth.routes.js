const express = require("express");
const rateLimit = require("express-rate-limit");
const validate = require("../../middleware/validate.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const { registerValidation, loginValidation } = require("./auth.validation");
const controller = require("./auth.controller");

const router = express.Router();

// Blunt brute-force / credential-stuffing attempts on auth endpoints.
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many attempts. Try again shortly." } },
});

router.post("/register", authLimiter, registerValidation, validate, controller.register);
router.post("/login", authLimiter, loginValidation, validate, controller.login);
router.post("/refresh", authLimiter, controller.refresh);
router.post("/logout", controller.logout);
router.get("/me", authenticate, controller.me);

module.exports = router;
