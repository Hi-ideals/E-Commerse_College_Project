const { body, param } = require("express-validator");

const createValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
];

const idValidation = [param("id").isInt().withMessage("Invalid category id").toInt()];

module.exports = { createValidation, idValidation };
