const { query } = require("../../config/db");

async function nextInvoiceNumber(client) {
  const { rows } = await client.query("SELECT nextval('invoice_number_seq') AS seq");
  const year = new Date().getFullYear();
  const seq = String(rows[0].seq).padStart(6, "0");
  return `INV-${year}-${seq}`;
}

async function create(client, { orderId, invoiceNumber, fileUrl }) {
  const { rows } = await client.query(
    `INSERT INTO invoices (order_id, invoice_number, file_url)
     VALUES ($1, $2, $3) RETURNING *`,
    [orderId, invoiceNumber, fileUrl]
  );
  return rows[0];
}

async function findByOrderId(orderId) {
  const { rows } = await query("SELECT * FROM invoices WHERE order_id = $1", [orderId]);
  return rows[0] || null;
}

module.exports = { nextInvoiceNumber, create, findByOrderId };
