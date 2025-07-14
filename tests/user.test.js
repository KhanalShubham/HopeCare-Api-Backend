const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const User = require("../model/user");

let userToken;
let testUserId;

beforeAll(async () => {
  await User.deleteMany({ email: /testuser\d+@mail.com/ });
});

afterAll(async () => {
  await User.deleteMany({ email: /testuser\d+@mail.com/ });
  await mongoose.disconnect();
});

describe("User Registration & Login", () => {
  test("should not register user with missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser1@mail.com"
    });
    expect([400, 500]).toContain(res.statusCode);
    expect(res.body.success).toBe(false);
  });

  test("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser1@mail.com",
      password: "testpass123",
      disease: "none",
      description: "Test user desc",
      contact: "1234567890"
    });
    expect([201, 400]).toContain(res.statusCode); // 400 if already exists
    if (res.statusCode === 201) {
      expect(res.body.success).toBe(true);
    }
  });

  test("should not register user with duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser1@mail.com",
      password: "testpass123",
      disease: "none",
      description: "Test user desc",
      contact: "1234567891"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should not register user with duplicate contact", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser2@mail.com",
      password: "testpass123",
      disease: "none",
      description: "Test user desc",
      contact: "1234567890"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should login with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser1@mail.com",
      password: "testpass123"
    });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    userToken = res.body.token;
    testUserId = res.body.user?.id;
  });

  test("should not login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser1@mail.com",
      password: "wrongpass"
    });
    expect([401, 403, 404]).toContain(res.statusCode);
    expect(res.body.success).toBe(false);
  });

  test("should not login with non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "notfound@mail.com",
      password: "testpass123"
    });
    expect([401, 403, 404]).toContain(res.statusCode);
    expect(res.body.success).toBe(false);
  });

  for (let i = 0; i < 10; i++) {
    test(`should not register user with missing password (case ${i + 1})`, async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: `Test User ${i + 2}`,
        email: `testuser${i + 2}@mail.com`,
        disease: "none",
        description: "desc",
        contact: `12345678${i + 2}`
      });
      expect([400, 500]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });
  }
});

describe("User Profile", () => {
  test("should get user profile with token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("testuser1@mail.com");
  });

  test("should not get profile without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect([401, 403]).toContain(res.statusCode);
    expect(res.body.success).toBe(false);
  });

  test("should update user profile", async () => {
    const res = await request(app)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Updated Test User", description: "Updated desc" });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.success).toBe(true);
  });

  test("should not update profile without token", async () => {
    const res = await request(app)
      .put("/api/auth/me")
      .send({ name: "Updated Test User", description: "Updated desc" });
    expect([401, 403]).toContain(res.statusCode);
    expect(res.body.success).toBe(false);
  });

  for (let i = 0; i < 5; i++) {
    test(`should not update profile with invalid token (case ${i + 1})`, async () => {
      const res = await request(app)
        .put("/api/auth/me")
        .set("Authorization", `Bearer invalidtoken${i}`)
        .send({ name: "Updated Test User", description: "Updated desc" });
      expect([401, 403]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });
  }
}); 