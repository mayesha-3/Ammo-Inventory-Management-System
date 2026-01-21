import { db } from "../src/db/connection";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function deleteOldAdmin() {
  try {
    await db.delete(users).where(eq(users.email, "admin@ammo.com"));
    console.log("✅ Old admin user deleted");
  } catch (error) {
    console.error("❌ Error deleting admin:", error);
  }
}

deleteOldAdmin();
