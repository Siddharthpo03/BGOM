import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

// 1. Create a native pg Pool instance using your Neon URL
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// 2. Wrap it with Prisma's driver adapter
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 3. Pass the adapter straight into the constructor
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
  });

if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
