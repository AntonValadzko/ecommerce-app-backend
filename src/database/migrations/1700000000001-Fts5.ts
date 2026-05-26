import { MigrationInterface, QueryRunner } from 'typeorm';

export class Fts51700000000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
        name,
        description,
        sku,
        brand,
        content='products',
        content_rowid='id',
        tokenize='porter unicode61'
      )
    `);

    await queryRunner.query(`
      CREATE TRIGGER IF NOT EXISTS products_fts_insert AFTER INSERT ON products BEGIN
        INSERT INTO products_fts(rowid, name, description, sku, brand)
        VALUES (new.id, new.name, new.description, new.sku, new.brand);
      END
    `);

    await queryRunner.query(`
      CREATE TRIGGER IF NOT EXISTS products_fts_delete AFTER DELETE ON products BEGIN
        INSERT INTO products_fts(products_fts, rowid, name, description, sku, brand)
        VALUES ('delete', old.id, old.name, old.description, old.sku, old.brand);
      END
    `);

    await queryRunner.query(`
      CREATE TRIGGER IF NOT EXISTS products_fts_update AFTER UPDATE ON products BEGIN
        INSERT INTO products_fts(products_fts, rowid, name, description, sku, brand)
        VALUES ('delete', old.id, old.name, old.description, old.sku, old.brand);
        INSERT INTO products_fts(rowid, name, description, sku, brand)
        VALUES (new.id, new.name, new.description, new.sku, new.brand);
      END
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS products_fts_update`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS products_fts_delete`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS products_fts_insert`);
    await queryRunner.query(`DROP TABLE IF EXISTS products_fts`);
  }
}
