import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class OpenSearchClientProvider {
  readonly enabled: boolean;
  readonly client: Client | null;
  readonly index: string;

  constructor(configService: ConfigService) {
    const os = configService.get<{ node: string; index: string; enabled: boolean }>('opensearch')!;
    this.enabled = os.enabled;
    this.index = os.index;
    this.client = os.enabled ? new Client({ node: os.node }) : null;
  }

  requireClient(): Client {
    if (!this.client) {
      throw new Error('OpenSearch is disabled');
    }
    return this.client;
  }
}
