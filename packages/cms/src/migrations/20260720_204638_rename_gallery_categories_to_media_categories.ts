import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  // Rename main category table.
  await db.run(sql`ALTER TABLE \`gallery_categories\` RENAME TO \`media_categories\`;`)

  // Recreate indexes on the main table with the new table name.
  await db.run(sql`DROP INDEX \`gallery_categories_slug_idx\`;`)
  await db.run(sql`DROP INDEX \`gallery_categories_updated_at_idx\`;`)
  await db.run(sql`DROP INDEX \`gallery_categories_created_at_idx\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_categories_slug_idx\` ON \`media_categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`media_categories_updated_at_idx\` ON \`media_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_categories_created_at_idx\` ON \`media_categories\` (\`created_at\`);`)

  // Recreate the locales table so its foreign key references media_categories.
  await db.run(sql`CREATE TABLE \`__new_media_categories_locales\` (
  \`label\` text NOT NULL,
  \`title\` text NOT NULL,
  \`description\` text,
  \`id\` integer PRIMARY KEY NOT NULL,
  \`_locale\` text NOT NULL,
  \`_parent_id\` integer NOT NULL,
  FOREIGN KEY (\`_parent_id\`) REFERENCES \`media_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  await db.run(sql`INSERT INTO \`__new_media_categories_locales\` SELECT * FROM \`gallery_categories_locales\`;`)
  await db.run(sql`DROP TABLE \`gallery_categories_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_media_categories_locales\` RENAME TO \`media_categories_locales\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_categories_locales_locale_parent_id_unique\` ON \`media_categories_locales\` (\`_locale\`,\`_parent_id\`);`)

  // Update media.category_id to reference media_categories without dropping media.
  await db.run(sql`DROP INDEX \`media_category_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` ADD COLUMN \`category_id_new\` integer REFERENCES \`media_categories\`(\`id\`);`)
  await db.run(sql`UPDATE \`media\` SET \`category_id_new\` = \`category_id\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`category_id\`;`)
  await db.run(sql`ALTER TABLE \`media\` RENAME COLUMN \`category_id_new\` TO \`category_id\`;`)
  await db.run(sql`CREATE INDEX \`media_category_idx\` ON \`media\` (\`category_id\`);`)

  // Update payload_locked_documents_rels to use media_categories_id.
  await db.run(sql`DROP INDEX \`payload_locked_documents_rels_gallery_categories_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD COLUMN \`media_categories_id\` integer REFERENCES \`media_categories\`(\`id\`);`)
  await db.run(sql`UPDATE \`payload_locked_documents_rels\` SET \`media_categories_id\` = \`gallery_categories_id\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`gallery_categories_id\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`media_categories_id\`);`)

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  // Reverse payload_locked_documents_rels.
  await db.run(sql`DROP INDEX \`payload_locked_documents_rels_media_categories_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD COLUMN \`gallery_categories_id\` integer REFERENCES \`gallery_categories\`(\`id\`);`)
  await db.run(sql`UPDATE \`payload_locked_documents_rels\` SET \`gallery_categories_id\` = \`media_categories_id\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`media_categories_id\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_gallery_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`gallery_categories_id\`);`)

  // Reverse media.category_id.
  await db.run(sql`DROP INDEX \`media_category_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` ADD COLUMN \`category_id_new\` integer REFERENCES \`gallery_categories\`(\`id\`);`)
  await db.run(sql`UPDATE \`media\` SET \`category_id_new\` = \`category_id\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`category_id\`;`)
  await db.run(sql`ALTER TABLE \`media\` RENAME COLUMN \`category_id_new\` TO \`category_id\`;`)
  await db.run(sql`CREATE INDEX \`media_category_idx\` ON \`media\` (\`category_id\`);`)

  // Reverse locales table.
  await db.run(sql`CREATE TABLE \`__old_media_categories_locales\` (
  \`label\` text NOT NULL,
  \`title\` text NOT NULL,
  \`description\` text,
  \`id\` integer PRIMARY KEY NOT NULL,
  \`_locale\` text NOT NULL,
  \`_parent_id\` integer NOT NULL,
  FOREIGN KEY (\`_parent_id\`) REFERENCES \`gallery_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`)
  await db.run(sql`INSERT INTO \`__old_media_categories_locales\` SELECT * FROM \`media_categories_locales\`;`)
  await db.run(sql`DROP TABLE \`media_categories_locales\`;`)
  await db.run(sql`ALTER TABLE \`__old_media_categories_locales\` RENAME TO \`gallery_categories_locales\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`gallery_categories_locales_locale_parent_id_unique\` ON \`gallery_categories_locales\` (\`_locale\`,\`_parent_id\`);`)

  // Reverse main category table.
  await db.run(sql`DROP INDEX \`media_categories_slug_idx\`;`)
  await db.run(sql`DROP INDEX \`media_categories_updated_at_idx\`;`)
  await db.run(sql`DROP INDEX \`media_categories_created_at_idx\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`gallery_categories_slug_idx\` ON \`gallery_categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`gallery_categories_updated_at_idx\` ON \`gallery_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`gallery_categories_created_at_idx\` ON \`gallery_categories\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`media_categories\` RENAME TO \`gallery_categories\`;`)

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
