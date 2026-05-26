import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { CliModule } from './cli.module';
import { BulkLoadService } from '../bulk-load.service';
import { ProductIndexerService } from '../../infrastructure/search/product-indexer.service';
import { OpenSearchIndexService } from '../../infrastructure/search/opensearch-index.service';

async function main() {
  const clear = process.argv.includes('--clear');
  const skipSearch = process.argv.includes('--skip-search');

  const app = await NestFactory.createApplicationContext(CliModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const bulkLoad = app.get(BulkLoadService);
    const result = await bulkLoad.loadDemoCatalog(clear);
    console.log(`Postgres: ${result.categories} categories, ${result.products} products`);

    if (!skipSearch) {
      await app.get(OpenSearchIndexService).ensureIndex();
      const indexed = await app.get(ProductIndexerService).reindexAll();
      console.log(`OpenSearch: indexed ${indexed} documents`);
    }
  } finally {
    await app.get(DataSource).destroy();
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
