import { activePort } from 'virtual:fs';
import type { SimpleDirent, SimpleStats } from 'src/common/ApiResponses';

const url = `http://localhost:${activePort}`;

const textDecoder = new TextDecoder();

const fs = {
  async readdir(path: string, withFileTypes?: boolean): Promise<SimpleDirent[]> {
    const res = await fetch(`${url}/${path}?cmd=readdir${withFileTypes ? '&withFileTypes=true' : ''}`);

    if (res.status === 200) {
      const data = await res.json() as SimpleDirent[];
      return data;
    }

    throw new Error(await res.text());
  },

  async readFile(path: string): Promise<string> {
    const res = await fetch(`${url}/${path}?cmd=readFile`);

    if (res.status === 200) {
      const data = await res.text();
      return data;
    }

    throw new Error(await res.text());
  },

  async stat(path: string): Promise<SimpleStats> {
    const res = await fetch(`${url}/${path}?cmd=stat`);

    if (res.status === 200) {
      const data = await res.json() as SimpleStats;
      return data;
    }

    throw new Error(await res.text());
  },

  async writeFile(path: string, data: string | ArrayBufferView | DataView): Promise<void> {
    await fetch(`${url}/${path}?cmd=writeFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: typeof data === 'string' ? data : textDecoder.decode(data),
    });
  },

  async rm(path: string, options?: { recursive?: boolean, force?: boolean }): Promise<void> {
    const res = await fetch(`${url}/${path}?cmd=rm${options?.recursive ? '&recursive=true' : ''}${options?.force ? '&force=true' : ''}`, {
      method: 'DELETE',
    });

    if (res.status === 200) {
      return;
    }

    throw new Error(await res.text());
  },
};

export default fs;
