import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { DatabaseModule } from '../database.module';
import { PersistenceModule } from '../../infrastructure/persistence/persistence.module';
import { BulkLoadService } from '../bulk-load.service';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    DatabaseModule,
    PersistenceModule,
  ],
  providers: [BulkLoadService],
})
export class CliModule {}
