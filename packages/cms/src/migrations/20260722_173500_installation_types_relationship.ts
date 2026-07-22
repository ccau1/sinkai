import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * Migration: convert Installations.type from a text/select field to a
 * relationship with the installation-types collection.
 *
 * This creates the installation-types collection tables, seeds the three
 * canonical types, migrates existing installations.type values to type_id,
 * and adds the installation-types relationship to payload_locked_documents_rels.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. Create installation-types collection tables.
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`installation_types\` (
  \t\`id\` integer PRIMARY KEY NOT NULL,
  \t\`key\` text NOT NULL,
  \t\`sort_order\` numeric DEFAULT 0,
  \t\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  \t\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`installation_types_key_idx\` ON \`installation_types\` (\`key\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`installation_types_updated_at_idx\` ON \`installation_types\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`installation_types_created_at_idx\` ON \`installation_types\` (\`created_at\`);`)

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`installation_types_locales\` (
  \t\`label\` text NOT NULL,
  \t\`id\` integer PRIMARY KEY NOT NULL,
  \t\`_locale\` text NOT NULL,
  \t\`_parent_id\` integer NOT NULL,
  \tFOREIGN KEY (\`_parent_id\`) REFERENCES \`installation_types\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`installation_types_locales_locale_parent_id_unique\` ON \`installation_types_locales\` (\`_locale\`,\`_parent_id\`);`)

  // 2. Seed the canonical installation types with fixed IDs so the data
  // migration below is deterministic.
  await db.run(sql`INSERT OR IGNORE INTO \`installation_types\` (\`id\`, \`key\`, \`sort_order\`) VALUES
  \t(1, 'school', 1),
  \t(2, 'bridge', 2),
  \t(3, 'water-tank', 3);`)

  await db.run(sql`INSERT OR IGNORE INTO \`installation_types_locales\` (\`label\`, \`_locale\`, \`_parent_id\`) VALUES
  \t('School', 'en', 1), ('学校', 'zh-CN', 1), ('學校', 'zh-TW', 1),
  \t('Bridge', 'en', 2), ('桥梁', 'zh-CN', 2), ('橋樑', 'zh-TW', 2),
  \t('Water Tank', 'en', 3), ('水塔', 'zh-CN', 3), ('水塔', 'zh-TW', 3);`)

  // 3. Add the relationship column to installations and migrate old text values.
  await db.run(sql`ALTER TABLE \`installations\` ADD COLUMN \`type_id\` integer REFERENCES \`installation_types\`(\`id\`);`)
  await db.run(sql`UPDATE \`installations\` SET \`type_id\` = CASE \`type\`
  \tWHEN 'school' THEN 1
  \tWHEN 'bridge' THEN 2
  \tWHEN 'water-tank' THEN 3
  END
  WHERE \`type\` IS NOT NULL;`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`installations_type_idx\` ON \`installations\` (\`type_id\`);`)

  // Drop the old select column. This is required: it is NOT NULL without a
  // default, so leaving it in place would make every new installation insert
  // fail. Values have been migrated to type_id above.
  await db.run(sql`ALTER TABLE \`installations\` DROP COLUMN \`type\`;`)

  // 4. Add installation-types to the locked-documents relationship table so
  // Payload's document-lock cleanup can join against it.
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD COLUMN \`installation_types_id\` integer REFERENCES \`installation_types\`(\`id\`);`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_installation_types_id_idx\` ON \`payload_locked_documents_rels\` (\`installation_types_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Restore the old text column and backfill it from the relationship.
  await db.run(sql`ALTER TABLE \`installations\` ADD COLUMN \`type\` text;`)
  await db.run(sql`UPDATE \`installations\` SET \`type\` = (SELECT \`key\` FROM \`installation_types\` WHERE \`id\` = \`installations\`.\`type_id\`);`)
  await db.run(sql`ALTER TABLE \`installations\` DROP COLUMN \`type_id\`;`)

  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`installation_types_id\`;`)

  await db.run(sql`DROP TABLE IF EXISTS \`installation_types_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`installation_types\`;`)
}
