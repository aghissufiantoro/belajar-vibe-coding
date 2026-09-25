import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export const loginUser = async (email: string, password: string): Promise<string> => {
  // 1. Cari user berdasarkan email
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const [user] = userResult;

  if (!user) {
    throw new Error("email atau password salah");
  }

  // 2. Verifikasi password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("email atau password salah");
  }

  // 3. Generate token
  const token = crypto.randomUUID();

  // 4. Simpan ke tabel sessions
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  // 5. Kembalikan token
  return token;
};
