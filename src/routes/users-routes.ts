import { Elysia, t } from "elysia";
import { registerUser, getCurrentUser } from "../services/users-service";

export const userRoutes = new Elysia({ prefix: "/api/users" })
  .get(
    "/current",
    async ({ headers, set }) => {
      try {
        // 1. Ambil token dari header Authorization
        const authorization = headers["authorization"];

        if (!authorization) {
          set.status = 401;
          return { error: "unauthorized" };
        }

        // 2. Parse token dari format "Bearer<token>" atau "Bearer <token>"
        const token = authorization.replace(/^Bearer\s*/i, "");

        if (!token) {
          set.status = 401;
          return { error: "unauthorized" };
        }

        // 3. Panggil service untuk mendapatkan data user
        const user = await getCurrentUser(token);

        return {
          data: user,
        };
      } catch (error: any) {
        set.status = 401;
        return {
          error: "unauthorized",
        };
      }
    }
  )
  .post(
    "/",
    async ({ body, set }) => {
      try {
        await registerUser(body.name, body.email, body.password);

        set.status = 201;
        return {
          data: "ok",
        };
      } catch (error: any) {
        set.status = 400;
        return {
          error: error.message || "Gagal mendaftarkan user",
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
    }
  );
