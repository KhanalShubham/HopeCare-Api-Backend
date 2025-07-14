const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Public Campaigns", () => {
  test("should get public campaigns", async () => {
    const res = await request(app).get("/api/campaigns");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  for (let i = 0; i < 5; i++) {
    test(`should get public campaigns (repeat case ${i + 1})`, async () => {
      const res = await request(app).get("/api/campaigns");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  }
}); 