import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostgresInitial1700000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(512) NOT NULL,
        slug VARCHAR(512) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        brand VARCHAR(255) NOT NULL,
        category_id INTEGER NOT NULL REFERENCES categories(id),
        price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
        compare_at_price NUMERIC(12, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        rating NUMERIC(3, 1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
        review_count INTEGER NOT NULL DEFAULT 0,
        in_stock BOOLEAN NOT NULL DEFAULT TRUE,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        popularity_score INTEGER NOT NULL DEFAULT 0,
        image_url TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_attributes (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(128) NOT NULL,
        value VARCHAR(255) NOT NULL,
        UNIQUE (product_id, name, value)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE saved_searches (
        id UUID PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL,
        name VARCHAR(100) NOT NULL,
        query_json JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_products_category ON products(category_id)`);
    await queryRunner.query(`CREATE INDEX idx_products_brand ON products(brand)`);
    await queryRunner.query(`CREATE INDEX idx_products_price ON products(price)`);
    await queryRunner.query(`CREATE INDEX idx_products_rating ON products(rating)`);
    await queryRunner.query(`CREATE INDEX idx_products_stock ON products(in_stock)`);
    await queryRunner.query(`CREATE INDEX idx_products_popularity ON products(popularity_score DESC)`);
    await queryRunner.query(`CREATE INDEX idx_products_created ON products(created_at DESC)`);
    await queryRunner.query(`CREATE INDEX idx_saved_searches_session ON saved_searches(session_id)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS saved_searches`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_attributes`);
    await queryRunner.query(`DROP TABLE IF EXISTS products`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories`);
  }
}
