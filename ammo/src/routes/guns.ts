import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db } from "../db/connection";
import { guns } from "../db/schema";

const app = new OpenAPIHono();

const getGunsRoute = createRoute({
  method: "get",
  path: "/guns",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            guns: z.array(
              z.object({
                gunId: z.number(),
                name: z.string(),
                type: z.string(),
                caliber: z.string(),
                notes: z.string().nullable(),
              })
            ),
          }),
        },
      },
      description: "List of all guns in inventory",
    },
  },
  tags: ["Guns"],
  summary: "Get all guns",
  description: "Fetch all available weapons from the guns table",
});

app.openapi(getGunsRoute, async (c) => {
  const allGuns = await db
    .select({
      gunId: guns.gunId,
      name: guns.name,
      type: guns.type,
      caliber: guns.caliber,
      notes: guns.notes,
    })
    .from(guns);

  return c.json({ guns: allGuns });
});

export default app;
