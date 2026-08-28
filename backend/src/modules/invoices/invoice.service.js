const fs = require("fs");
const path = require("path");
const env = require("../../config/env");
const ApiError = require("../../utils/apiError");
const repo = require("./invoice.repository");
const orderRepo = require("../orders/order.repository");
const { renderInvoicePdf } = require("./invoice.pdf");

const INVOICES_DIR = path.join(env.uploadDir, "invoices");
fs.mkdirSync(INVOICES_DIR, { recursive: true });

/**
 * Generates the PDF + DB record for a just-placed order.
 * Called by order.service.checkout() from *inside* the same checkout
 * transaction (via the shared `client`), so the invoice row is committed
 * atomically with the order — no order can exist without its invoice.
 */
async function generateForOrder(client, order, items) {
  const invoiceNumber = await repo.nextInvoiceNumber(client);
  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join(INVOICES_DIR, fileName);

  await renderInvoicePdf({ invoiceNumber, order, items }, filePath);

  const fileUrl = `/uploads/invoices/${fileName}`;
  return repo.create(client, { orderId: order.id, invoiceNumber, fileUrl });
}

/**
 * Resolves the invoice for an order, enforcing ownership unless the
 * caller is an admin. Returns the absolute file path for streaming.
 */
async function getInvoiceFile(orderId, userId, isAdmin) {
  const order = await orderRepo.findById(orderId);
  if (!order) throw ApiError.notFound("Order not found");
  if (!isAdmin && order.user_id !== userId) throw ApiError.notFound("Order not found");

  const invoice = await repo.findByOrderId(orderId);
  if (!invoice) throw ApiError.notFound("Invoice not found for this order");

  const absolutePath = path.join(process.cwd(), invoice.file_url.replace(/^\//, ""));
  if (!fs.existsSync(absolutePath)) {
    throw ApiError.internal("Invoice file is missing on the server");
  }

  return { invoice, absolutePath };
}

module.exports = { generateForOrder, getInvoiceFile };
