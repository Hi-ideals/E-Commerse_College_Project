const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const validate = require("../../middleware/validate.middleware");
const { createValidation, idValidation } = require("./category.validation");
const controller = require("./category.controller");

const router = express.Router();

router.get("/", controller.list);
router.post("/", authenticate, requireRole("admin"), createValidation, validate, controller.create);
router.delete("/:id", authenticate, requireRole("admin"), idValidation, validate, controller.remove);

module.exports = router;
