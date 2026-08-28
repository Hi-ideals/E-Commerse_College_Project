const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const validate = require("../../middleware/validate.middleware");
const { checkoutValidation, idValidation, listValidation, statusUpdateValidation } = require("./order.validation");
const controller = require("./order.controller");

const router = express.Router();

router.use(authenticate); // every order route requires a logged-in user

router.post("/", checkoutValidation, validate, controller.checkout);
router.get("/", listValidation, validate, controller.listMine);
router.get("/all", requireRole("admin"), listValidation, validate, controller.listAll);
router.get("/:id", idValidation, validate, controller.getById);
router.get("/:id/tracking", idValidation, validate, controller.tracking);
router.put(
  "/:id/status",
  requireRole("admin"),
  statusUpdateValidation,
  validate,
  controller.updateStatus
);

module.exports = router;
