const { body, param } = require("express-validator");

const updateProfileValidation = [
  body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Name must be 2-120 characters"),
];

const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("currentPassword is required"),
  body("newPassword")
    .isLength({ min: 8 }).withMessage("newPassword must be at least 8 characters")
    .matches(/[A-Za-z]/).withMessage("newPassword must contain a letter")
    .matches(/[0-9]/).withMessage("newPassword must contain a number"),
];

const addressValidation = [
  body("label").optional({ values: "falsy" }).isString().isLength({ max: 50 }),
  body("line1").trim().notEmpty().withMessage("line1 is required"),
  body("line2").optional({ values: "falsy" }).isString(),
  body("city").trim().notEmpty().withMessage("city is required"),
  body("state").optional({ values: "falsy" }).isString(),
  body("postalCode").trim().notEmpty().withMessage("postalCode is required"),
  body("country").trim().notEmpty().withMessage("country is required"),
  body("isDefault").optional().isBoolean().toBoolean(),
];

const addressUpdateValidation = [
  param("id").isUUID().withMessage("Invalid address id"),
  body("label").optional({ values: "falsy" }).isString().isLength({ max: 50 }),
  body("line1").optional().trim().notEmpty(),
  body("line2").optional({ values: "falsy" }).isString(),
  body("city").optional().trim().notEmpty(),
  body("state").optional({ values: "falsy" }).isString(),
  body("postalCode").optional().trim().notEmpty(),
  body("country").optional().trim().notEmpty(),
  body("isDefault").optional().isBoolean().toBoolean(),
];

const addressIdValidation = [param("id").isUUID().withMessage("Invalid address id")];

module.exports = {
  updateProfileValidation, changePasswordValidation,
  addressValidation, addressUpdateValidation, addressIdValidation,
};
