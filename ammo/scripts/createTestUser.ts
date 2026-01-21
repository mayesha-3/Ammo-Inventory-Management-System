import { db } from "../src/db/connection";
import { users } from "../src/db/schema";
import { initDatabase } from "../src/db/init";
import { hashPassword } from "../src/utils/auth";

async function createTestUser() {
  try {
    console.log("👤 Creating test user...");
    
    // Initialize database
    await initDatabase();
    
    // Create a regular user (for testing orders)
    const hashedPassword = await hashPassword("User@123");
    
    const newUser = await db
      .insert(users)
      .values({
        email: "user@ammo.com",
        password: hashedPassword,
        name: "Regular User",
        role: "user",
        pinNo: "1234",
      })
      .onConflictDoNothing()
      .returning();
    
    if (newUser.length > 0) {
      console.log("✅ Test user created successfully!");
      console.log(`   Email: user@ammo.com`);
      console.log(`   Password: User@123`);
      console.log(`   Role: user`);
      console.log(`   PIN: 1234`);
    } else {
      console.log("ℹ️ User already exists");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create user:", error);
    process.exit(1);
  }
}

createTestUser();
