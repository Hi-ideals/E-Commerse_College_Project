const asyncHandler = require("../../utils/asyncHandler");
const service = require("./invoice.service");

const download = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const { invoice, absolutePath } = await service.getInvoiceFile(req.params.orderId, req.user.id, isAdmin);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${invoice.invoice_number}.pdf"`);
  res.sendFile(absolutePath);
});

module.exports = { download };
