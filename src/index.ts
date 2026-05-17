import { createApp } from './app.js';
import { config } from './config/index.js';
import { runMigrations } from './infrastructure/database/migrate.js';
import { closeDatabase } from './infrastructure/database/connection.js';

runMigrations();

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`Product Catalog API running at http://localhost:${config.port}`);
  console.log(`API docs: http://localhost:${config.port}/api/docs`);
  console.log(`Environment: ${config.nodeEnv}`);
});

function shutdown() {
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
