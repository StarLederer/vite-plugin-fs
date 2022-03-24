import type { Stats } from 'fs';

type FileResponse = {
  type: 'file';
  data: any;
};

type SimpleDirent = { name: string; dir: boolean; };
type DirResponse = {
  type: 'dir';
  items: string[] | SimpleDirent[];
};

type SimpleStats = Stats & { dir: boolean; };
type StatResponse = {
  type: 'stats';
  stats: SimpleStats;
};

type ErrorResponse = {
  type: 'error';
  code: number;
  message?: string;
};

type ApiResponse = FileResponse | DirResponse | StatResponse | ErrorResponse;

export type {
  FileResponse,
  DirResponse,
  StatResponse,
  ErrorResponse,
  ApiResponse,
  SimpleDirent,
  SimpleStats,
};
