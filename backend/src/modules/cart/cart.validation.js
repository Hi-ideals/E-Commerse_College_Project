const { body, param } = require("express-validator");

const addValidation = [
  body("productId").isUUID().withMessage("productId must be a valid UUID"),
  body("quantity").isInt({ min: 1 }).withMessage("quantity must be a positive integer").toInt(),
];

const updateValidation = [
  param("id").isUUID().withMessage("Invalid cart item id"),
  body("quantity").isInt({ min: 1 }).withMessage("quantity must be a positive integer").toInt(),
];

const idValidation = [param("id").isUUID().withMessage("Invalid cart item id")];

module.exports = { addValidation, updateValidation, idValidation };
