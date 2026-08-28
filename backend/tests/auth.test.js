const { app, request, uniqueSuffix } = require("./helpers");

describe("Auth", () => {
  const suffix = uniqueSuffix();
  const email = `auth.test.${suffix}@example.com`;
  const username = `authtest${suffix}`;
  const password = "Passw0rd123";

  it("registers a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Auth Test", email, username, password });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe("user");
  });

  it("rejects duplicate email registration", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Auth Test", email, username: `${username}2`, password });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("rejects weak passwords", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Weak Pw", email: `weak.${suffix}@example.com`, username: `weak${suffix}`, password: "abc" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("rejects login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password: "WrongPass1" });
    expect(res.status).toBe(401);
  });

  it("returns the current user from /me with a valid token", async () => {
    const login = await request(app).post("/api/auth/login").send({ email, password });
    const token = login.body.data.accessToken;

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email);
  });

  it("rejects /me without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
