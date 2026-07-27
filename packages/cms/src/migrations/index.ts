import * as migration_20260718_084142_initial from './20260718_084142_initial';
import * as migration_20260718_155544 from './20260718_155544';
import * as migration_20260718_160518 from './20260718_160518';
import * as migration_20260719_040838 from './20260719_040838';
import * as migration_20260719_043940 from './20260719_043940';
import * as migration_20260719_044637 from './20260719_044637';
import * as migration_20260719_065648_add_media_gallery_fields from './20260719_065648_add_media_gallery_fields';
import * as migration_20260719_120312_add_media_visibility_prefix from './20260719_120312_add_media_visibility_prefix';
import * as migration_20260719_132841 from './20260719_132841';
import * as migration_20260720_051425_login_with_username from './20260720_051425_login_with_username';
import * as migration_20260720_071941 from './20260720_071941';
import * as migration_20260720_080827 from './20260720_080827';
import * as migration_20260720_082055 from './20260720_082055';
import * as migration_20260720_135618 from './20260720_135618';
import * as migration_20260720_204638_rename_gallery_categories_to_media_categories from './20260720_204638_rename_gallery_categories_to_media_categories';
import * as migration_20260722_040531_add_donation_indexes from './20260722_040531_add_donation_indexes';
import * as migration_20260722_072545_add_unique_blog_slug from './20260722_072545_add_unique_blog_slug';
import * as migration_20260722_073926_events from './20260722_073926_events';
import * as migration_20260722_140000_fix_navigation_localized_labels from './20260722_140000_fix_navigation_localized_labels';
import * as migration_20260722_173500_installation_types_relationship from './20260722_173500_installation_types_relationship';
import * as migration_20260727_014608 from './20260727_014608';

export const migrations = [
  {
    up: migration_20260718_084142_initial.up,
    down: migration_20260718_084142_initial.down,
    name: '20260718_084142_initial',
  },
  {
    up: migration_20260718_155544.up,
    down: migration_20260718_155544.down,
    name: '20260718_155544',
  },
  {
    up: migration_20260718_160518.up,
    down: migration_20260718_160518.down,
    name: '20260718_160518',
  },
  {
    up: migration_20260719_040838.up,
    down: migration_20260719_040838.down,
    name: '20260719_040838',
  },
  {
    up: migration_20260719_043940.up,
    down: migration_20260719_043940.down,
    name: '20260719_043940',
  },
  {
    up: migration_20260719_044637.up,
    down: migration_20260719_044637.down,
    name: '20260719_044637',
  },
  {
    up: migration_20260719_065648_add_media_gallery_fields.up,
    down: migration_20260719_065648_add_media_gallery_fields.down,
    name: '20260719_065648_add_media_gallery_fields',
  },
  {
    up: migration_20260719_120312_add_media_visibility_prefix.up,
    down: migration_20260719_120312_add_media_visibility_prefix.down,
    name: '20260719_120312_add_media_visibility_prefix',
  },
  {
    up: migration_20260719_132841.up,
    down: migration_20260719_132841.down,
    name: '20260719_132841',
  },
  {
    up: migration_20260720_051425_login_with_username.up,
    down: migration_20260720_051425_login_with_username.down,
    name: '20260720_051425_login_with_username',
  },
  {
    up: migration_20260720_071941.up,
    down: migration_20260720_071941.down,
    name: '20260720_071941',
  },
  {
    up: migration_20260720_080827.up,
    down: migration_20260720_080827.down,
    name: '20260720_080827',
  },
  {
    up: migration_20260720_082055.up,
    down: migration_20260720_082055.down,
    name: '20260720_082055',
  },
  {
    up: migration_20260720_135618.up,
    down: migration_20260720_135618.down,
    name: '20260720_135618',
  },
  {
    up: migration_20260720_204638_rename_gallery_categories_to_media_categories.up,
    down: migration_20260720_204638_rename_gallery_categories_to_media_categories.down,
    name: '20260720_204638_rename_gallery_categories_to_media_categories',
  },
  {
    up: migration_20260722_040531_add_donation_indexes.up,
    down: migration_20260722_040531_add_donation_indexes.down,
    name: '20260722_040531_add_donation_indexes',
  },
  {
    up: migration_20260722_072545_add_unique_blog_slug.up,
    down: migration_20260722_072545_add_unique_blog_slug.down,
    name: '20260722_072545_add_unique_blog_slug',
  },
  {
    up: migration_20260722_073926_events.up,
    down: migration_20260722_073926_events.down,
    name: '20260722_073926_events',
  },
  {
    up: migration_20260722_140000_fix_navigation_localized_labels.up,
    down: migration_20260722_140000_fix_navigation_localized_labels.down,
    name: '20260722_140000_fix_navigation_localized_labels',
  },
  {
    up: migration_20260722_173500_installation_types_relationship.up,
    down: migration_20260722_173500_installation_types_relationship.down,
    name: '20260722_173500_installation_types_relationship',
  },
  {
    up: migration_20260727_014608.up,
    down: migration_20260727_014608.down,
    name: '20260727_014608'
  },
];
