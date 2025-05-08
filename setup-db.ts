import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./shared/schema";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL!);

async function runMigration() {
  console.log("マイグレーションを開始しています...");
  try {
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("マイグレーションが完了しました");
    
    console.log("初期データのシードを実行します...");
    await import("./seed");
    console.log("データシードが完了しました");
  } catch (error) {
    console.error("マイグレーションエラー:", error);
    process.exit(1);
  }
}

runMigration();
