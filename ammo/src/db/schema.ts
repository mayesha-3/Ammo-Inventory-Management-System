import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";

// ---------------- USERS ----------------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  pinNo: varchar("pin_no", { length: 10 }).notNull().unique(), // ✅ Added PIN number
  role: text("role").notNull().default("user"), // user, moderator, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------- SESSIONS ----------------
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------- AMMO INVENTORY ----------------
export const ammoInventory = pgTable("ammo_inventory", {
  id: serial("id").primaryKey(),
  caliber: varchar("caliber", { length: 50 }).notNull(),
  quantity: integer("quantity").notNull(),
});

// ---------------- SUPPLIERS ----------------
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactInfo: text("contact_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------- PURCHASES ----------------
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id")
    .notNull()
    .references(() => suppliers.id, { onDelete: "cascade" }),
  ammoId: integer("ammo_id")
    .notNull()
    .references(() => ammoInventory.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
});

// ---------------- ISSUANCES ----------------
export const issuances = pgTable("issuances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ammoId: integer("ammo_id")
    .notNull()
    .references(() => ammoInventory.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

//------------------------Orders-----------------
export const ammoOrders = pgTable("ammo_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  caliber: varchar("caliber", { length: 50 }).notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

//-------------Guns----------------
export const guns = pgTable("guns", {
  gunId: serial("gun_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  caliber: varchar("caliber", { length: 50 }).notNull(),
  notes: text("notes"),
});
