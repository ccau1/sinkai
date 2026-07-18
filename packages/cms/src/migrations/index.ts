import * as migration_20260718_084142_initial from './20260718_084142_initial';
import * as migration_20260718_155544 from './20260718_155544';
import * as migration_20260718_160518 from './20260718_160518';

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
    name: '20260718_160518'
  },
];
