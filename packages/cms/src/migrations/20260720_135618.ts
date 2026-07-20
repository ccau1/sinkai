import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`forms_blocks_upload_mime_types\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`mime_type\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_upload\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_blocks_upload_mime_types_order_idx\` ON \`forms_blocks_upload_mime_types\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_upload_mime_types_parent_id_idx\` ON \`forms_blocks_upload_mime_types\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`forms_blocks_upload\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`upload_collection\` text NOT NULL,
  	\`width\` numeric,
  	\`max_file_size\` numeric,
  	\`required\` integer,
  	\`multiple\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_blocks_upload_order_idx\` ON \`forms_blocks_upload\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_upload_parent_id_idx\` ON \`forms_blocks_upload\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_upload_path_idx\` ON \`forms_blocks_upload\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`forms_blocks_upload_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_upload\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`forms_blocks_upload_locales_locale_parent_id_unique\` ON \`forms_blocks_upload_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`form_submissions_submission_uploads\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`field\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`form_submissions_submission_uploads_order_idx\` ON \`form_submissions_submission_uploads\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_submission_uploads_parent_id_idx\` ON \`form_submissions_submission_uploads\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`form_submissions_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`form_submissions_rels_order_idx\` ON \`form_submissions_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_rels_parent_idx\` ON \`form_submissions_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_rels_path_idx\` ON \`form_submissions_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_rels_media_id_idx\` ON \`form_submissions_rels\` (\`media_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_media_locales\` (
  	\`alt\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_media_locales\`("alt", "id", "_locale", "_parent_id") SELECT "alt", "id", "_locale", "_parent_id" FROM \`media_locales\`;`)
  await db.run(sql`DROP TABLE \`media_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_media_locales\` RENAME TO \`media_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_locales_locale_parent_id_unique\` ON \`media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`donations_rels\` ADD \`media_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`donations_rels_media_id_idx\` ON \`donations_rels\` (\`media_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`forms_blocks_upload_mime_types\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_upload\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_upload_locales\`;`)
  await db.run(sql`DROP TABLE \`form_submissions_submission_uploads\`;`)
  await db.run(sql`DROP TABLE \`form_submissions_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_donations_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`installations_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`donations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`installations_id\`) REFERENCES \`installations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_donations_rels\`("id", "order", "parent_id", "path", "installations_id") SELECT "id", "order", "parent_id", "path", "installations_id" FROM \`donations_rels\`;`)
  await db.run(sql`DROP TABLE \`donations_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_donations_rels\` RENAME TO \`donations_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`donations_rels_order_idx\` ON \`donations_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`donations_rels_parent_idx\` ON \`donations_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`donations_rels_path_idx\` ON \`donations_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`donations_rels_installations_id_idx\` ON \`donations_rels\` (\`installations_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_media_locales\` (
  	\`alt\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_media_locales\`("alt", "id", "_locale", "_parent_id") SELECT "alt", "id", "_locale", "_parent_id" FROM \`media_locales\`;`)
  await db.run(sql`DROP TABLE \`media_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_media_locales\` RENAME TO \`media_locales\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_locales_locale_parent_id_unique\` ON \`media_locales\` (\`_locale\`,\`_parent_id\`);`)
}
