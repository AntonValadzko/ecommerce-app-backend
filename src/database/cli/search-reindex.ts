import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { CliModule } from './cli.module';
import { ProductIndexerService } from '../../infrastructure/search/product-indexer.service';
import { OpenSearchIndexService } from '../../infrastructure/search/opensearch-index.service';

async function main() {
  const recreate = process.argv.includes('--recreate-index');

  const app = await NestFactory.createApplicationContext(CliModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const indexService = app.get(OpenSearchIndexService);
    if (recreate) {
      await indexService.deleteIndex();
    }
    await indexService.ensureIndex();

    const indexed = await app.get(ProductIndexerService).reindexAll();
    console.log(`Reindexed ${indexed} products into OpenSearch`);
  } finally {
    await app.get(DataSource).destroy();
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
