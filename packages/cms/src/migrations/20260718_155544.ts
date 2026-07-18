import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_roles\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_roles_order_idx\` ON \`users_roles\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`users_roles_parent_idx\` ON \`users_roles\` (\`parent_id\`);`)
  // Existing users were created before roles existed; default them to admin so they keep access.
  await db.run(sql`INSERT INTO \`users_roles\` (\`order\`, \`parent_id\`, \`value\`) SELECT 0, \`id\`, 'admin' FROM \`users\``)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_blogs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug_name_en\` text NOT NULL,
  	\`title_en\` text NOT NULL,
  	\`excerpt_en\` text NOT NULL,
  	\`content_en\` text,
  	\`legacy_content_en\` text,
  	\`slug_name_zh_c_n\` text NOT NULL,
  	\`title_zh_c_n\` text NOT NULL,
  	\`excerpt_zh_c_n\` text NOT NULL,
  	\`content_zh_c_n\` text,
  	\`legacy_content_zh_c_n\` text,
  	\`slug_name_zh_t_w\` text NOT NULL,
  	\`title_zh_t_w\` text NOT NULL,
  	\`excerpt_zh_t_w\` text NOT NULL,
  	\`content_zh_t_w\` text,
  	\`legacy_content_zh_t_w\` text,
  	\`short_id\` text,
  	\`cover_image_id\` integer NOT NULL,
  	\`date\` text NOT NULL,
  	\`published\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blogs\`("id", "slug_name_en", "title_en", "excerpt_en", "content_en", "legacy_content_en", "slug_name_zh_c_n", "title_zh_c_n", "excerpt_zh_c_n", "content_zh_c_n", "legacy_content_zh_c_n", "slug_name_zh_t_w", "title_zh_t_w", "excerpt_zh_t_w", "content_zh_t_w", "legacy_content_zh_t_w", "short_id", "cover_image_id", "date", "published", "updated_at", "created_at") SELECT "id", "slug_name_en", "title_en", "excerpt_en", "content_en", "legacy_content_en", "slug_name_zh_c_n", "title_zh_c_n", "excerpt_zh_c_n", "content_zh_c_n", "legacy_content_zh_c_n", "slug_name_zh_t_w", "title_zh_t_w", "excerpt_zh_t_w", "content_zh_t_w", "legacy_content_zh_t_w", "short_id", "cover_image_id", "date", "published", "updated_at", "created_at" FROM \`blogs\`;`)
  await db.run(sql`DROP TABLE \`blogs\`;`)
  await db.run(sql`ALTER TABLE \`__new_blogs\` RENAME TO \`blogs\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`blogs_cover_image_idx\` ON \`blogs\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`blogs_updated_at_idx\` ON \`blogs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`blogs_created_at_idx\` ON \`blogs\` (\`created_at\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_roles\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_blogs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug_name_en\` text NOT NULL,
  	\`slug_name_zh_c_n\` text NOT NULL,
  	\`slug_name_zh_t_w\` text NOT NULL,
  	\`short_id\` text NOT NULL,
  	\`title_en\` text NOT NULL,
  	\`title_zh_c_n\` text NOT NULL,
  	\`title_zh_t_w\` text NOT NULL,
  	\`excerpt_en\` text NOT NULL,
  	\`excerpt_zh_c_n\` text NOT NULL,
  	\`excerpt_zh_t_w\` text NOT NULL,
  	\`content_en\` text,
  	\`content_zh_c_n\` text,
  	\`content_zh_t_w\` text,
  	\`legacy_content_en\` text,
  	\`legacy_content_zh_c_n\` text,
  	\`legacy_content_zh_t_w\` text,
  	\`cover_image_id\` integer NOT NULL,
  	\`date\` text NOT NULL,
  	\`published\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_blogs\`("id", "slug_name_en", "slug_name_zh_c_n", "slug_name_zh_t_w", "short_id", "title_en", "title_zh_c_n", "title_zh_t_w", "excerpt_en", "excerpt_zh_c_n", "excerpt_zh_t_w", "content_en", "content_zh_c_n", "content_zh_t_w", "legacy_content_en", "legacy_content_zh_c_n", "legacy_content_zh_t_w", "cover_image_id", "date", "published", "updated_at", "created_at") SELECT "id", "slug_name_en", "slug_name_zh_c_n", "slug_name_zh_t_w", "short_id", "title_en", "title_zh_c_n", "title_zh_t_w", "excerpt_en", "excerpt_zh_c_n", "excerpt_zh_t_w", "content_en", "content_zh_c_n", "content_zh_t_w", "legacy_content_en", "legacy_content_zh_c_n", "legacy_content_zh_t_w", "cover_image_id", "date", "published", "updated_at", "created_at" FROM \`blogs\`;`)
  await db.run(sql`DROP TABLE \`blogs\`;`)
  await db.run(sql`ALTER TABLE \`__new_blogs\` RENAME TO \`blogs\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`blogs_cover_image_idx\` ON \`blogs\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`blogs_updated_at_idx\` ON \`blogs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`blogs_created_at_idx\` ON \`blogs\` (\`created_at\`);`)
}
