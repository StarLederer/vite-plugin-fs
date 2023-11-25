import { activePort } from 'virtual:fs';
import type { SimpleDirent, SimpleStats } from 'src/common/ApiResponses';

const url = `http://localhost:${activePort}`;

const textDecoder = new TextDecoder();

async function readdir(path: string, withFileTypes?: false): Promise<string[]>;
async function readdir(path: string, withFileTypes?: true): Promise<SimpleDirent[]>;
async function readdir(path: string, withFileTypes?: boolean): Promise<string[] | SimpleDirent[]> {
  const res = await fetch(`${url}/${path}?cmd=readdir${withFileTypes ? '&withFileTypes=true' : ''}`);

  if (res.status !== 200) {
    throw new Error(await res.text());
  }

  if (withFileTypes) {
    return await res.json() as SimpleDirent[];
  }
  return await res.json() as string[];
}

async function readFile(path: string): Promise<string> {
  const res = await fetch(`${url}/${path}?cmd=readFile`);

  if (res.status === 200) {
    const data = await res.text();
    return data;
  }

  throw new Error(await res.text());
}

async function stat(path: string): Promise<SimpleStats> {
  const res = await fetch(`${url}/${path}?cmd=stat`);

  if (res.status === 200) {
    const data = await res.json() as SimpleStats;
    return data;
  }

  throw new Error(await res.text());
}

async function writeFile(path: string, data: string | ArrayBufferView | DataView): Promise<void> {
  await fetch(`${url}/${path}?cmd=writeFile`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: typeof data === 'string' ? data : textDecoder.decode(data),
  });
}

async function rm(path: string, options?: { recursive?: boolean, force?: boolean }): Promise<void> {
  const res = await fetch(`${url}/${path}?cmd=rm${options?.recursive ? '&recursive=true' : ''}${options?.force ? '&force=true' : ''}`, {
    method: 'DELETE',
  });

  if (res.status === 200) {
    return;
  }

  throw new Error(await res.text());
}

const fs = {
  readdir,
  readFile,
  stat,
  writeFile,
  rm,
};

export default fs;
