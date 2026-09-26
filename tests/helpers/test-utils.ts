import { db } from "../../src/db";
import { users, sessions } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Clean up all test data from database
 * Should be called in beforeEach() to ensure test isolation
 */
export async function cleanDatabase() {
  try {
    // Delete all sessions first (due to foreign key constraint)
    await db.delete(sessions);
    // Delete all users
    await db.delete(users);
  } catch (error) {
    console.error("Error cleaning database:", error);
    throw error;
  }
}

/**
 * Create a test user
 * @param name User name
 * @param email User email
 * @param password User password (will be hashed)
 * @returns User object with id
 */
export async function createTestUser(
  name: string,
  email: string,
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // Get the created user
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return userResult[0];
}

/**
 * Create a test session with valid token
 * @param userId User ID
 * @returns Token string
 */
export async function createTestSession(userId: number) {
  const token = crypto.randomUUID();

  await db.insert(sessions).values({
    token,
    userId,
  });

  return token;
}

/**
 * Hash password for test setup
 * @param password Password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

/**
 * Generate random test email
 * @returns Random email string
 */
export function generateTestEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Generate random test name
 * @returns Random name string
 */
export function generateTestName() {
  const names = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"];
  const lastName = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia"];
  return `${names[Math.floor(Math.random() * names.length)]} ${lastName[Math.floor(Math.random() * lastName.length)]}`;
}

/**
 * Generate string of specific length
 * @param length Length of string
 * @param char Character to repeat (default: 'A')
 * @returns String of specified length
 */
export function generateLongString(length: number, char: string = "A") {
  return char.repeat(length);
}

/**
 * Generate random valid email
 * @returns Valid email string
 */
export function generateValidEmail() {
  return `user-${Date.now()}@test.local`;
}

/**
 * Get user by email
 * @param email User email
 * @returns User object or null
 */
export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] || null;
}

/**
 * Get session by token
 * @param token Session token
 * @returns Session object or null
 */
export async function getSessionByToken(token: string) {
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  return result[0] || null;
}

/**
 * Verify password hash
 * @param password Plain password
 * @param hash Hashed password
 * @returns True if password matches hash
 */
export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}
