const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Negative and Edge Cases", () => {
  for (let i = 0; i < 10; i++) {
    test(`should return 404 for unknown route (case ${i + 1})`, async () => {
      const res = await request(app).get(`/api/unknownroute${i}`);
      expect([404, 400]).toContain(res.statusCode);
    });
  }
}); 