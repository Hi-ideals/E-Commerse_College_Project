const express = require("express");
const { authenticate, authenticateOptional } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const validate = require("../../middleware/validate.middleware");
const { uploadProductImage } = require("../../middleware/upload.middleware");
const {
  createValidation, updateValidation, idValidation, listValidation,
} = require("./product.validation");
const controller = require("./product.controller");

const router = express.Router();

// Public (but reads req.user if a valid token is present, so admins can
// opt into seeing deactivated products via ?includeInactive=true)
router.get("/", authenticateOptional, listValidation, validate, controller.list);
router.get("/:id", idValidation, validate, controller.getById);

// Admin only
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  uploadProductImage,
  createValidation,
  validate,
  controller.create
);
router.put(
  "/:id",authenticate,requireRole("admin"),uploadProductImage,updateValidation,validate,controller.update
);
router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  idValidation,
  validate,
  controller.remove
);

module.exports = router;
