// Database seeds entry point
// Run with: npm run db:seed

import { db } from "../index";

async function seed() {
  console.log("Starting database seeding...");

  try {
    // Add your seed logic here
    // Example:
    // await db.insert(users).values([...]);
    console.log("Database instance ready:", !!db);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
