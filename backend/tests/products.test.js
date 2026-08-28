const { app, request, uniqueSuffix, registerAndLoginUser, loginAdmin } = require("./helpers");

describe("Products & Categories", () => {
  let userToken;
  let adminToken;
  let createdProductId;
  const productName = `Test Widget ${uniqueSuffix()}`;

  beforeAll(async () => {
    userToken = (await registerAndLoginUser()).token;
    adminToken = (await loginAdmin()).token;
  });

  it("lists products publicly without auth", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("lists categories publicly", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("blocks a regular user from creating a product", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: productName, price: 9.99, stock: 5 });
    expect(res.status).toBe(403);
  });

  it("allows an admin to create a product", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: productName, description: "A test widget", price: 9.99, stock: 5 });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(productName);
    createdProductId = res.body.data.id;
  });

  it("finds the new product via search filter", async () => {
    const res = await request(app).get(`/api/products?search=${encodeURIComponent(productName)}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.some((p) => p.id === createdProductId)).toBe(true);
  });

  it("allows an admin to update the product", async () => {
    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 12.5 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(12.5);
  });

  it("blocks a regular user from updating the product", async () => {
    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ price: 1 });
    expect(res.status).toBe(403);
  });

  it("soft-deletes the product and hides it from public view", async () => {
    const del = await request(app)
      .delete(`/api/products/${createdProductId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(del.status).toBe(200);

    const getRes = await request(app).get(`/api/products/${createdProductId}`);
    expect(getRes.status).toBe(404);
  });

  it("hides a deactivated product from a regular listing, even for an admin", async () => {
    const res = await request(app).get("/api/products").set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.data.items.some((p) => p.id === createdProductId)).toBe(false);
  });

  it("lets an admin see a deactivated product via includeInactive=true", async () => {
    const res = await request(app)
      .get("/api/products?includeInactive=true")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.data.items.some((p) => p.id === createdProductId)).toBe(true);
  });

  it("does NOT honor includeInactive for a non-admin user", async () => {
    const res = await request(app)
      .get("/api/products?includeInactive=true")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.body.data.items.some((p) => p.id === createdProductId)).toBe(false);
  });

  it("does NOT honor includeInactive for an anonymous request", async () => {
    const res = await request(app).get("/api/products?includeInactive=true");
    expect(res.body.data.items.some((p) => p.id === createdProductId)).toBe(false);
  });

  it("lets an admin reactivate a deactivated product", async () => {
    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isActive: true });
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(true);

    const getRes = await request(app).get(`/api/products/${createdProductId}`);
    expect(getRes.status).toBe(200);
  });

  it("rejects an invalid product id format", async () => {
    const res = await request(app).get("/api/products/not-a-uuid");
    expect(res.status).toBe(422);
  });
});
