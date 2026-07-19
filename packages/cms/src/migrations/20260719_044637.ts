import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`testimonies_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`testimonies\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`testimonies_rels_order_idx\` ON \`testimonies_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`testimonies_rels_parent_idx\` ON \`testimonies_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`testimonies_rels_path_idx\` ON \`testimonies_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`testimonies_rels_media_id_idx\` ON \`testimonies_rels\` (\`media_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_testimonies\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`highlighted\` integer DEFAULT false,
  	\`published\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_testimonies\`("id", "highlighted", "published", "updated_at", "created_at") SELECT "id", "highlighted", "published", "updated_at", "created_at" FROM \`testimonies\`;`)
  await db.run(sql`DROP TABLE \`testimonies\`;`)
  await db.run(sql`ALTER TABLE \`__new_testimonies\` RENAME TO \`testimonies\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`testimonies_updated_at_idx\` ON \`testimonies\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`testimonies_created_at_idx\` ON \`testimonies\` (\`created_at\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`testimonies_rels\`;`)
  await db.run(sql`ALTER TABLE \`testimonies\` ADD \`photo_id\` integer NOT NULL REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`testimonies_photo_idx\` ON \`testimonies\` (\`photo_id\`);`)
}
