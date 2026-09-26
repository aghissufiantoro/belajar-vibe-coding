import { describe, test, expect } from "bun:test";

const BASE_URL = "http://localhost:3000";

describe("API: GET /", () => {
  test("should return 200 status code", async () => {
    const response = await fetch(`${BASE_URL}/`);
    expect(response.status).toBe(200);
  });

  test("should have success field set to true", async () => {
    const response = await fetch(`${BASE_URL}/`);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test("should have message field", async () => {
    const response = await fetch(`${BASE_URL}/`);
    const data = await response.json();
    expect(typeof data.message).toBe("string");
    expect(data.message.length).toBeGreaterThan(0);
  });

  test("should have timestamp field", async () => {
    const response = await fetch(`${BASE_URL}/`);
    const data = await response.json();
    expect(typeof data.timestamp).toBe("string");
  });

  test("should have valid ISO 8601 timestamp", async () => {
    const response = await fetch(`${BASE_URL}/`);
    const data = await response.json();
    // Parse ISO timestamp - will throw if invalid
    const date = new Date(data.timestamp);
    expect(date.getTime()).toBeGreaterThan(0);
    // Verify it's a recent timestamp (within last minute)
    const now = Date.now();
    expect(now - date.getTime()).toBeLessThan(60000);
  });
});
