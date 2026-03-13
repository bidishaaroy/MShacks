import { PrismaClient } from "@prisma/client";
import { featureFlags } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  featureFlags.database
    ? globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
      })
    : null;

if (prisma && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
