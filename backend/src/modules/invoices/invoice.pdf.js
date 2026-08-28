const PDFDocument = require("pdfkit");
const fs = require("fs");

function money(n) {
  // "Rs." rather than the ₹ glyph: PDFKit's base14 Helvetica font has no
  // glyph for U+20B9 and silently substitutes a garbled character instead.
  const formatted = Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `Rs. ${formatted}`;
}

/**
 * Streams a single invoice PDF to `filePath` describing one order.
 * Resolves with filePath once the file is fully flushed to disk.
 */
function renderInvoicePdf({ invoiceNumber, order, items }, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ---- Header ----
    doc.fontSize(20).font("Helvetica-Bold").text("Smart E-Commerce", 50, 50);
    doc.fontSize(9).font("Helvetica").fillColor("#555555")
      .text("Order Invoice", 50, 74);

    doc.fontSize(18).font("Helvetica-Bold").fillColor("#000000")
      .text("INVOICE", 0, 50, { align: "right" });
    doc.fontSize(9).font("Helvetica").fillColor("#555555")
      .text(`Invoice #: ${invoiceNumber}`, { align: "right" })
      .text(`Order #: ${order.id}`, { align: "right" })
      .text(`Date: ${new Date(order.created_at).toDateString()}`, { align: "right" });

    doc.moveTo(50, 115).lineTo(545, 115).strokeColor("#cccccc").stroke();

    // ---- Bill To / Ship To ----
    doc.fillColor("#000000").fontSize(11).font("Helvetica-Bold").text("Bill To / Ship To", 50, 130);
    doc.fontSize(9.5).font("Helvetica").fillColor("#333333");
    doc.text(order.customer_name || "", 50, 148);
    doc.text(order.customer_email || "", 50, 162);
    const addr = order.shipping_address || {};
    const addrLine = [addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.country]
      .filter(Boolean).join(", ");
    doc.text(addrLine, 50, 176, { width: 300 });

    doc.fontSize(9.5).font("Helvetica").fillColor("#333333")
      .text(`Payment Method: ${order.payment_method || "COD"}`, 350, 148, { width: 195, align: "right" })
      .text(`Status: ${order.status}`, 350, 162, { width: 195, align: "right" });

    doc.fontSize(8).font("Helvetica-Oblique").fillColor("#888888")
      .text("All item prices shown are inclusive of applicable taxes.", 50, 200);

    // ---- Line items table ----
    let y = 230;
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#000000");
    doc.text("Item", 50, y);
    doc.text("Qty", 300, y, { width: 50, align: "right" });
    doc.text("Price", 360, y, { width: 80, align: "right" });
    doc.text("Total", 450, y, { width: 95, align: "right" });
    y += 16;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#cccccc").stroke();
    y += 8;

    doc.font("Helvetica").fontSize(9.5);
    for (const item of items) {
      const lineTotal = item.price * item.quantity;
      doc.text(item.product_name, 50, y, { width: 240 });
      doc.text(String(item.quantity), 300, y, { width: 50, align: "right" });
      doc.text(money(item.price), 360, y, { width: 80, align: "right" });
      doc.text(money(lineTotal), 450, y, { width: 95, align: "right" });
      y += 20;
    }

    y += 6;
    doc.moveTo(350, y).lineTo(545, y).strokeColor("#cccccc").stroke();
    y += 10;

    doc.font("Helvetica").fontSize(9.5);
    doc.text("Subtotal:", 360, y, { width: 80, align: "right" });
    doc.text(money(order.subtotal_amount), 450, y, { width: 95, align: "right" });
    y += 16;
    doc.text("Shipping Charges:", 360, y, { width: 80, align: "right" });
    doc.text(money(order.shipping_amount), 450, y, { width: 95, align: "right" });
    y += 18;

    doc.font("Helvetica-Bold").fontSize(11);
    doc.text("Total:", 360, y, { width: 80, align: "right" });
    doc.text(money(order.total_amount), 450, y, { width: 95, align: "right" });

    // ---- Footer ----
    doc.font("Helvetica").fontSize(8).fillColor("#888888")
      .text(
        "Thank you for shopping with Smart E-Commerce. This is a system-generated invoice.",
        50, 750, { align: "center", width: 495 }
      );

    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}

module.exports = { renderInvoicePdf };
