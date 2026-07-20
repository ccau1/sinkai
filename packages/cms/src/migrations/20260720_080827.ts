import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`gallery_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`sort_order\` numeric DEFAULT 0,
  	\`show_in_gallery\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`gallery_categories_slug_idx\` ON \`gallery_categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`gallery_categories_updated_at_idx\` ON \`gallery_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`gallery_categories_created_at_idx\` ON \`gallery_categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`gallery_categories_locales\` (
  	\`label\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`gallery_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`gallery_categories_locales_locale_parent_id_unique\` ON \`gallery_categories_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`donations\` ADD \`notes\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`category_id\` integer REFERENCES gallery_categories(id);`)
  await db.run(sql`CREATE INDEX \`media_category_idx\` ON \`media\` (\`category_id\`);`)

  // Migrate old text media.category values into the new gallery-categories collection.
  await db.run(sql`INSERT OR IGNORE INTO \`gallery_categories\` (\`slug\`, \`sort_order\`, \`show_in_gallery\`) VALUES
    ('snow-disaster', 0, 1),
    ('old-schools', 0, 1),
    ('new-schools', 0, 1),
    ('field-trip', 0, 1),
    ('hk-charity', 0, 1),
    ('mountain', 0, 1),
    ('activities', 0, 1),
    ('news', 0, 1),
    ('others', 0, 1),
    ('general', 0, 0);
  `)
  await db.run(sql`INSERT OR IGNORE INTO \`gallery_categories_locales\` (\`label\`, \`title\`, \`description\`, \`_locale\`, \`_parent_id\`)
    SELECT \`slug\`, \`slug\`, NULL, 'en', \`id\` FROM \`gallery_categories\`
    UNION ALL
    SELECT \`slug\`, \`slug\`, NULL, 'zh-CN', \`id\` FROM \`gallery_categories\`
    UNION ALL
    SELECT \`slug\`, \`slug\`, NULL, 'zh-TW', \`id\` FROM \`gallery_categories\`;
  `)
  await db.run(sql`UPDATE \`media\` SET \`category_id\` = (SELECT \`id\` FROM \`gallery_categories\` WHERE \`slug\` = \`media\`.\`category\`);`)

  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`category\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`gallery_categories_id\` integer REFERENCES gallery_categories(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_gallery_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`gallery_categories_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`gallery_categories\`;`)
  await db.run(sql`DROP TABLE \`gallery_categories_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`category\` text,
  	\`sort_order\` numeric DEFAULT 0,
  	\`hidden\` integer DEFAULT false,
  	\`visibility\` text DEFAULT 'public' NOT NULL,
  	\`prefix\` text DEFAULT 'public',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric
  );
  `)
  await db.run(sql`INSERT INTO \`__new_media\`("id", "category", "sort_order", "hidden", "visibility", "prefix", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height") SELECT "id", "category", "sort_order", "hidden", "visibility", "prefix", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height" FROM \`media\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`ALTER TABLE \`__new_media\` RENAME TO \`media\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`blogs_id\` integer,
  	\`installations_id\` integer,
  	\`testimonies_id\` integer,
  	\`donations_id\` integer,
  	\`pages_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	\`forms_id\` integer,
  	\`form_submissions_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`blogs_id\`) REFERENCES \`blogs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`installations_id\`) REFERENCES \`installations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonies_id\`) REFERENCES \`testimonies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`donations_id\`) REFERENCES \`donations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`forms_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`form_submissions_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "blogs_id", "installations_id", "testimonies_id", "donations_id", "pages_id", "media_id", "users_id", "forms_id", "form_submissions_id") SELECT "id", "order", "parent_id", "path", "blogs_id", "installations_id", "testimonies_id", "donations_id", "pages_id", "media_id", "users_id", "forms_id", "form_submissions_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_blogs_id_idx\` ON \`payload_locked_documents_rels\` (\`blogs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_installations_id_idx\` ON \`payload_locked_documents_rels\` (\`installations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonies_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonies_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_donations_id_idx\` ON \`payload_locked_documents_rels\` (\`donations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_forms_id_idx\` ON \`payload_locked_documents_rels\` (\`forms_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_form_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`form_submissions_id\`);`)
  await db.run(sql`ALTER TABLE \`donations\` DROP COLUMN \`notes\`;`)
}
