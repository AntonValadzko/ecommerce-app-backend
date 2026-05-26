import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class OpenSearchClientProvider {
  readonly client: Client;
  readonly index: string;

  constructor(configService: ConfigService) {
    const os = configService.get<{ node: string; index: string }>('opensearch')!;
    this.index = os.index;
    this.client = new Client({ node: os.node });
  }
}
