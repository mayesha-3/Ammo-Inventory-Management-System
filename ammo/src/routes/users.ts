import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { authMiddleware, AuthUser } from "../middleware/auth";
import { requireRole } from "../middleware/roleChecker";
import { db } from "../db/connection";
import { users, issuances, ammoInventory, ammoOrders } from "../db/schema";
import { count, eq } from "drizzle-orm";

const app = new OpenAPIHono();

// Apply auth middleware to all routes
app.use("*", authMiddleware);

// Get Current User Route
const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            email: z.string(),
            name: z.string(),
            role: z.string(),
            pinNo: z.string(),
            createdAt: z.string(),
          }),
        },
      },
      description: "Current user information",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
      description: "Unauthorized",
    },
  },
  tags: ["Users"],
  summary: "Get current user",
  description: "Get information about the authenticated user",
  security: [
    {
      cookieAuth: [],
    },
  ],
});

app.openapi(getMeRoute, async (c) => {
  try {
    const user = c.get("user") as AuthUser;

    // Fetch full user details from database
    const [userDetails] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        pinNo: users.pinNo,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1);

    if (!userDetails) {
      return c.json(
        {
          error: "User not found",
        },
        404
      );
    }

    return c.json({
      id: userDetails.id,
      email: userDetails.email,
      name: userDetails.name,
      role: userDetails.role,
      pinNo: userDetails.pinNo,
      createdAt: userDetails.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Get me error:", error);
    return c.json(
      {
        error: "Internal server error",
      },
      500
    );
  }
});

// Get All Users Route
const getAllUsersRoute = createRoute({
  method: "get",
  path: "/allusers",
  request: {
    query: z.object({
      page: z.string().optional().openapi({
        example: "1",
      }),
      limit: z.string().optional().openapi({
        example: "10",
      }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            users: z.array(
              z.object({
                id: z.number(),
                email: z.string(),
                name: z.string(),
                role: z.string(),
                pinNo: z.string(),
                createdAt: z.string(),
              })
            ),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
            }),
          }),
        },
      },
      description: "List of all users with pagination",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
      description: "Unauthorized",
    },
  },
  tags: ["Users"],
  summary: "Get all users",
  description:
    "Get a paginated list of all users (requires admin or moderator role)",
  security: [
    {
      cookieAuth: [],
    },
  ],
});

app.openapi(getAllUsersRoute, async (c) => {
  // Check role manually
  const user = c.get("user") as any;
  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return c.json({ error: "Forbidden", message: "Admin or moderator access required" }, 403);
  }

  try {
    const query = c.req.valid("query");
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const offset = (page - 1) * limit;

    // Get total count
    const result = await db.select({ total: count() }).from(users);
    const total = result[0]?.total || 0;

    // Get users with pagination
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        pinNo: users.pinNo,
        createdAt: users.createdAt,
      })
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);

    return c.json({
      users: allUsers.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        pinNo: user.pinNo,
        createdAt: user.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total: Number(total),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return c.json(
      {
        error: "Internal server error",
      },
      500
    );
  }
});

const getIssuancesRoute = createRoute({
  method: "get",
  path: "/issuances",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            issuances: z.array(
              z.object({
                id: z.number(),
                caliber: z.string(),
                quantity: z.number(),
                issuedAt: z.string(),
              })
            ),
          }),
        },
      },
      description: "List of ammo issuances for current user",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
     },
      description: "Unauthorized",
    },
  },
  tags: ["Users"],
  summary: "Get my ammo issuances",
  description: "Get a history of ammunition issued to the authenticated user",
  security: [{ cookieAuth: [] }],
});

