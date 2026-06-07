import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { LoggerModule } from './common/logger/logger.module';
import { DatabaseModule } from './database/database.module';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { ProductsModule } from './presentation/http/products/products.module';
import { CategoriesModule } from './presentation/http/categories/categories.module';
import { SavedSearchesModule } from './presentation/http/saved-searches/saved-searches.module';
import { HealthModule } from './presentation/http/health/health.module';
import { SessionMiddleware } from './presentation/http/common/middleware/session.middleware';
import { RedisRateLimitMiddleware } from './infrastructure/redis/redis-rate-limit.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    LoggerModule,
    DatabaseModule,
    RedisModule,
    PersistenceModule,
    ProductsModule,
    CategoriesModule,
    SavedSearchesModule,
    HealthModule,
  ],
  providers: [SessionMiddleware, RedisRateLimitMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RedisRateLimitMiddleware, SessionMiddleware)
      .exclude({ path: 'health', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
