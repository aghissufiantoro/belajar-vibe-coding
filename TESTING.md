# Testing Guide

## Overview

This project includes comprehensive unit tests for all API endpoints using **Bun Test**.

## Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── api/
│   ├── health.test.ts         # Health check endpoint tests
│   ├── users.test.ts          # User registration tests
│   ├── login.test.ts          # Login endpoint tests
│   └── current-user.test.ts   # Get current user tests
└── helpers/
    └── test-utils.ts          # Helper functions & utilities
```

## Running Tests

### Run All Tests
```bash
bun test
```

### Run Specific Test File
```bash
bun test tests/api/users.test.ts
```

### Run Tests in Watch Mode
```bash
bun test --watch
```

### Run Tests with Coverage
```bash
bun test --coverage
```

## Test Coverage

### Health Check (`tests/api/health.test.ts`)
- ✅ Server status (HTTP 200)
- ✅ Response structure (success, message, timestamp)
- ✅ Timestamp format validation (ISO 8601)

### User Registration (`tests/api/users.test.ts`)
- ✅ Successful registration
- ✅ Password hashing (bcrypt)
- ✅ Boundary tests (255 character limits)
- ✅ Validation errors (empty fields, invalid format, oversized data)
- ✅ Business logic (duplicate email prevention)
- ✅ Security (no plain text passwords)

**Total Scenarios:** 15+

### Login (`tests/api/login.test.ts`)
- ✅ Successful login
- ✅ Token generation (UUID format)
- ✅ Session storage
- ✅ Multiple login support
- ✅ Validation errors
- ✅ Authentication errors (email not found, wrong password)
- ✅ Error message consistency (no info leaking)

**Total Scenarios:** 10+

### Get Current User (`tests/api/current-user.test.ts`)
- ✅ Get user with valid token
- ✅ Bearer token format support (with/without space)
- ✅ Password not in response
- ✅ Authorization errors (missing token, invalid token)
- ✅ Edge cases (deleted user)
- ✅ Security (user data isolation)
- ✅ Response field validation

**Total Scenarios:** 10+

## Helper Functions

Available helper functions in `tests/helpers/test-utils.ts`:

- `cleanDatabase()` - Clean all test data
- `createTestUser(name, email, password)` - Create test user
- `createTestSession(userId)` - Create session with token
- `hashPassword(password)` - Hash password
- `generateTestEmail()` - Generate random email
- `generateTestName()` - Generate random name
- `generateLongString(length, char?)` - Generate string of specific length
- `generateValidEmail()` - Generate valid email
- `getUserByEmail(email)` - Get user from database
- `getSessionByToken(token)` - Get session from database
- `verifyPassword(password, hash)` - Verify password hash

## Test Patterns

### Database Cleanup
Each test cleans database before running:
```typescript
beforeEach(async () => {
  await cleanDatabase();
});
```

This ensures:
- Test isolation (no data leakage between tests)
- Consistent test state
- Predictable results

### Test Structure (AAA Pattern)

```typescript
test("should do something", async () => {
  // Arrange: Set up test data
  const user = await createTestUser("Name", "email@test.com", "password123");
  
  // Act: Perform action
  const response = await fetch(`${BASE_URL}/api/endpoint`, {
    method: "POST",
    body: JSON.stringify({ /* data */ })
  });
  
  // Assert: Verify results
  expect(response.status).toBe(200);
  expect(data.field).toBe(expectedValue);
});
```

## Prerequisites

### Database Setup

Tests use MySQL database. Create a test database:

```sql
CREATE DATABASE belajar_vibe_coding_test;
```

### Environment Variables

Ensure `.env` has:
```env
PORT=3000
DATABASE_URL="mysql://root:@localhost:3306/belajar_vibe_coding"
```

For testing, you may need a separate database URL or modify the database connection for testing.

### Running Server

Tests require the API server to be running:

```bash
bun run dev
```

In another terminal, run tests:

```bash
bun test
```

## Best Practices

### 1. Test Independence
- Each test should run independently
- No test should depend on another test's results
- Clean database before each test

### 2. Clear Test Names
Use descriptive test names:
```typescript
test("should register new user successfully") // ✅ Clear
test("register") // ❌ Too vague
```

### 3. Assertions
Test one thing per test when possible:
```typescript
test("should validate email format", async () => {
  // Only test email validation, not other fields
});
```

### 4. Use Helper Functions
Reuse helpers to avoid code duplication:
```typescript
const user = await createTestUser(...);
const token = await createTestSession(user.id);
```

## Debugging Tests

### Run Specific Test
```bash
bun test tests/api/users.test.ts
```

### Check Test Output
Bun test provides detailed output including:
- Failed assertions with actual vs expected values
- Which test file/line failed
- Errors from the test code

### Add Console Logs
```typescript
test("debug test", async () => {
  const response = await fetch(...);
  console.log("Response:", await response.json());
  // Your assertions
});
```

## Common Issues

### 1. Database Connection Failed
- Ensure MySQL is running
- Check DATABASE_URL in .env
- Create database if not exists

### 2. Server Not Responding
- Ensure API server is running on port 3000
- Check if port 3000 is already in use

### 3. Tests Timeout
- Increase test timeout if needed
- Check if database queries are slow
- Ensure database cleanup completes

### 4. Flaky Tests
- Tests should not depend on execution order
- Always clean database in beforeEach
- Avoid time-dependent assertions

## CI/CD Integration

To run tests in CI/CD pipeline:

```bash
# Install dependencies
bun install

# Run tests
bun test
```

Add to your CI/CD configuration to run tests on every commit.

## Coverage

Current test coverage includes:

- **API Endpoints:** 100% (4/4 endpoints)
- **Scenarios:** 40+ test scenarios
- **Test Categories:** Positive, Negative, Edge cases, Security
- **Target Coverage:** 80%+

Run with coverage:
```bash
bun test --coverage
```

## Contributing

When adding new features:

1. Add corresponding tests
2. Ensure all tests pass (`bun test`)
3. Maintain coverage above 80%
4. Follow test naming conventions
5. Use helper functions for consistency

## Resources

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [ElysiaJS Testing Guide](https://elysiajs.com/essential/testing.html)
- [Best Practices for Unit Testing](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Last Updated:** September 26, 2026
