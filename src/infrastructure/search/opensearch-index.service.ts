import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OpenSearchClientProvider } from './opensearch.client';

@Injectable()
export class OpenSearchIndexService implements OnModuleInit {
  private readonly logger = new Logger(OpenSearchIndexService.name);

  constructor(private readonly os: OpenSearchClientProvider) {}

  async onModuleInit(): Promise<void> {
    if (!this.os.enabled || !this.os.client) return;
    await this.ensureIndex();
  }

  async ensureIndex(): Promise<void> {
    if (!this.os.enabled || !this.os.client) return;
    const { index } = this.os;
    const client = this.os.requireClient();
    const exists = await client.indices.exists({ index });
    if (exists.statusCode === 200) return;

    await client.indices.create({
      index,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              product_text: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'porter_stem'],
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'integer' },
            sku: { type: 'keyword' },
            name: { type: 'text', analyzer: 'product_text', fields: { keyword: { type: 'keyword' } } },
            slug: { type: 'keyword' },
            description: { type: 'text', analyzer: 'product_text' },
            brand: { type: 'keyword' },
            categoryId: { type: 'integer' },
            categoryName: { type: 'keyword' },
            categorySlug: { type: 'keyword' },
            price: { type: 'float' },
            compareAtPrice: { type: 'float' },
            currency: { type: 'keyword' },
            rating: { type: 'float' },
            reviewCount: { type: 'integer' },
            inStock: { type: 'boolean' },
            imageUrl: { type: 'keyword' },
            popularityScore: { type: 'integer' },
            createdAt: { type: 'date' },
            attributes: {
              type: 'nested',
              properties: {
                name: { type: 'keyword' },
                value: { type: 'keyword' },
              },
            },
          },
        },
      },
    });

    this.logger.log(`Created OpenSearch index "${index}"`);
  }

  async deleteIndex(): Promise<void> {
    if (!this.os.enabled || !this.os.client) return;
    const { index } = this.os;
    const client = this.os.requireClient();
    const exists = await client.indices.exists({ index });
    if (exists.statusCode === 200) {
      await client.indices.delete({ index });
    }
  }
}
