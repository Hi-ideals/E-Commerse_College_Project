const { body, query, param } = require("express-validator");

const createValidation = [
  body("name").trim().isLength({ min: 2, max: 200 }).withMessage("Name must be 2-200 characters"),
  body("description").optional({ values: "falsy" }).isString().isLength({ max: 5000 }),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a non-negative number").toFloat(),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer").toInt(),
  body("categoryId").optional({ values: "falsy" }).isInt().withMessage("categoryId must be an integer").toInt(),
];

const updateValidation = [
  param("id").isUUID().withMessage("Invalid product id"),
  body("name").optional().trim().isLength({ min: 2, max: 200 }),
  body("description").optional({ values: "falsy" }).isString().isLength({ max: 5000 }),
  body("price").optional().isFloat({ min: 0 }).toFloat(),
  body("stock").optional().isInt({ min: 0 }).toInt(),
  body("categoryId").optional({ values: "falsy" }).isInt().toInt(),
  body("isActive").optional().isBoolean().toBoolean(),
];

const idValidation = [param("id").isUUID().withMessage("Invalid product id")];

const listValidation = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("minPrice").optional().isFloat({ min: 0 }).toFloat(),
  query("maxPrice").optional().isFloat({ min: 0 }).toFloat(),
  query("includeInactive").optional().isIn(["true", "false"]),
];

module.exports = { createValidation, updateValidation, idValidation, listValidation };
