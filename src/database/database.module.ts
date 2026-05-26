import { Global, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { ProductEntity } from './entities/product.entity';
import { ProductAttributeEntity } from './entities/product-attribute.entity';
import { SavedSearchEntity } from './entities/saved-search.entity';
import { InitialSchema1700000000000 } from './migrations/1700000000000-InitialSchema';
import { Fts51700000000001 } from './migrations/1700000000001-Fts5';
import { runSeed } from './seed';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3' as const,
        database: config.get<string>('dbPath')!,
        entities: [CategoryEntity, ProductEntity, ProductAttributeEntity, SavedSearchEntity],
        migrations: [InitialSchema1700000000000, Fts51700000000001],
        migrationsRun: true,
        synchronize: false,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule implements OnModuleInit {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    const [row] = await this.dataSource.query(
      'SELECT COUNT(*) as c FROM products',
    ) as [{ c: number }];
    if (row.c === 0) {
      await runSeed(this.dataSource);
    }
  }
}
