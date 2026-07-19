import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`contact_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`from_email\` text DEFAULT 'contact@sinkai.org' NOT NULL,
  	\`notification_email\` text DEFAULT 'calvin@tribalorigin.com' NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`contact_settings\`;`)
}
