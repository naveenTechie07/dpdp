import app from './app';
import { env } from './config/env';
import { prisma, isDbConnected, ensureDbConnection } from './lib/prisma';

// Only start the HTTP listener if not running in Vercel serverless environment
if (!process.env.VERCEL) {
  (async function bootstrap() {
    try {
      // Attempt DB connection but don't crash if it fails
      await ensureDbConnection();

      const server = app.listen(env.PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 Srujana DPDP API running on port ${env.PORT}`);
        console.log(`   Environment: ${env.NODE_ENV}`);
        console.log(`   Database: ${isDbConnected() ? 'connected' : 'disconnected (set DATABASE_URL)'}`);
        console.log(`   Health Check: http://localhost:${env.PORT}/health`);
        console.log(`====================================================`);
      });

      const shutdown = async (signal: string) => {
        console.log(`\nReceived ${signal}. Shutting down gracefully...`);
        server.close(async () => {
          await prisma.$disconnect();
          console.log('Database connection closed. Process terminated.');
          process.exit(0);
        });
      };

      process.on('SIGTERM', () => shutdown('SIGTERM'));
      process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error) {
      console.error('Fatal error during server startup:', error);
      await prisma.$disconnect();
      process.exit(1);
    }
  })();
}

// Compatibility with Vercel Serverless & CommonJS
module.exports = app;
module.exports.default = app;
export default app;
