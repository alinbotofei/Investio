import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

if (process.env.NODE_ENV === "development" && process.env.DATABASE_URL) {
  prisma.$connect()
    .then(() => console.log("✅ Database connected successfully"))
    .catch((error: Error) => console.error("❌ Database connection failed:", error.message));
}
