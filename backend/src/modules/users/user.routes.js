const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const validate = require("../../middleware/validate.middleware");
const {
  updateProfileValidation, changePasswordValidation,
  addressValidation, addressUpdateValidation, addressIdValidation,
} = require("./user.validation");
const controller = require("./user.controller");

const router = express.Router();

router.use(authenticate); // every route here requires a logged-in user

router.get("/me", controller.getMe);
router.put("/me", updateProfileValidation, validate, controller.updateMe);
router.put("/me/password", changePasswordValidation, validate, controller.changePassword);

router.get("/me/addresses", controller.listAddresses);
router.post("/me/addresses", addressValidation, validate, controller.createAddress);
router.put("/me/addresses/:id", addressUpdateValidation, validate, controller.updateAddress);
router.delete("/me/addresses/:id", addressIdValidation, validate, controller.removeAddress);

module.exports = router;
