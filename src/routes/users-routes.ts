import { Elysia, t } from "elysia";
import { registerUser } from "../services/users-service";

export const userRoutes = new Elysia({ prefix: "/api/users" })
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
