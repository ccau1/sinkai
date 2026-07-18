import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` ADD \`permissions_manage_users\` integer;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`permissions_edit_blogs\` integer;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`permissions_edit_installations\` integer;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`permissions_upload_media\` integer;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`permissions_delete_media\` integer;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`permissions_view_unpublished\` integer;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`permissions_manage_users\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`permissions_edit_blogs\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`permissions_edit_installations\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`permissions_upload_media\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`permissions_delete_media\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`permissions_view_unpublished\`;`)
}
