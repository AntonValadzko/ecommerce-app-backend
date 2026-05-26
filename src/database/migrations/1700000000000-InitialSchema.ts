import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        brand TEXT NOT NULL,
        category_id INTEGER NOT NULL REFERENCES categories(id),
        price REAL NOT NULL CHECK (price >= 0),
        compare_at_price REAL CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
        currency TEXT NOT NULL DEFAULT 'USD',
        rating REAL NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
        review_count INTEGER NOT NULL DEFAULT 0,
        in_stock INTEGER NOT NULL DEFAULT 1,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        popularity_score INTEGER NOT NULL DEFAULT 0,
        image_url TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_attributes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        value TEXT NOT NULL,
        UNIQUE (product_id, name, value)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS saved_searches (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        name TEXT NOT NULL,
        query_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_products_stock ON products(in_stock)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_products_popularity ON products(popularity_score DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_saved_searches_session ON saved_searches(session_id)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS saved_searches`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_attributes`);
    await queryRunner.query(`DROP TABLE IF EXISTS products`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories`);
  }
}
