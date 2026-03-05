import { PrismaClient } from '../../../generated/prisma/client.ts';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db'
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

// In dev, Vite may keep a cached PrismaClient instance across hot reloads.
// If the schema changes and the client gets regenerated, the cached instance may
// miss new model delegates (e.g. prisma.questionSuggestion) and cause runtime 500s.
// Detect this situation and recreate the client.
if (process.env.NODE_ENV !== 'production') {
  const maybeStale = prisma as unknown as Record<string, unknown>;
  if (typeof maybeStale.questionSuggestion === 'undefined') {
    prisma = new PrismaClient({ adapter });
  }
  globalForPrisma.prisma = prisma;
}

export { prisma };
