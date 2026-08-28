const { app, request, registerAndLoginUser } = require("./helpers");

describe("User Profile & Addresses", () => {
  let token;
  let addressId;

  beforeAll(async () => {
    token = (await registerAndLoginUser()).token;
  });

  it("reads the current profile", async () => {
    const res = await request(app).get("/api/users/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBeDefined();
  });

  it("updates the profile name", async () => {
    const res = await request(app)
      .put("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name" });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Name");
  });

  it("rejects a password change with the wrong current password", async () => {
    const res = await request(app)
      .put("/api/users/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "WrongOne1", newPassword: "NewPass123" });
    expect(res.status).toBe(401);
  });

  it("changes the password with the correct current password", async () => {
    const res = await request(app)
      .put("/api/users/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "Passw0rd123", newPassword: "NewPass123" });
    expect(res.status).toBe(200);
  });

  it("starts with no saved addresses", async () => {
    const res = await request(app).get("/api/users/me/addresses").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it("creates a default address", async () => {
    const res = await request(app)
      .post("/api/users/me/addresses")
      .set("Authorization", `Bearer ${token}`)
      .send({ label: "Home", line1: "1 Main St", city: "Metropolis", postalCode: "10001", country: "US", isDefault: true });
    expect(res.status).toBe(201);
    expect(res.body.data.isDefault).toBe(true);
    addressId = res.body.data.id;
  });

  it("creating a second default address unsets the first one's default flag", async () => {
    await request(app)
      .post("/api/users/me/addresses")
      .set("Authorization", `Bearer ${token}`)
      .send({ label: "Office", line1: "2 Work Ave", city: "Metropolis", postalCode: "10002", country: "US", isDefault: true });

    const res = await request(app).get("/api/users/me/addresses").set("Authorization", `Bearer ${token}`);
    const home = res.body.data.find((a) => a.id === addressId);
    expect(home.isDefault).toBe(false);
  });

  it("checks out using a saved addressId", async () => {
    // Need a product + cart item first.
    const admin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@smartshop.com", password: "Admin@12345" });
    const adminToken = admin.body.data.accessToken;

    const product = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: `Address Checkout Product ${Date.now()}`, price: 10, stock: 5 });

    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product.body.data.id, quantity: 1 });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ addressId });
    expect(res.status).toBe(201);
    expect(res.body.data.shippingAddress.line1).toBe("1 Main St");
  });

  it("rejects checkout with neither addressId nor shippingAddress", async () => {
    const res = await request(app).post("/api/orders").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(422);
  });

  it("deletes an address", async () => {
    const res = await request(app)
      .delete(`/api/users/me/addresses/${addressId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it("blocks another user from deleting someone else's address", async () => {
    const otherToken = (await registerAndLoginUser()).token;
    const created = await request(app)
      .post("/api/users/me/addresses")
      .set("Authorization", `Bearer ${token}`)
      .send({ line1: "3 Guarded Rd", city: "Metropolis", postalCode: "10003", country: "US" });

    const res = await request(app)
      .delete(`/api/users/me/addresses/${created.body.data.id}`)
      .set("Authorization", `Bearer ${otherToken}`);
    expect(res.status).toBe(404);
  });
});