app.openapi(getIssuancesRoute, async (c) => {
  try {
    const user = c.get("user") as AuthUser;

    const myIssuances = await db
      .select({
        id: issuances.id,
        caliber: ammoInventory.caliber,
        quantity: issuances.quantity,
        issuedAt: issuances.issuedAt,
      })
      .from(issuances)
      .innerJoin(ammoInventory, eq(issuances.ammoId, ammoInventory.id))
      .where(eq(issuances.userId, user.userId));

    return c.json({
      issuances: myIssuances.map((i) => ({
        id: i.id,
        caliber: i.caliber,
        quantity: i.quantity,
        issuedAt: i.issuedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get issuances error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ---------------- Place Ammo Order ----------------
const orderAmmoRoute = createRoute({
  method: "post",
  path: "/order",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            caliber: z.string().openapi({ example: "9mm" }),
            quantity: z.number().openapi({ example: 100 }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            caliber: z.string(),
            quantity: z.number(),
            status: z.string(),
            createdAt: z.string(),
          }),
        },
      },
      description: "Ammo order placed successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
      description: "Unauthorized",
    },
  },
  tags: ["Users"],
  summary: "Place ammo order",
  description: "Place an order for ammunition not currently in inventory",
  security: [{ cookieAuth: [] }],
});

app.openapi(orderAmmoRoute, async (c) => {
  try {
    const user = c.get("user") as AuthUser;
    const body = await c.req.json();

    const [newOrder] = await db
      .insert(ammoOrders)
      .values({
        userId: user.userId,
        caliber: body.caliber,
        quantity: body.quantity,
        status: "pending",
      })
      .returning({
        id: ammoOrders.id,
        caliber: ammoOrders.caliber,
        quantity: ammoOrders.quantity,
        status: ammoOrders.status,
        createdAt: ammoOrders.createdAt,
      });

    return c.json(
      {
        id: newOrder.id,
        caliber: newOrder.caliber,
        quantity: newOrder.quantity,
        status: newOrder.status,
        createdAt: newOrder.createdAt.toISOString(),
      },
      201
    );
  } catch (error) {
    console.error("Order ammo error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});


//========================get inventory=================

const getAmmoInventoryRoute = createRoute({
  method: "get",
  path: "/inventory",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            ammo: z.array(
              z.object({
                id: z.number(),
                caliber: z.string(),
                quantity: z.number(),
                supplierId: z.number().nullable(),
                createdAt: z.string(),
              })
            ),
          }),
        },
      },
      description: "List of all ammunition in inventory",
    },
  },
  tags: ["Ammo"],
  summary: "Get ammo inventory",
  description: "Fetch all ammunition currently stored in inventory",
});

app.openapi(getAmmoInventoryRoute, async (c) => {
  const ammo = await db
    .select({
      id: ammoInventory.id,
      caliber: ammoInventory.caliber,
      quantity: ammoInventory.quantity,
      
    })
    .from(ammoInventory);

  return c.json({
    ammo: ammo.map((a) => ({
      id: a.id,
      caliber: a.caliber,
      quantity: a.quantity,
    })),
  });
});

// =============== GET ALL ORDERS (Admin) ===============
const getAllOrdersRoute = createRoute({
  method: "get",
  path: "/orders",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            orders: z.array(
              z.object({
                id: z.number(),
                userId: z.number(),
                caliber: z.string(),
                quantity: z.number(),
                status: z.string(),
                createdAt: z.string(),
              })
            ),
          }),
        },
      },
      description: "List of all ammo orders",
    },
  },
  tags: ["Orders"],
  summary: "Get all orders",
  description: "Get all ammunition orders (admin only)",
  security: [{ cookieAuth: [] }],
});

app.openapi(
  getAllOrdersRoute,
  async (c) => {
    // Check role manually
    const user = c.get("user") as any;
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      return c.json({ error: "Forbidden", message: "Admin or moderator access required" }, 403);
    }

    try {
      const allOrders = await db
        .select({
          id: ammoOrders.id,
          userId: ammoOrders.userId,
          caliber: ammoOrders.caliber,
          quantity: ammoOrders.quantity,
          status: ammoOrders.status,
          createdAt: ammoOrders.createdAt,
        })
        .from(ammoOrders);

      return c.json({
        orders: allOrders.map((order) => ({
          id: order.id,
          userId: order.userId,
          caliber: order.caliber,
          quantity: order.quantity,
          status: order.status,
          createdAt: order.createdAt.toISOString(),
        })),
      });
    } catch (error) {
      console.error("Get all orders error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// =============== UPDATE ORDER STATUS (Admin) ===============
const updateOrderStatusRoute = createRoute({
  method: "patch",
  path: "/orders/:id",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.enum(["pending", "approved", "rejected", "completed"]),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            status: z.string(),
            message: z.string(),
          }),
        },
      },
      description: "Order status updated",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
      description: "Order not found",
    },
  },
  tags: ["Orders"],
  summary: "Update order status",
  description: "Update the status of an ammunition order (admin only)",
  security: [{ cookieAuth: [] }],
});

app.openapi(
  updateOrderStatusRoute,
  async (c) => {
    // Check role manually
    const user = c.get("user") as any;
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      return c.json({ error: "Forbidden", message: "Admin or moderator access required" }, 403);
    }

    try {
      const id = c.req.param("id");
      const body = await c.req.json();

      const result = await db
        .update(ammoOrders)
        .set({ status: body.status })
        .where(eq(ammoOrders.id, Number(id)))
        .returning();

      if (result.length === 0) {
        return c.json({ error: "Order not found" }, 404);
      }

      return c.json({
        id: result[0].id,
        status: result[0].status,
        message: `Order status updated to ${body.status}`,
      });
    } catch (error) {
      console.error("Update order error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// =============== GET ALL AMMO INVENTORY (Admin) ===============
const getAllAmmoRoute = createRoute({
  method: "get",
  path: "/ammo/all",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            ammo: z.array(
              z.object({
                id: z.number(),
                caliber: z.string(),
                quantity: z.number(),
                supplierId: z.number().nullable(),
                createdAt: z.string(),
              })
            ),
          }),
        },
      },
      description: "List of all ammunition",
    },
  },
  tags: ["Ammo"],
  summary: "Get all ammo",
  description: "Get all ammunition inventory (admin only)",
  security: [{ cookieAuth: [] }],
});

