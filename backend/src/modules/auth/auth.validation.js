const { body } = require("express-validator");

const registerValidation = [
  body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Name must be 2-120 characters"),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("username")
    .trim()
    .isLength({ min: 3, max: 60 })
    .withMessage("Username must be 3-60 characters")
    .matches(/^[a-zA-Z0-9_.]+$/)
    .withMessage("Username may only contain letters, numbers, underscores and dots"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain a letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number"),
];

const loginValidation = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = { registerValidation, loginValidation };
