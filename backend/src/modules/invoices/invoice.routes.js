const express = require("express");
const { param } = require("express-validator");
const { authenticate } = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");
const controller = require("./invoice.controller");

const router = express.Router();

router.get(
  "/:orderId",
  authenticate,
  [param("orderId").isUUID().withMessage("Invalid order id")],
  validate,
  controller.download
);

module.exports = router;
