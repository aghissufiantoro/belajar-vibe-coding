import { Elysia, t } from "elysia";
import { loginUser } from "../services/auth-service";

export const authRoutes = new Elysia({ prefix: "/api" })
  .post(
    "/login",
    async ({ body, set }) => {
      try {
        const token = await loginUser(body.email, body.password);

        return {
          data: token,
        };
      } catch (error: any) {
        set.status = 400;
        return {
          error: "email atau password salah",
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
    }
  );
