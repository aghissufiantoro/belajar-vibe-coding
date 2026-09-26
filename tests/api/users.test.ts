import { describe, test, expect, beforeEach } from "bun:test";
import {
  cleanDatabase,
  createTestUser,
  generateTestEmail,
  generateTestName,
  generateLongString,
  getUserByEmail,
  verifyPassword,
} from "../helpers/test-utils";

const BASE_URL = "http://localhost:3000";

describe("API: POST /api/users", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("Positive Scenarios", () => {
    test("should register new user successfully", async () => {
      const email = generateTestEmail();
      const name = generateTestName();
      const password = "validPassword123";

      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.data).toBe("ok");

      // Verify user saved in database
      const savedUser = await getUserByEmail(email);
      expect(savedUser).toBeDefined();
      expect(savedUser?.name).toBe(name);
      expect(savedUser?.email).toBe(email);
    });

    test("should hash password (not plain text)", async () => {
      const email = generateTestEmail();
      const name = generateTestName();
      const password = "testPassword456";

      await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const savedUser = await getUserByEmail(email);
      expect(savedUser?.password).not.toBe(password);
      
      // Verify it's bcrypt hash (starts with $2a$ or $2b$)
      expect(
        savedUser?.password.startsWith("$2a$") ||
        savedUser?.password.startsWith("$2b$")
      ).toBe(true);
    });

    test("should register user with 255 character name (boundary)", async () => {
      const name = generateLongString(255, "A");
      const email = generateTestEmail();
      const password = "validPassword123";

      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      expect(response.status).toBe(201);
      const savedUser = await getUserByEmail(email);
      expect(savedUser?.name.length).toBe(255);
    });

    test("should register user with 255 character email (boundary)", async () => {
      const email = generateLongString(240, "a") + "@test.c";
      const name = generateTestName();
      const password = "validPassword123";

      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      expect(response.status).toBe(201);
      const savedUser = await getUserByEmail(email);
      expect(savedUser).toBeDefined();
    });

    test("should register user with 6 character password (minimum boundary)", async () => {
      const email = generateTestEmail();
      const name = generateTestName();
      const password = "abc123"; // exactly 6 chars

      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      expect(response.status).toBe(201);
      const savedUser = await getUserByEmail(email);
      expect(savedUser).toBeDefined();
    });

    test("should register user with 255 character password (maximum boundary)", async () => {
      const email = generateTestEmail();
      const name = generateTestName();
      const password = generateLongString(255, "p");

      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      expect(response.status).toBe(201);
      const savedUser = await getUserByEmail(email);
      expect(savedUser).toBeDefined();
    });
  });

  describe("Validation Errors - Name Field", () => {
    test("should reject empty name", async () => {
      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email: generateTestEmail(),
          password: "validPassword123",
        }),
      });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.type).toBe("validation");
      expect(data.property).toBe("/name");
    });

    test("should reject name longer than 255 characters", async () => {
      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generateLongString(256, "A"),
          email: generateTestEmail(),
          password: "validPassword123",
        }),
      });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.type).toBe("validation");
      expect(data.property).toBe("/name");
    });
  });

  describe("Validation Errors - Email Field", () => {
    test("should reject invalid email format", async () => {
      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generateTestName(),
          email: "not-an-email",
          password: "validPassword123",
        }),
      });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.type).toBe("validation");
      expect(data.property).toBe("/email");
    });

    test("should reject empty email", async () => {
      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generateTestName(),
          email: "",
          password: "validPassword123",
        }),
      });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.type).toBe("validation");
    });

    test("should reject email longer than 255 characters", async () => {
      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generateTestName(),
          email: generateLongString(250, "a") + "@test.c",
          password: "validPassword123",
        }),
      });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.type).toBe("validation");
      expect(data.property).toBe("/email");
    });
  });

  describe("Validation Errors - Password Field", () => {
    test("should reject password shorter than 6 characters", async () => {
      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generateTestName(),
          email: generateTestEmail(),
          password: "12345", // 5 chars
        }),
      });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.type).toBe("validation");
      expect(data.property).toBe("/password");
    });

    test("should reject empty password", async () => {
      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generateTestName(),
          email: generateTestEmail(),
          password: "",
        }),
      });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.type).toBe("validation");
    });

    test("should reject password longer than 255 characters", async () => {
      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generateTestName(),
          email: generateTestEmail(),
          password: generateLongString(256, "p"),
        }),
      });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.type).toBe("validation");
      expect(data.property).toBe("/password");
    });
  });

  describe("Business Logic Errors", () => {
    test("should reject duplicate email", async () => {
      const email = generateTestEmail();
      const name1 = generateTestName();
      const name2 = generateTestName();
      const password = "validPassword123";

      // Register first user
      await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name1, email, password }),
      });

      // Try to register second user with same email
      const response = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name2, email, password }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("email sudah terdaftar");
    });
  });
});
