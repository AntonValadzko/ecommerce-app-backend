import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { CliModule } from './cli.module';
import { ProductIndexerService } from '../../infrastructure/search/product-indexer.service';
import { OpenSearchIndexService } from '../../infrastructure/search/opensearch-index.service';
import { CacheInvalidationService } from '../../infrastructure/redis/cache-invalidation.service';
import { buildWinstonModuleOptions, createCliLogger } from '../../common/logger/winston.config';

const fallbackLogger = createCliLogger('SearchReindexCLI');

async function main() {
  const recreate = process.argv.includes('--recreate-index');

  const app = await NestFactory.createApplicationContext(CliModule, {
    logger: WinstonModule.createLogger(buildWinstonModuleOptions()),
  });

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  try {
    const config = app.get(ConfigService);
    if (!config.get<boolean>('opensearch.enabled')) {
      logger.warn('OpenSearch is disabled (OPENSEARCH_ENABLED=false); nothing to reindex');
      return;
    }

    const indexService = app.get(OpenSearchIndexService);
    if (recreate) {
      await indexService.deleteIndex();
    }
    await indexService.ensureIndex();

    const indexed = await app.get(ProductIndexerService).reindexAll();
    logger.log(`Reindexed ${indexed} products into OpenSearch`);
    if (config.get<boolean>('redis.enabled')) {
      await app.get(CacheInvalidationService).onCatalogMutation();
      logger.log('Redis: catalog cache version bumped');
    }
  } finally {
    await app.get(DataSource).destroy();
    await app.close();
  }
}

main().catch((err: unknown) => {
  fallbackLogger.error('Search reindex failed', { error: err });
  process.exit(1);
});
