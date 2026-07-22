import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * Enforce one blog post per slug per locale. This backs the seed's idempotent
 * slug lookup and prevents the duplicate-post issue from recurring (previously
 * re-seeding could create multiple docs with the same slugName).
 *
 * NOTE: this fails if duplicates already exist in `blogs_locales` — clean them
 * first (`npm run remove:duplicate-blogs:remote` / `:production`, or delete the
 * extra copies in the admin UI).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE UNIQUE INDEX \`blogs_slug_name_idx\` ON \`blogs_locales\` (\`slug_name\`,\`_locale\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`blogs_slug_name_idx\`;`)
}
