import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * Repair navigation item labels that were stored as JSON blobs.
 *
 * The seed script originally wrote `label: { en: '...', 'zh-CN': '...', 'zh-TW': '...' }`
 * into a localized text field. Payload/D1 serialized that object to a JSON string in the
 * default-locale (`zh-TW`) row, so the admin UI rendered raw JSON instead of locale inputs.
 *
 * This migration parses those JSON blobs and creates proper per-locale rows:
 * - `en`
 * - `zh-CN`
 * - `zh-TW` (default locale, replaced with the actual zh-TW string)
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Create/update English rows parsed from the zh-TW JSON blob.
  await db.run(sql`
    INSERT OR REPLACE INTO \`navigation_items_locales\` (\`label\`, \`_locale\`, \`_parent_id\`)
    SELECT json_extract(\`label\`, '$.en'), 'en', \`_parent_id\`
    FROM \`navigation_items_locales\`
    WHERE \`_locale\` = 'zh-TW' AND \`label\` LIKE '{%}';
  `)

  // Create/update Simplified Chinese rows parsed from the zh-TW JSON blob.
  await db.run(sql`
    INSERT OR REPLACE INTO \`navigation_items_locales\` (\`label\`, \`_locale\`, \`_parent_id\`)
    SELECT json_extract(\`label\`, '$.zh-CN'), 'zh-CN', \`_parent_id\`
    FROM \`navigation_items_locales\`
    WHERE \`_locale\` = 'zh-TW' AND \`label\` LIKE '{%}';
  `)

  // Replace the zh-TW JSON blob with just the zh-TW string.
  await db.run(sql`
    UPDATE \`navigation_items_locales\`
    SET \`label\` = json_extract(\`label\`, '$.zh-TW')
    WHERE \`_locale\` = 'zh-TW' AND \`label\` LIKE '{%}';
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Reconstruct the original JSON blobs in the zh-TW rows.
  await db.run(sql`
    UPDATE \`navigation_items_locales\` AS target
    SET \`label\` = (
      SELECT json_object(
        'en', COALESCE((SELECT \`label\` FROM \`navigation_items_locales\` e WHERE e.\`_parent_id\` = target.\`_parent_id\` AND e.\`_locale\` = 'en'), ''),
        'zh-CN', COALESCE((SELECT \`label\` FROM \`navigation_items_locales\` c WHERE c.\`_parent_id\` = target.\`_parent_id\` AND c.\`_locale\` = 'zh-CN'), ''),
        'zh-TW', target.\`label\`
      )
    )
    WHERE target.\`_locale\` = 'zh-TW';
  `)

  // Remove the English and Simplified Chinese rows created by the up migration.
  await db.run(sql`DELETE FROM \`navigation_items_locales\` WHERE \`_locale\` IN ('en', 'zh-CN');`)
}
