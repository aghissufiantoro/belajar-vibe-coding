import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

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
