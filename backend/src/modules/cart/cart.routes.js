const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");
const { addValidation, updateValidation, idValidation } = require("./cart.validation");
const controller = require("./cart.controller");

const router = express.Router();

// All cart routes require a logged-in user.
router.use(authenticate);

router.get("/", controller.getCart);
router.post("/", addValidation, validate, controller.addItem);
router.put("/:id", updateValidation, validate, controller.updateItem);
router.delete("/:id", idValidation, validate, controller.removeItem);

module.exports = router;
