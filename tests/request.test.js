const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const User = require("../model/user");
const RequestModel = require("../model/Request");

let userToken;

beforeAll(async () => {
  await User.deleteMany({ email: /testuser\d+@mail.com/ });
  await RequestModel.deleteMany({ description: /Test request/ });
  // Register and login a user to get a token
  await request(app).post("/api/auth/register").send({
    name: "Test User",
    email: "testuser1@mail.com",
    password: "testpass123",
    disease: "none",
    description: "Test user desc",
    contact: "1234567890"
  });
  const res = await request(app).post("/api/auth/login").send({
    email: "testuser1@mail.com",
    password: "testpass123"
  });
  userToken = res.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: /testuser\d+@mail.com/ });
  await RequestModel.deleteMany({ description: /Test request/ });
  await mongoose.disconnect();
});

describe("Request Endpoints", () => {
  test("should not create request without token", async () => {
    const res = await request(app).post("/api/request").send({});
    expect([401, 403]).toContain(res.statusCode);
    expect(res.body.success).toBe(false);
  });

  test("should get my requests as user", async () => {
    const res = await request(app)
      .get("/api/request/my-requests")
      .set("Authorization", `Bearer ${userToken}`);
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("should not get my requests without token", async () => {
    const res = await request(app).get("/api/request/my-requests");
    expect([401, 403]).toContain(res.statusCode);
    expect(res.body.success).toBe(false);
  });

  for (let i = 0; i < 5; i++) {
    test(`should not get request with invalid token (case ${i + 1})`, async () => {
      const res = await request(app)
        .get("/api/request/my-requests")
        .set("Authorization", `Bearer invalidtoken${i}`);
      expect([401, 403]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });
  }
}); 