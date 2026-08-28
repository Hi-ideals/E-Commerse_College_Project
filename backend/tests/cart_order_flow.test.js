const { app, request, uniqueSuffix, registerAndLoginUser, loginAdmin } = require("./helpers");

describe("Cart -> Checkout -> Order Status -> Invoice (end to end)", () => {
  let userToken;
  let adminToken;
  let productId;
  let orderId;

  beforeAll(async () => {
    userToken = (await registerAndLoginUser()).token;
    adminToken = (await loginAdmin()).token;

    // Create a dedicated product for this test so stock math is isolated
    // from anything else running concurrently.
    const created = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: `E2E Product ${uniqueSuffix()}`, price: 25, stock: 10 });
    productId = created.body.data.id;
  });

  it("starts with an empty cart", async () => {
    const res = await request(app).get("/api/cart").set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
  });

  it("adds an item to the cart", async () => {
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });
    expect(res.status).toBe(201);
    expect(res.body.data.itemCount).toBe(2);
  });

  it("rejects adding more than available stock", async () => {
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 999 });
    expect(res.status).toBe(409);
  });

  it("rejects checkout without a shipping address", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it("checks out successfully, decrementing stock and clearing the cart", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        shippingAddress: { line1: "1 Test St", city: "Testville", postalCode: "00000", country: "US" },
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("Pending");
    orderId = res.body.data.id;

    const cart = await request(app).get("/api/cart").set("Authorization", `Bearer ${userToken}`);
    expect(cart.body.data.items).toHaveLength(0);

    const product = await request(app).get(`/api/products/${productId}`);
    expect(product.body.data.stock).toBe(8); // 10 - 2
  });

  it("lets the user view their own order", async () => {
    const res = await request(app).get(`/api/orders/${orderId}`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it("blocks a regular user from listing all orders", async () => {
    const res = await request(app).get("/api/orders/all").set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("blocks a regular user from updating order status", async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ status: "Confirmed" });
    expect(res.status).toBe(403);
  });

  it("rejects an invalid status transition (Pending -> Delivered)", async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "Delivered" });
    expect(res.status).toBe(400);
  });

  it("allows the admin to advance the status validly", async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "Confirmed", note: "Payment verified" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("Confirmed");
  });

  it("shows the tracking timeline to the owning user", async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}/tracking`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.statusHistory.length).toBeGreaterThanOrEqual(2);
  });

  it("generated and serves a downloadable invoice PDF", async () => {
    const res = await request(app)
      .get(`/api/invoices/${orderId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
  });

  it("blocks a different user from downloading this invoice", async () => {
    const otherToken = (await registerAndLoginUser()).token;
    const res = await request(app).get(`/api/invoices/${orderId}`).set("Authorization", `Bearer ${otherToken}`);
    expect(res.status).toBe(404);
  });
});
