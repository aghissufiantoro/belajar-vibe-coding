import { describe, test, expect, beforeEach } from "bun:test";
import {
  cleanDatabase,
  createTestUser,
  createTestSession,
  generateTestEmail,
  generateTestName,
} from "../helpers/test-utils";

const BASE_URL = "http://localhost:3000";

describe("API: GET /api/users/current", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("Positive Scenarios", () => {
    test("should get current user with valid token", async () => {
      const email = generateTestEmail();
      const name = generateTestName();
      const password = "testPassword123";

      const user = await createTestUser(name, email, password);
      const token = await createTestSession(user.id);

      const response = await fetch(`${BASE_URL}/api/users/current`, {
        headers: { Authorization: `Bearer${token}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeDefined();
      expect(data.data.id).toBe(user.id);
      expect(data.data.name).toBe(name);
      expect(data.data.email).toBe(email);
      expect(data.data.createdAt).toBeDefined();
    });

    test("should NOT include password in response", async () => {
      const email = generateTestEmail();
      const name = generateTestName();
      const password = "testPassword123";

      const user = await createTestUser(name, email, password);
      const token = await createTestSession(user.id);

      const response = await fetch(`${BASE_URL}/api/users/current`, {
        headers: { Authorization: `Bearer${token}` },
      });

      const data = await response.json();
      expect(data.data.password).toBeUndefined();
      expect(Object.keys(data.data)).not.toContain("password");
    });

    test("should support Bearer format with space", async () => {
      const email = generateTestEmail();
      const name = generateTestName();
      const password = "testPassword123";

      const user = await createTestUser(name, email, password);
      const token = await createTestSession(user.id);

      const response = await fetch(`${BASE_URL}/api/users/current`, {
        headers: { Authorization: `Bearer ${token}` }, // with space
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.id).toBe(user.id);
    });

    test("should support Bearer format without space", async () => {
      const email = generateTestEmail();
      const name = generateTestName();
      const password = "testPassword123";

      const user = await createTestUser(name, email, password);
      const token = await createTestSession(user.id);

      const response = await fetch(`${BASE_URL}/api/users/current`, {
        headers: { Authorization: `Bearer${token}` }, // without space
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.id).toBe(user.id);
    });
  });

  describe("Authorization Errors", () => {
    test("should reject request without Authorization header", async () => {
      const response = await fetch(`${BASE_URL}/api/users/current`);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("unauthorized");
    });

    test("should reject request with empty Authorization header", async () => {
      const response = await fetch(`${BASE_URL}/api/users/current`, {
        headers: { Authorization: "" },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("unauthorized");
    });

    test("should reject request with invalid token", async () => {
      const response = await fetch(`${BASE_URL}/api/users/current`, {
        headers: { Authorization: "Bearertoken-that-doesnt-exist" },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("unauthorized");
    });

    test("should reject request with token not in database", async () => {
      const fakeToken = "12345678-1234-1234-1234-123456789012";

      const response = await fetch(`${BASE_URL}/api/users/current`, {
        headers: { Authorization: `Bearer${fakeToken}` },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("unauthorized");
    });

    test("should reject request without Bearer prefix", async () => {
      const email = generateTestEmail();
      const name = generateTestName();
      const password = "testPassword123";

      const user = await createTestUser(name, email, password);
      const token = await createTestSession(user.id);

      const response = await fetch(`${BASE_URL}/api/users/current`, {
        headers: { Authorization: token }, // no Bearer prefix
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("unauthorized");
    });

    test("should reject request when user is deleted", async () => {
      const email = generateTestEmail();
      const name = generateTestName();
      const password = "testPassword123";

      const user = await createTestUser(name, email, password);
      const token = await createTestSession(user.id);

      // Delete the user but keep the session
      await cleanDatabase();

      const response = await fetch(`${BASE_URL}/api/users/current`, {
        headers: { Authorization: `Bearer${token}` },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("unauthorized");
    });
  });

  describe("Security & Isolation", () => {
    test("should isolate data between users (token from user A cannot access user B)", async () => {
      // Create two users
      const user1 = await createTestUser(
        generateTestName(),
        generateTestEmail(),
        "password123"
      );
      const user2 = await createTestUser(
        generateTestName(),
        generateTestEmail(),
        "password123"
      );

      // Create sessions for both
      const token1 = await createTestSession(user1.id);
      const token2 = await createTestSession(user2.id);

      // User 1 should get user 1's data
      const response1 = await fetch(`${BASE_URL}/api/users/current`, {
        headers: { Authorization: `Bearer${token1}` },
      });
      const data1 = await response1.json();
      expect(data1.data.id).toBe(user1.id);
      expect(data1.data.email).toBe(user1.email);

      // User 2 should get user 2's data
      const response2 = await fetch(`${BASE_URL}/api/users/current`, {
        headers: { Authorization: `Bearer${token2}` },
      });
      const data2 = await response2.json();
      expect(data2.data.id).toBe(user2.id);
      expect(data2.data.email).toBe(user2.email);

      // Verify they are different
      expect(data1.data.id).not.toBe(data2.data.id);
      expect(data1.data.email).not.toBe(data2.data.email);
    });

    test("should have only id, name, email, createdAt in response", async () => {
      const email = generateTestEmail();
      const name = generateTestName();
      const password = "testPassword123";

      const user = await createTestUser(name, email, password);
      const token = await createTestSession(user.id);

      const response = await fetch(`${BASE_URL}/api/users/current`, {
        headers: { Authorization: `Bearer${token}` },
      });

      const data = await response.json();
      const allowedFields = ["id", "name", "email", "createdAt"];
      const responseFields = Object.keys(data.data);

      // Should only have allowed fields
      responseFields.forEach((field) => {
        expect(allowedFields).toContain(field);
      });

      // Should have all required fields
      allowedFields.forEach((field) => {
        expect(responseFields).toContain(field);
      });
    });
  });
});
