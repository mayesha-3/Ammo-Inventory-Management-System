import { db } from "../src/db/connection";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../src/utils/auth";

async function seedAdmin() {
  try {
    // Check if admin already exists
    const adminExists = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@ammo.com"))
      .limit(1);

    if (adminExists.length > 0) {
      console.log("✅ Admin user already exists");
      console.log("Email: admin@ammo.com");
      console.log("Password: Admin@123");
      return;
    }

    // Create admin user with hashed password
    const adminPassword = "Admin@123";
    const hashedPassword = await hashPassword(adminPassword);
    
    const newAdmin = await db.insert(users).values({
      email: "admin@ammo.com",
      password: hashedPassword,
      name: "System Administrator",
      pinNo: "0000",
      role: "admin",
    }).returning();

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@ammo.com");
    console.log("🔑 Password: Admin@123");
    console.log("⚠️  IMPORTANT: Change this password after first login!");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
  }
}

seedAdmin();
