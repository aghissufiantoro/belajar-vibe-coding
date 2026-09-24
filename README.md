# Belajar Vibe Coding - Backend Project

Backend project dibangun dengan **Bun**, **ElysiaJS**, **Drizzle ORM**, dan database **MySQL**.

## 🛠 Tech Stack
- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [ElysiaJS](https://elysiajs.com)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Database**: MySQL (`mysql2` driver)
- **Language**: TypeScript

---

## 🚀 Persiapan & Instalasi

### 1. Prasyarat
- Pastikan [Bun](https://bun.sh) sudah terinstall di komputer Anda.
- Pastikan server MySQL aktif dan database telah dibuat (misal: `belajar_vibe_coding`).

### 2. Instalasi Dependensi
```bash
bun install
```

### 3. Konfigurasi Environment
Salin file `.env.example` ke `.env` dan sesuaikan kredensial MySQL Anda:
```bash
cp .env.example .env
```
Contoh isi `.env`:
```env
PORT=3000
DATABASE_URL="mysql://root:password@localhost:3306/belajar_vibe_coding"
```

---

## 🗄️ Database & Migrasi (Drizzle)

- **Generate migration files**:
  ```bash
  bun run db:generate
  ```
- **Push schema langsung ke database** (cocok untuk development):
  ```bash
  bun run db:push
  ```
- **Jalankan Drizzle Studio** (Web GUI database):
  ```bash
  bun run db:studio
  ```

---

## 🏃 Menjalankan Aplikasi

- **Development Mode** (dengan auto-reload):
  ```bash
  bun run dev
  ```
- **Production / Run**:
  ```bash
  bun run start
  ```

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/` | Health check server |
| `GET` | `/api/users` | Mengambil daftar semua user |
| `GET` | `/api/users/:id` | Mengambil detail user berdasarkan ID |
| `POST` | `/api/users` | Menambahkan user baru (`name`, `email`) |
| `PUT` | `/api/users/:id` | Mengubah data user (`name`, `email`) |
| `DELETE` | `/api/users/:id` | Menghapus user berdasarkan ID |

---

## 📂 Struktur Project
```text
.
├── src/
│   ├── db/
│   │   ├── index.ts        # Inisialisasi Drizzle ORM & Pool MySQL
│   │   └── schema.ts       # Definisi schema tabel MySQL
│   ├── routes/
│   │   └── users.ts        # Endpoint handler CRUD users
│   └── index.ts            # Entrypoint utama server Elysia
├── drizzle.config.ts       # Konfigurasi Drizzle Kit
├── .env.example            # Template konfigurasi environment
├── package.json
├── tsconfig.json
└── README.md
```
