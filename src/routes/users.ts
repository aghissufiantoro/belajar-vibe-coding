import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export const userRoutes = new Elysia({ prefix: "/api/users" })
  .get("/", async () => {
    const allUsers = await db.select().from(users);
    return {
      success: true,
      data: allUsers,
    };
  })
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(id)))
        .limit(1);

      if (result.length === 0) {
        set.status = 404;
        return { success: false, message: "User not found" };
      }

      return {
        success: true,
        data: result[0],
      };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await db.insert(users).values({
          name: body.name,
          email: body.email,
        });

        const insertId = result[0].insertId;

        set.status = 201;
        return {
          success: true,
          message: "User created successfully",
          data: {
            id: insertId,
            name: body.name,
            email: body.email,
          },
        };
      } catch (error: any) {
        set.status = 400;
        return {
          success: false,
          message: error.message || "Failed to create user",
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
      }),
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, set }) => {
      try {
        await db
          .update(users)
          .set(body)
          .where(eq(users.id, Number(id)));

        return {
          success: true,
          message: "User updated successfully",
        };
      } catch (error: any) {
        set.status = 400;
        return {
          success: false,
          message: error.message || "Failed to update user",
        };
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        name: t.Optional(t.String()),
        email: t.Optional(t.String({ format: "email" })),
      }),
    }
  )
  .delete(
    "/:id",
    async ({ params: { id } }) => {
      await db.delete(users).where(eq(users.id, Number(id)));
      return {
        success: true,
        message: "User deleted successfully",
      };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  );
