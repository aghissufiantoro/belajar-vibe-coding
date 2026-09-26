# Belajar Vibe Coding - Backend API

Backend REST API dibangun dengan **Bun**, **ElysiaJS**, **Drizzle ORM**, dan **MySQL** untuk sistem autentikasi dan manajemen user.

[![Bun](https://img.shields.io/badge/Bun-1.0-black?logo=bun)](https://bun.sh)
[![ElysiaJS](https://img.shields.io/badge/ElysiaJS-1.4-blue)](https://elysiajs.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-green)](https://orm.drizzle.team)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql)](https://www.mysql.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)

---

## 📋 Table of Contents

- [Tentang Aplikasi](#-tentang-aplikasi)
- [Technology Stack](#-technology-stack)
- [Arsitektur Project](#-arsitektur-project)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Setup Project](#-setup-project)
- [Cara Menjalankan](#-cara-menjalankan)
- [Testing](#-testing)
- [Environment Variables](#-environment-variables)
- [Development Tools](#-development-tools)

---

## 🎯 Tentang Aplikasi

Aplikasi backend REST API yang menyediakan fitur:

- ✅ **User Registration** - Registrasi user baru dengan email, name, dan password
- ✅ **Authentication** - Login dengan email dan password, mendapat session token
- ✅ **Authorization** - Akses resource dengan bearer token authentication
- ✅ **Get Current User** - Mendapatkan data user yang sedang login

### Key Features

- 🔐 **Password Hashing** dengan bcrypt (salt round 10)
- 🎫 **Session-based Authentication** dengan UUID token
- ✅ **Input Validation** menggunakan TypeBox schema
- 🗄️ **Type-safe Database** dengan Drizzle ORM
- 🧪 **Comprehensive Testing** dengan Bun Test (40+ scenarios)
- 📝 **Auto TypeScript Inference** untuk type safety

---

## 🛠 Technology Stack

### Runtime & Framework
- **[Bun](https://bun.sh)** v1.0+ - Fast JavaScript/TypeScript runtime
- **[ElysiaJS](https://elysiajs.com)** v1.4+ - Fast & ergonomic web framework untuk Bun
- **[TypeScript](https://www.typescriptlang.org)** v5.0+ - Type-safe JavaScript

### Database & ORM
- **[MySQL](https://www.mysql.com)** v8.0+ - Relational database
- **[Drizzle ORM](https://orm.drizzle.team)** v0.45+ - TypeScript ORM
- **[mysql2](https://www.npmjs.com/package/mysql2)** v3.24+ - MySQL driver untuk Node.js

### Libraries
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** v3.0+ - Password hashing
- **[drizzle-kit](https://www.npmjs.com/package/drizzle-kit)** v0.31+ - Database migration tool

### Development Tools
- **Bun Test** - Built-in testing framework
- **TypeScript Compiler** - Type checking
- **Drizzle Studio** - Database GUI

---

## 📁 Arsitektur Project

### Struktur Folder

```
belajar-vibe-coding/
├── src/                          # Source code
│   ├── db/                       # Database configuration & schema
│   │   ├── index.ts             # Database connection (MySQL pool)
│   │   └── schema.ts            # Database schema definition (Drizzle)
│   ├── routes/                   # API route handlers
│   │   ├── auth-routes.ts       # Authentication endpoints (login)
│   │   └── users-routes.ts      # User endpoints (registration, current user)
│   ├── services/                 # Business logic layer
│   │   ├── auth-service.ts      # Authentication logic
│   │   └── users-service.ts     # User management logic
│   └── index.ts                  # Application entry point
├── tests/                        # Unit tests
│   ├── api/                     # API endpoint tests
│   │   ├── health.test.ts       # Health check tests
│   │   ├── users.test.ts        # User registration tests
│   │   ├── login.test.ts        # Login tests
│   │   └── current-user.test.ts # Get current user tests
│   ├── helpers/                 # Test utilities
│   │   └── test-utils.ts        # Helper functions for testing
│   └── setup.ts                 # Global test setup
├── drizzle/                      # Database migrations
│   ├── meta/                    # Migration metadata
│   └── *.sql                    # SQL migration files
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment variables template
├── drizzle.config.ts             # Drizzle ORM configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies & scripts
├── TESTING.md                    # Testing documentation
└── README.md                     # This file
```

### Arsitektur Layers

```
┌─────────────────────────────────────┐
│         API Layer (Routes)          │  ← HTTP handlers, validation
├─────────────────────────────────────┤
│      Business Logic (Services)      │  ← Core logic, bcrypt, token gen
├─────────────────────────────────────┤
│       Data Access (Drizzle ORM)     │  ← Type-safe queries
├─────────────────────────────────────┤
│         Database (MySQL)            │  ← Data persistence
└─────────────────────────────────────┘
```

### Penamaan Konvensi

- **Files**: `kebab-case.ts` (e.g., `users-routes.ts`, `auth-service.ts`)
- **Folders**: `lowercase` (e.g., `src/`, `routes/`, `services/`)
- **Functions**: `camelCase` (e.g., `registerUser`, `loginUser`)
- **Types/Interfaces**: `PascalCase` (e.g., `User`, `Session`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `BASE_URL`, `PORT`)

---

## 🗄️ Database Schema

### ERD (Entity Relationship Diagram)

```
┌─────────────────────┐          ┌──────────────────────┐
│       users         │          │      sessions        │
├─────────────────────┤          ├──────────────────────┤
│ id (PK)            │◄─────────│ id (PK)             │
│ name               │          │ token               │
│ email (unique)     │          │ user_id (FK)        │
│ password (hashed)  │          │ created_at          │
│ created_at         │          └──────────────────────┘
└─────────────────────┘
```

### Table: `users`

Menyimpan data pengguna.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | User ID |
| `name` | VARCHAR(255) | NOT NULL | Nama lengkap user |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email user (identifier) |
| `password` | VARCHAR(255) | NOT NULL | Password (hashed dengan bcrypt) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Waktu registrasi |

**Indexes:**
- Primary Key: `id`
- Unique Index: `email`

### Table: `sessions`

Menyimpan session token untuk autentikasi.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Session ID |
| `token` | VARCHAR(255) | NOT NULL | UUID token untuk auth |
| `user_id` | INT | NOT NULL, FOREIGN KEY → users.id | Reference ke user |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Waktu session dibuat |

**Relationships:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**Indexes:**
- Primary Key: `id`
- Foreign Key: `user_id`

---

## 🚀 API Endpoints

### Base URL

```
http://localhost:3000
```

---

### 1. Health Check

Cek status server.

**Endpoint:** `GET /`

**Request:**
```http
GET / HTTP/1.1
Host: localhost:3000
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Server ElysiaJS + Drizzle + MySQL is running! 🚀",
  "timestamp": "2026-09-26T10:30:00.000Z"
}
```

---

### 2. User Registration

Registrasi user baru.

**Endpoint:** `POST /api/users`

**Request:**
```http
POST /api/users HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `name`: Required, string, 1-255 characters
- `email`: Required, valid email format, max 255 characters, unique
- `password`: Required, min 6 characters, max 255 characters

**Success Response:** `201 Created`
```json
{
  "data": "ok"
}
```

**Error Response:** `422 Unprocessable Entity` (Validation Error)
```json
{
  "type": "validation",
  "on": "body",
  "property": "/email",
  "message": "Expected string to match 'email' format",
  "summary": "Property 'email' should be email"
}
```

**Error Response:** `400 Bad Request` (Business Logic Error)
```json
{
  "error": "email sudah terdaftar"
}
```

---

### 3. User Login

Login dengan email dan password, mendapat session token.

**Endpoint:** `POST /api/login`

**Request:**
```http
POST /api/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required, min 1 character

**Success Response:** `200 OK`
```json
{
  "data": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```
> Token adalah UUID yang valid

**Error Response:** `422 Unprocessable Entity` (Validation Error)
```json
{
  "type": "validation",
  "on": "body",
  "property": "/email",
  "message": "Expected string to match 'email' format"
}
```

**Error Response:** `400 Bad Request` (Authentication Failed)
```json
{
  "error": "email atau password salah"
}
```

---

### 4. Get Current User

Mendapatkan data user yang sedang login berdasarkan token.

**Endpoint:** `GET /api/users/current`

**Request:**
```http
GET /api/users/current HTTP/1.1
Host: localhost:3000
Authorization: Bearer<token>
```
atau
```http
GET /api/users/current HTTP/1.1
Host: localhost:3000
Authorization: Bearer <token>
```

**Success Response:** `200 OK`
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-09-26T10:00:00.000Z"
  }
}
```
> ⚠️ **Note:** Password **TIDAK** disertakan dalam response

**Error Response:** `401 Unauthorized`
```json
{
  "error": "unauthorized"
}
```

**Error Conditions:**
- Missing `Authorization` header
- Invalid token format
- Token tidak ditemukan di database
- User sudah dihapus

---

## ⚙️ Setup Project

### Prerequisites

Pastikan sudah terinstall:

- **[Bun](https://bun.sh)** v1.0+
  ```bash
  # Install Bun (Linux/macOS/WSL)
  curl -fsSL https://bun.sh/install | bash
  
  # Windows (PowerShell)
  powershell -c "irm bun.sh/install.ps1 | iex"
  ```

- **[MySQL](https://dev.mysql.com/downloads/mysql/)** v8.0+
  - Pastikan MySQL server sudah running
  - Buat database untuk project ini

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/aghissufiantoro/belajar-vibe-coding.git
   cd belajar-vibe-coding
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` sesuai konfigurasi MySQL:
   ```env
   PORT=3000
   DATABASE_URL="mysql://root:password@localhost:3306/belajar_vibe_coding"
   ```

4. **Create Database**
   ```sql
   CREATE DATABASE belajar_vibe_coding;
   ```

5. **Run Database Migrations**
   ```bash
   # Generate migration files (optional, sudah ada)
   bun run db:generate
   
   # Push schema ke database
   bun run db:push
   ```

6. **Verify Setup**
   ```bash
   # Cek koneksi database dengan Drizzle Studio
   bun run db:studio
   ```
   Buka browser ke `https://local.drizzle.studio`

---

## 🏃 Cara Menjalankan

### Development Mode

Jalankan server dengan auto-reload (hot reload):

```bash
bun run dev
```

Server akan running di `http://localhost:3000`

**Output:**
```
🦊 Elysia server is running at http://localhost:3000
```

### Production Mode

Jalankan server tanpa auto-reload:

```bash
bun run start
```

### Database Management

```bash
# Generate migration files dari schema changes
bun run db:generate

# Apply migrations ke database
bun run db:migrate

# Push schema langsung ke database (dev only)
bun run db:push

# Open Drizzle Studio (Database GUI)
bun run db:studio
```

---

## 🧪 Testing

### Menjalankan Tests

```bash
# Run semua tests
bun test

# Run tests dengan watch mode
bun test:watch

# Run specific test file
bun test tests/api/users.test.ts

# Run dengan coverage
bun test --coverage
```

### Test Coverage

- **Total Test Scenarios:** 40+
- **API Endpoints Tested:** 4/4 (100%)
- **Test Categories:**
  - ✅ Positive scenarios (happy path)
  - ✅ Validation errors
  - ✅ Business logic errors
  - ✅ Security tests (password hashing, authorization)
  - ✅ Edge cases & boundary tests

### Test Structure

```
tests/
├── api/                         # API endpoint tests
│   ├── health.test.ts          # 5 scenarios
│   ├── users.test.ts           # 15+ scenarios
│   ├── login.test.ts           # 10+ scenarios
│   └── current-user.test.ts    # 10+ scenarios
├── helpers/
│   └── test-utils.ts           # Helper functions
└── setup.ts                     # Global setup
```

**Dokumentasi lengkap:** [TESTING.md](./TESTING.md)

---

## 🔐 Environment Variables

### `.env` Configuration

```env
# Server Configuration
PORT=3000

# Database Configuration (MySQL)
DATABASE_URL="mysql://root:password@localhost:3306/belajar_vibe_coding"

# Individual Database Parameters (Optional)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=belajar_vibe_coding
```

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `3000` |
| `DATABASE_URL` | MySQL connection string | Yes | - |
| `DB_HOST` | MySQL host | No | `localhost` |
| `DB_PORT` | MySQL port | No | `3306` |
| `DB_USER` | MySQL username | No | `root` |
| `DB_PASSWORD` | MySQL password | No | - |
| `DB_NAME` | MySQL database name | No | - |

---

## 🛠 Development Tools

### Available NPM Scripts

```json
{
  "dev": "bun --watch src/index.ts",          // Development dengan hot reload
  "start": "bun src/index.ts",                // Production run
  "test": "bun test",                         // Run tests
  "test:watch": "bun test --watch",           // Run tests dengan watch mode
  "db:generate": "drizzle-kit generate",      // Generate migration files
  "db:migrate": "drizzle-kit migrate",        // Apply migrations
  "db:push": "drizzle-kit push",              // Push schema ke database
  "db:studio": "drizzle-kit studio"           // Open Drizzle Studio GUI
}
```

### Drizzle Studio

Web-based database GUI untuk manage database:

```bash
bun run db:studio
```

Fitur:
- Browse tables & data
- Run SQL queries
- Visualize relationships
- Edit data directly

---

## 📚 Libraries & Dependencies

### Production Dependencies

```json
{
  "elysia": "^1.4.30",          // Web framework
  "drizzle-orm": "^0.45.3",     // TypeScript ORM
  "mysql2": "^3.24.4",          // MySQL driver
  "bcryptjs": "^3.0.3"          // Password hashing
}
```

### Development Dependencies

```json
{
  "@types/bun": "latest",            // Bun type definitions
  "@types/bcryptjs": "^3.0.0",       // bcryptjs type definitions
  "drizzle-kit": "^0.31.11",         // Drizzle CLI tools
  "typescript": "^7"                  // TypeScript compiler
}
```

---

## 🏗️ Architecture Principles

### Layered Architecture

1. **Routes Layer** (`src/routes/`)
   - Handle HTTP requests/responses
   - Input validation with TypeBox
   - Error handling

2. **Services Layer** (`src/services/`)
   - Business logic
   - Data transformation
   - External service calls

3. **Data Layer** (`src/db/`)
   - Database schema
   - Database connection
   - Type-safe queries dengan Drizzle ORM

### Key Design Patterns

- **Separation of Concerns** - Each layer has single responsibility
- **Dependency Injection** - Services use DB connection, not instantiate
- **Type Safety** - TypeScript + Drizzle ORM untuk compile-time checks
- **Validation at Boundary** - Input validation di route layer
- **Password Security** - Bcrypt dengan salt round 10
- **Session-based Auth** - UUID tokens di database

---

## 📖 API Usage Examples

### Example 1: Complete Registration & Login Flow

```bash
# 1. Register new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "securePassword123"
  }'

# Response: {"data":"ok"}

# 2. Login to get token
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securePassword123"
  }'

# Response: {"data":"f47ac10b-58cc-4372-a567-0e02b2c3d479"}

# 3. Get current user with token
curl -X GET http://localhost:3000/api/users/current \
  -H "Authorization: Bearerf47ac10b-58cc-4372-a567-0e02b2c3d479"

# Response: 
# {
#   "data": {
#     "id": 1,
#     "name": "Alice Johnson",
#     "email": "alice@example.com",
#     "createdAt": "2026-09-26T10:00:00.000Z"
#   }
# }
```

### Example 2: Error Handling

```bash
# Invalid email format
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob",
    "email": "not-an-email",
    "password": "password123"
  }'

# Response: 422 Unprocessable Entity
# {
#   "type": "validation",
#   "property": "/email",
#   "message": "Expected string to match 'email' format"
# }
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Commit Message Convention:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test updates
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🔗 Links

- **Repository:** [github.com/aghissufiantoro/belajar-vibe-coding](https://github.com/aghissufiantoro/belajar-vibe-coding)
- **Bun Documentation:** [bun.sh/docs](https://bun.sh/docs)
- **ElysiaJS Documentation:** [elysiajs.com](https://elysiajs.com)
- **Drizzle ORM Documentation:** [orm.drizzle.team](https://orm.drizzle.team)

---

## 👨‍💻 Author

**M. Aghis Sufiantoro Saputra**
- GitHub: [@aghissufiantoro](https://github.com/aghissufiantoro)

---

## ⭐ Support

If you find this project helpful, please give it a ⭐ on GitHub!

---

**Last Updated:** September 26, 2026