app.openapi(
  getAllAmmoRoute,
  async (c) => {
    // Check role manually
    const user = c.get("user") as any;
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      return c.json({ error: "Forbidden", message: "Admin or moderator access required" }, 403);
    }

    try {
      const allAmmo = await db.select().from(ammoInventory);

      return c.json({
        ammo: allAmmo.map((a) => ({
          id: a.id,
          caliber: a.caliber,
          quantity: a.quantity,
          supplierId: a.supplierId,
          createdAt: a.createdAt?.toISOString() || new Date().toISOString(),
        })),
      });
    } catch (error) {
      console.error("Get all ammo error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// =============== CREATE NEW AMMO (Admin) ===============
const createAmmoRoute = createRoute({
  method: "post",
  path: "/ammo/create",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            caliber: z.string().min(1),
            quantity: z.number().min(1),
            supplierId: z.number().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            caliber: z.string(),
            quantity: z.number(),
            message: z.string(),
          }),
        },
      },
      description: "Ammo created successfully",
    },
  },
  tags: ["Ammo"],
  summary: "Create new ammo",
  description: "Add new ammunition to inventory (admin only)",
  security: [{ cookieAuth: [] }],
});

app.openapi(
  createAmmoRoute,
  async (c) => {
    // Check role manually
    const user = c.get("user") as any;
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      return c.json({ error: "Forbidden", message: "Admin or moderator access required" }, 403);
    }

    try {
      const body = await c.req.json();

      const [newAmmo] = await db
        .insert(ammoInventory)
        .values({
          caliber: body.caliber,
          quantity: body.quantity,
          supplierId: body.supplierId || null,
        })
        .returning();

      return c.json(
        {
          id: newAmmo.id,
          caliber: newAmmo.caliber,
          quantity: newAmmo.quantity,
          message: "Ammunition created successfully",
        },
        201
      );
    } catch (error) {
      console.error("Create ammo error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// =============== UPDATE AMMO (Admin) ===============
const updateAmmoRoute = createRoute({
  method: "patch",
  path: "/ammo/:id",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            caliber: z.string().optional(),
            quantity: z.number().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            caliber: z.string(),
            quantity: z.number(),
            message: z.string(),
          }),
        },
      },
      description: "Ammo updated successfully",
    },
  },
  tags: ["Ammo"],
  summary: "Update ammo",
  description: "Update ammunition details (admin only)",
  security: [{ cookieAuth: [] }],
});

app.openapi(
  updateAmmoRoute,
  async (c) => {
    // Check role manually
    const user = c.get("user") as any;
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      return c.json({ error: "Forbidden", message: "Admin or moderator access required" }, 403);
    }

    try {
      const id = c.req.param("id");
      const body = await c.req.json();

      const result = await db
        .update(ammoInventory)
        .set({
          ...(body.caliber && { caliber: body.caliber }),
          ...(body.quantity !== undefined && { quantity: body.quantity }),
        })
        .where(eq(ammoInventory.id, Number(id)))
        .returning();

      if (result.length === 0) {
        return c.json({ error: "Ammo not found" }, 404);
      }

      return c.json({
        id: result[0].id,
        caliber: result[0].caliber,
        quantity: result[0].quantity,
        message: "Ammunition updated successfully",
      });
    } catch (error) {
      console.error("Update ammo error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// =============== DELETE AMMO (Admin) ===============
const deleteAmmoRoute = createRoute({
  method: "delete",
  path: "/ammo/:id",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: "Ammo deleted successfully",
    },
  },
  tags: ["Ammo"],
  summary: "Delete ammo",
  description: "Delete ammunition from inventory (admin only)",
  security: [{ cookieAuth: [] }],
});

app.openapi(
  deleteAmmoRoute,
  async (c) => {
    // Check role manually
    const user = c.get("user") as any;
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      return c.json({ error: "Forbidden", message: "Admin or moderator access required" }, 403);
    }

    try {
      const id = c.req.param("id");

      const result = await db
        .delete(ammoInventory)
        .where(eq(ammoInventory.id, Number(id)))
        .returning();

      if (result.length === 0) {
        return c.json({ error: "Ammo not found" }, 404);
      }

      return c.json({
        message: "Ammunition deleted successfully",
      });
    } catch (error) {
      console.error("Delete ammo error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

export default app;

