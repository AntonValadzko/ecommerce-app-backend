import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DATABASE_ENTITIES, DATABASE_MIGRATIONS } from './database.constants';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get<{
          host: string;
          port: number;
          username: string;
          password: string;
          database: string;
        }>('database')!;

        return {
          type: 'postgres' as const,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          entities: DATABASE_ENTITIES,
          migrations: DATABASE_MIGRATIONS,
          migrationsRun: true,
          synchronize: false,
          extra: {
            max: 20,
          },
        };
      },
    }),
    TypeOrmModule.forFeature(DATABASE_ENTITIES),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
