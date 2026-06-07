import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { LoggerModule } from '../../common/logger/logger.module';
import { DatabaseModule } from '../database.module';
import { PersistenceModule } from '../../infrastructure/persistence/persistence.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { BulkLoadService } from '../bulk-load.service';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    LoggerModule,
    DatabaseModule,
    RedisModule,
    PersistenceModule,
  ],
  providers: [BulkLoadService],
})
export class CliModule {}
