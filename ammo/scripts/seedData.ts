import { db } from "../src/db/connection";
import { ammoInventory, ammoOrders, users } from "../src/db/schema";
import { initDatabase } from "../src/db/init";

async function seedData() {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Initialize database (creates tables if needed)
    await initDatabase();
    
    // Clear existing data (optional - comment out to keep data)
    console.log("🗑️ Clearing existing ammo inventory...");
    await db.delete(ammoInventory);
    
    console.log("🗑️ Clearing existing orders...");
    await db.delete(ammoOrders);
    
    // Add sample ammunition data
    console.log("📦 Adding sample ammunition...");
    const ammoData = [
      { caliber: "9mm", quantity: 5000, supplierId: null },
      { caliber: ".45 ACP", quantity: 3000, supplierId: null },
      { caliber: "5.56 NATO", quantity: 10000, supplierId: null },
      { caliber: ".22 LR", quantity: 15000, supplierId: null },
      { caliber: "12 Gauge", quantity: 2000, supplierId: null },
      { caliber: ".308 Winchester", quantity: 1500, supplierId: null },
      { caliber: ".40 S&W", quantity: 2500, supplierId: null },
      { caliber: "10mm Auto", quantity: 800, supplierId: null },
    ];
    
    const insertedAmmo = await db
      .insert(ammoInventory)
      .values(ammoData)
      .returning();
    
    console.log(`✅ Added ${insertedAmmo.length} ammunition types`);
    console.log("Sample ammo added:");
    insertedAmmo.forEach(ammo => {
      console.log(`   - ${ammo.caliber}: ${ammo.quantity} rounds`);
    });
    
    // Get regular user ID for orders (not admin)
    const regularUser = await db
      .select()
      .from(users)
      .where((t) => t.role === "user");
    
    if (regularUser.length > 0) {
      console.log("📋 Adding sample orders...");
      const userId = regularUser[0].id;
      
      const orderData = [
        { userId, caliber: "9mm", quantity: 500, status: "pending" },
        { userId, caliber: ".45 ACP", quantity: 200, status: "pending" },
        { userId, caliber: "5.56 NATO", quantity: 1000, status: "approved" },
        { userId, caliber: ".22 LR", quantity: 2000, status: "completed" },
      ];
      
      const insertedOrders = await db
        .insert(ammoOrders)
        .values(orderData)
        .returning();
      
      console.log(`✅ Added ${insertedOrders.length} sample orders`);
      console.log("Sample orders added:");
      insertedOrders.forEach(order => {
        console.log(`   - Order #${order.id}: ${order.quantity} x ${order.caliber} (${order.status})`);
      });
    } else {
      console.log("⚠️ No regular user found to create orders. Please create a user first.");
    }
    
    console.log("\n✨ Database seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedData();
