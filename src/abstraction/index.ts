import { activePort } from '@vite-plugin-fs-runtime';
import type { SimpleDirent, SimpleStats } from 'src/common/ApiResponses';

const fs = {
  async readdir(path: string, withFileTypes?: boolean): Promise<SimpleDirent> {
    const res = await fetch(`http://localhost:${activePort}/${path}?command=readdir${withFileTypes ? '&withFileTypes=true' : ''}`);

    if (res.status === 200) {
      const data = await res.json() as SimpleDirent;
      return data;
    }

    throw new Error(await res.text());
  },

  async readFile(path: string): Promise<string> {
    const res = await fetch(`http://localhost:${activePort}/${path}?command=readFile`);

    if (res.status === 200) {
      const data = await res.text();
      return data;
    }

    throw new Error(await res.text());
  },

  async stat(path: string): Promise<SimpleStats> {
    const res = await fetch(`http://localhost:${activePort}/${path}?command=stat`);

    if (res.status === 200) {
      const data = await res.json() as SimpleStats;
      return data;
    }

    throw new Error(await res.text());
  },

  async writeFile(path: string, data: string): Promise<void> {
    await fetch(`http://localhost:${activePort}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
  },

  async rm(path: string, options?: { recursive: boolean }): Promise<void> {
    const res = await fetch(`http://localhost:${activePort}/${path}${options?.recursive ? '?recursive=true' : ''}`, {
      method: 'DELETE',
    });

    if (res.status === 200) {
      return;
    }

    throw new Error(await res.text());
  },
};

export default fs;
