const { body, param, query } = require("express-validator");

// Accepts EITHER a saved addressId OR an inline shippingAddress object.
const checkoutValidation = [
  body().custom((value) => {
    if (!value.addressId && !value.shippingAddress) {
      throw new Error("Provide either addressId (a saved address) or a shippingAddress object");
    }
    return true;
  }),
  body("addressId").optional().isUUID().withMessage("addressId must be a valid UUID"),
  body("shippingAddress").optional().isObject().withMessage("shippingAddress must be an object"),
  body("shippingAddress.line1").if(body("shippingAddress").exists()).trim().notEmpty().withMessage("shippingAddress.line1 is required"),
  body("shippingAddress.city").if(body("shippingAddress").exists()).trim().notEmpty().withMessage("shippingAddress.city is required"),
  body("shippingAddress.postalCode").if(body("shippingAddress").exists()).trim().notEmpty().withMessage("shippingAddress.postalCode is required"),
  body("shippingAddress.country").if(body("shippingAddress").exists()).trim().notEmpty().withMessage("shippingAddress.country is required"),
  body("paymentMethod").optional().isIn(["COD", "CARD", "UPI", "NETBANKING"]).withMessage("Unsupported paymentMethod"),
];

const idValidation = [param("id").isUUID().withMessage("Invalid order id")];

const listValidation = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("status")
    .optional()
    .isIn(["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"])
    .withMessage("Invalid status filter"),
];

const statusUpdateValidation = [
  param("id").isUUID().withMessage("Invalid order id"),
  body("status")
    .isIn(["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"])
    .withMessage("Invalid status value"),
  body("note").optional().isString().isLength({ max: 255 }).withMessage("note must be at most 255 characters"),
];

module.exports = { checkoutValidation, idValidation, listValidation, statusUpdateValidation };
