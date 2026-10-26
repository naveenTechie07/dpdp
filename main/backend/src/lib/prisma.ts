import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

let dbConnected = true;

export async function ensureDbConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    dbConnected = true;
    return true;
  } catch (error) {
    console.warn('[Database] Connection failed:', (error as Error).message);
    dbConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  if (!process.env.DATABASE_URL) {
    return false;
  }
  return dbConnected;
}
