import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  console.log("Running migrations...");

  const { migrate } = await import("drizzle-orm/libsql/migrator");
  const { db } = await import("../db");

  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migrations completed!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed!", err);
  process.exit(1);
});
