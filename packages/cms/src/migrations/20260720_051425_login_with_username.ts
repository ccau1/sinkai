import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Clean up any leftover temp tables from a previously failed run.
  await db.run(sql`DROP TABLE IF EXISTS \`__new_media\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`__new_users\`;`)

  // Skip recreating `media`: earlier migrations already added the gallery and
  // visibility fields. The only difference from the generated migration was the
  // default value of `prefix`, which the `setPrefixFromVisibility` hook always
  // overrides before a document is inserted. Recreating `media` fails because
  // `blogs.cover_image_id` is NOT NULL with an `ON DELETE SET NULL` foreign-key
  // action, so SQLite/D1 cannot drop the table while foreign keys are enforced
  // (Payload runs migrations inside a transaction, where PRAGMA foreign_keys
  // cannot be disabled).

  // Add username support to users.
  await db.run(sql`ALTER TABLE \`users\` ADD COLUMN \`username\` text;`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_username_idx\` ON \`users\` (\`username\`);`)

  // SQLite does not allow changing a column's NOT NULL constraint directly.
  // Recreate the email column as nullable while preserving existing values.
  await db.run(sql`ALTER TABLE \`users\` ADD COLUMN \`email_new\` text;`)
  await db.run(sql`UPDATE \`users\` SET \`email_new\` = \`email\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`users_email_idx\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`email\`;`)
  await db.run(sql`ALTER TABLE \`users\` RENAME COLUMN \`email_new\` TO \`email\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Reverse the username support.
  await db.run(sql`DROP INDEX IF EXISTS \`users_username_idx\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`username\`;`)

  // Reverse the email nullable change. This requires a non-empty default for
  // existing rows; we use an empty string and rely on application-level
  // validation to enforce real email addresses going forward.
  await db.run(sql`ALTER TABLE \`users\` ADD COLUMN \`email_new\` text NOT NULL DEFAULT '';`)
  await db.run(sql`UPDATE \`users\` SET \`email_new\` = COALESCE(\`email\`, '');`)
  await db.run(sql`DROP INDEX IF EXISTS \`users_email_idx\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`email\`;`)
  await db.run(sql`ALTER TABLE \`users\` RENAME COLUMN \`email_new\` TO \`email\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
}
