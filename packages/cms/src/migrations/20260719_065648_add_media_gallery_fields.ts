import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`media\` ADD \`category\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sort_order\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`hidden\` integer DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`category\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sort_order\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`hidden\`;`)
}
