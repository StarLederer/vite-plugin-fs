import * as nodeFs from 'fs/promises';
import { ApiResponse } from 'src/server/requests/get';

// nodeFs.rm

const fs = {
  async read(path: string): Promise<ApiResponse> {
    const res = await fetch(`http://localhost:7070/${path}`);
    const data = await res.json() as ApiResponse;
    return data;
  },

  async readdir(path: string): Promise<ApiResponse> {
    const res = await fetch(`http://localhost:7070/${path}?command=readdir`);
    const data = await res.json() as ApiResponse;
    return data;
  },

  async readFile(path: string): Promise<ApiResponse> {
    const res = await fetch(`http://localhost:7070/${path}?comman=readfile`);
    const data = await res.json() as ApiResponse;
    return data;
  },

  async stat(path: string): Promise<ApiResponse> {
    const res = await fetch(`http://localhost:7070/${path}?comman=stat`);
    const data = await res.json() as ApiResponse;
    return data;
  },

  async writeFile(path: string, data: string): Promise<void> {
    await fetch(`http://localhost:7070/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
  },

  async rm(path: string, options: { recursive: boolean; force: boolean }): Promise<void> {
    await fetch(`http://localhost:7070/${path}${options.recursive ? 'recursive=true' : ''}${options.force ? 'force=true' : ''}`, {
      method: 'DELETE',
    });
  },
};

export default fs;
