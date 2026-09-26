import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<void> => {
  // 1. Cek apakah email sudah terdaftar
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("email sudah terdaftar");
  }

  // 2. Hash password menggunakan bcrypt (salt round = 10)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Simpan user baru ke database
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });
};

export const getCurrentUser = async (token: string) => {
  // 1. Cari session berdasarkan token
  const sessionResult = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  const [session] = sessionResult;

  if (!session) {
    throw new Error("unauthorized");
  }

  // 2. Cari user berdasarkan userId dari session
  const userResult = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const [user] = userResult;

  if (!user) {
    throw new Error("unauthorized");
  }

  // 3. Kembalikan data user (tanpa password)
  return user;
};
