import type { Stats } from 'fs';

type SimpleDirent = { name: string; dir: boolean; };
type SimpleStats = Stats & { dir: boolean; };

export type {
  SimpleDirent,
  SimpleStats,
};
