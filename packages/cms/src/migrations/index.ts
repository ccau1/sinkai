import * as migration_20260718_084142_initial from './20260718_084142_initial';

export const migrations = [
  {
    up: migration_20260718_084142_initial.up,
    down: migration_20260718_084142_initial.down,
    name: '20260718_084142_initial'
  },
];
