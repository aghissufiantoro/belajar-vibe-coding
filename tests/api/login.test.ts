import { describe, test, expect, beforeEach } from "bun:test";
import {
  cleanDatabase,
  createTestUser,
  generateTestEmail,
  generateTestName,
  getSessionByToken,
} from "../helpers/test-utils";

const BASE_URL = "http://localhost:3000";

describe("API: POST /api/login", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("Positive Scenarios", () => {
    test("should login successfully with valid credentials", async () => {
      const email = generateTestEmail();
      const password = "testPassword123";
      const name = generateTestName();

      // Create test user
      const user = await createTestUser(name, email, password);

      // Login
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeDefined();
      expect(typeof data.data).toBe("string");

      // Verify token is UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(data.data)).toBe(true);
    });

    test("should store token in sessions table", async () => {
      const email = generateTestEmail();
      const password = "testPassword123";
      const name = generateTestName();

      const user = await createTestUser(name, email, password);

      const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      const token = data.data;

      // Verify session exists
      const session = await getSessionByToken(token);
      expect(session).toBeDefined();
      expect(session?.userId).toBe(user.id);
    });

    test("should generate different token for multiple logins", async () => {
      const email = generateTestEmail();
      const password = "testPassword123";
      const name = generateTestName();

      await createTestUser(name, email, password);

      // First login
      const response1 = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data1 = await response1.json();
      const token1 = data1.data;

      // Second login
      const response2 = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data2 = await response2.json();
      const token2 = data2.data;

      expect(token1).not.toBe(token2);
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();

      // Both tokens should exist in sessions
      const session1 = await getSessionByToken(token1);
      const session2 = await getSessionByToken(token2);
      expect(session1).toBeDefined();
      expect(session2).toBeDefined();
    });
  });

  describe("Validation Errors", () => {
    test("should reject invalid email format", async () => {
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "not-an-email",
          password: "testPassword123",
        }),
      });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.type).toBe("validation");
      expect(data.property).toBe("/email");
    });

    test("should reject empty email", async () => {
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "",
          password: "testPassword123",
        }),
      });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.type).toBe("validation");
    });

    test("should reject empty password", async () => {
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: generateTestEmail(),
          password: "",
        }),
      });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.type).toBe("validation");
    });
  });

  describe("Authentication Errors", () => {
    test("should reject login with unregistered email", async () => {
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: generateTestEmail(),
          password: "testPassword123",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("email atau password salah");
    });

    test("should reject login with wrong password", async () => {
      const email = generateTestEmail();
      const name = generateTestName();
      const correctPassword = "correctPassword123";
      const wrongPassword = "wrongPassword456";

      await createTestUser(name, email, correctPassword);

      const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: wrongPassword }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("email atau password salah");
    });

    test("should have same error message for email and password errors", async () => {
      const email = generateTestEmail();
      const name = generateTestName();
      const password = "testPassword123";

      await createTestUser(name, email, password);

      // Try with wrong password
      const response1 = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "wrongPassword" }),
      });
      const data1 = await response1.json();

      // Try with unregistered email
      const response2 = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "unregistered@test.com",
          password: "somePassword",
        }),
      });
      const data2 = await response2.json();

      // Both should have same error message (no info leaking)
      expect(data1.error).toBe(data2.error);
      expect(data1.error).toBe("email atau password salah");
    });
  });
});
