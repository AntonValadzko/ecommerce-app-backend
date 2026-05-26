import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { ProductsModule } from './presentation/http/products/products.module';
import { CategoriesModule } from './presentation/http/categories/categories.module';
import { SavedSearchesModule } from './presentation/http/saved-searches/saved-searches.module';
import { SessionMiddleware } from './presentation/http/common/middleware/session.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    DatabaseModule,
    PersistenceModule,
    ProductsModule,
    CategoriesModule,
    SavedSearchesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
