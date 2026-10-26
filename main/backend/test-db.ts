import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

async function run() {
  console.log('Testing Supabase Connection...');
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 30));
  try {
    const res = await prisma.$queryRawUnsafe('SELECT NOW() as now');
    console.log('SUCCESS! Query Result:', res);
    
    // Check if tables exist
    const tables = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('Public tables count:', (tables as any[]).length);
    console.log('Tables:', (tables as any[]).map(t => t.table_name));
  } catch (err: any) {
    console.error('FAILED with error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
