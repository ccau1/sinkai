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
    name: '20260720_082055'
  },
];
