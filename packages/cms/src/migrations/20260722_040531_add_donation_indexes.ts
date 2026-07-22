import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE INDEX \`donations_name_idx\` ON \`donations\` (\`name\`);`)
  await db.run(sql`CREATE INDEX \`donations_email_idx\` ON \`donations\` (\`email\`);`)
  await db.run(sql`CREATE INDEX \`donations_status_idx\` ON \`donations\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`donations_currency_idx\` ON \`donations\` (\`currency\`);`)
  await db.run(sql`CREATE INDEX \`donations_transfer_date_idx\` ON \`donations\` (\`transfer_date\`);`)
  await db.run(sql`CREATE INDEX \`donations_amount_idx\` ON \`donations\` (\`amount\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`donations_amount_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`donations_transfer_date_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`donations_currency_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`donations_status_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`donations_email_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`donations_name_idx\`;`)
}
