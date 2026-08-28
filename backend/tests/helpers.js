const app = require("../src/app");
const request = require("supertest");

function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

/** Registers + logs in a brand-new "user" role account, returns its access token. */
async function registerAndLoginUser() {
  const suffix = uniqueSuffix();
  const email = `test.user.${suffix}@example.com`;
  const password = "Passw0rd123";

  await request(app).post("/api/auth/register").send({
    name: "Automated Test User",
    email,
    username: `testuser${suffix}`,
    password,
  });

  const res = await request(app).post("/api/auth/login").send({ email, password });
  return { token: res.body.data.accessToken, email, userId: res.body.data.user.id };
}

/** Logs in the seeded admin account (created by src/db/seed.js). */
async function loginAdmin() {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@smartshop.com", password: "Admin@12345" });
  return { token: res.body.data.accessToken, userId: res.body.data.user.id };
}

module.exports = { app, request, uniqueSuffix, registerAndLoginUser, loginAdmin };
