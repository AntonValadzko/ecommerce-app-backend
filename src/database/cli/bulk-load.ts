import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { WinstonModule } from 'nest-winston';
import { CliModule } from './cli.module';
import { BulkLoadService } from '../bulk-load.service';
import { ProductIndexerService } from '../../infrastructure/search/product-indexer.service';
import { OpenSearchIndexService } from '../../infrastructure/search/opensearch-index.service';
import { CacheInvalidationService } from '../../infrastructure/redis/cache-invalidation.service';
import { buildWinstonModuleOptions, createCliLogger } from '../../common/logger/winston.config';

const fallbackLogger = createCliLogger('BulkLoadCLI');

async function main() {
  const clear = process.argv.includes('--clear');
  const skipSearch = process.argv.includes('--skip-search');

  const app = await NestFactory.createApplicationContext(CliModule, {
    logger: WinstonModule.createLogger(buildWinstonModuleOptions()),
  });

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  try {
    const bulkLoad = app.get(BulkLoadService);
    const result = await bulkLoad.loadDemoCatalog(clear);
    logger.log(`Postgres: ${result.categories} categories, ${result.products} products`);

    if (!skipSearch) {
      await app.get(OpenSearchIndexService).ensureIndex();
      const indexed = await app.get(ProductIndexerService).reindexAll();
      logger.log(`OpenSearch: indexed ${indexed} documents`);
    }

    await app.get(CacheInvalidationService).onCatalogMutation();
    logger.log('Redis: catalog cache version bumped');
  } finally {
    await app.get(DataSource).destroy();
    await app.close();
  }
}

main().catch((err: unknown) => {
  fallbackLogger.error('Bulk load failed', { error: err });
  process.exit(1);
});
