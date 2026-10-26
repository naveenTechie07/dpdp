import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

let dbConnected = false;

export async function ensureDbConnection(): Promise<boolean> {
  if (dbConnected) return true;
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
  return dbConnected || !!process.env.DATABASE_URL;
}

