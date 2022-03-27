import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import { resolve } from 'path';

import { UserOptions } from 'src/plugin/Options';
import { SimpleStats } from 'src/common/ApiResponses';
import FsServer from '../../../src/plugin/server';
import { resolveOptions } from '../../../src/plugin/Options';

let server: FsServer;

const userOptions: UserOptions = {
  rootDir: '__tests__/assets',
  goAboveRoot: false,
};

const options = resolveOptions(userOptions);

function resolveWithRoot(...args: string[]) {
  return resolve(options.rootDir, ...args);
}

beforeAll(() => {
  server = new FsServer(resolveOptions(options));
  server.start(true);
});

afterAll((done) => {
  server.stop();
  fs.rm(resolveWithRoot('newdirectory'), { recursive: true }).then(() => {}).catch(() => {});
  fs.rm(resolveWithRoot('autodirectory'), { recursive: true }).then(() => {}).catch(() => {});
  done();
});

// server

describe('FsServer', () => {
  it('should instantiate', () => {
    expect(server).toBeTruthy();
  });

  it('should resolve paths correctly', () => {
    expect(server.resolvePath('')).toEqual(resolve(options.rootDir));
    expect(server.resolvePath('test')).toEqual(resolve(options.rootDir, 'test'));
    expect(server.resolvePath('.test')).toEqual(resolve(options.rootDir, '.test'));
    expect(server.resolvePath('/test')).toEqual(resolve(options.rootDir, 'test'));
    expect(server.resolvePath('./test')).toEqual(resolve(options.rootDir, 'test'));
    // This is not possible with the current koa setup but let's sets it anyway
    expect(() => { server.resolvePath('../test'); }).toThrow();
    expect(() => { server.resolvePath('/../test'); }).toThrow();
  });
});

// readdir

describe('readdir request', () => {
  it('should return correct file trees', async () => {
    const response = await fetch('http://localhost:7070?command=readdir');
    const data = await response.json() as string[];
    expect(response.status).toEqual(200);
    expect(data).toContain('file');
    expect(data).toContain('file2');
    expect(data).not.toContain('notfile');
  });

  it('should return correct file trees when ?withFileTypes=true', async () => {
    const response = await fetch('http://localhost:7070?command=readdir&withFileTypes=true');
    const data = await response.json() as { name: string; dir: boolean }[];
    expect(response.status).toEqual(200);
    expect(data).toEqual(expect.arrayContaining([
      { name: 'file', dir: false },
      { name: 'directory', dir: true },
    ]));
  });

  it('should return 404 when reading entries that don\' exist', async () => {
    const response = await fetch('http://localhost:7070/notdirectory?command=readdir');
    expect(response.status).toEqual(404);
  });

  it('should return error 400 when reading files', async () => {
    const response = await fetch('http://localhost:7070/file?command=readdir');
    expect(response.status).toEqual(400);
  });
});

// readFile

describe('readFile request', () => {
  it('should read files correctly', async () => {
    const response = await fetch('http://localhost:7070/file2?command=readFile');
    const data = await response.text();
    expect(response.status).toEqual(200);
    expect(data).toContain('file2 content');
  });

  it('should read empty files correctly', async () => {
    const response = await fetch('http://localhost:7070/file2?command=readFile');
    const data = await response.text();
    expect(response.status).toEqual(200);
    expect(data).toContain('');
  });

  it('should read files in subdirectories correctly', async () => {
    const response = await fetch('http://localhost:7070/directory/file3?command=readFile');
    const data = await response.text();
    expect(response.status).toEqual(200);
    expect(data).toContain('file3 content');
  });

  it('should return 404 when reading files that don\'t exist', async () => {
    const response = await fetch('http://localhost:7070/notfile?command=readFile');
    expect(response.status).toEqual(404);
  });

  it('should return 400 when reading directories', async () => {
    const response = await fetch('http://localhost:7070/directory?command=readFile');
    expect(response.status).toEqual(400);
  });
});

// stat

describe('stat request', () => {
  it('should stat files corectly', async () => {
    const response = await fetch('http://localhost:7070/file?command=stat');
    const data = await response.json() as SimpleStats;
    expect(response.status).toEqual(200);
    expect(data.dir).toEqual(false);
  });

  it('should stat directories corectly', async () => {
    const response = await fetch('http://localhost:7070/directory?command=stat');
    const data = await response.json() as SimpleStats;
    expect(response.status).toEqual(200);
    expect(data.dir).toEqual(true);
  });

  it('should return 404 for entries that don\'t exist', async () => {
    const response = await fetch('http://localhost:7070/notfile?command=stat');
    expect(response.status).toEqual(404);
  });
});

// writeFile

describe('writeFile request', () => {
  it('should write files correctly', async () => {
    const response = await fetch('http://localhost:7070/newdirectory/newfile',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: 'new data' }),
      });
    const newdata = await fs.readFile(resolveWithRoot('newdirectory/newfile'), 'utf-8');
    expect(response.status).toEqual(200);
    expect(newdata).toEqual('new data');
  });
});

// rm

describe('rm request', () => {
  it('should rm files', async () => {
    try { await fs.writeFile(resolve(resolveWithRoot('autofile')), ''); } catch (err) { /**/ }
    const response = await fetch('http://localhost:7070/autofile', { method: 'DELETE' });
    const statPromise = fs.stat(resolveWithRoot('autofile'));
    expect(response.status).toEqual(200);
    await expect(statPromise).rejects.toBeTruthy();
  });

  it('should not rm entries that don\'t exist', async () => {
    const response = await fetch('http://localhost:7070/notfile', { method: 'DELETE' });
    expect(response.status).toEqual(404);
  });

  it('should not rm directories', async () => {
    try { await fs.mkdir(resolveWithRoot('autodirectory')); } catch (err) { /**/ }
    const response = await fetch('http://localhost:7070/autodirectory', { method: 'DELETE' });
    const statPromise = fs.stat(resolveWithRoot('autodirectory'));
    expect(response.status).toEqual(400);
    await expect(statPromise).resolves.toBeTruthy();
  });

  it('should rm directories when ?recursive=true', async () => {
    try { await fs.mkdir('./__tests__/assets/autodirectory'); } catch (err) { /**/ }
    const response = await fetch('http://localhost:7070/autodirectory?recursive=true', { method: 'DELETE' });
    const statPromise = fs.stat('./__tests__/assets/autodirectory');
    expect(response.status).toEqual(200);
    await expect(statPromise).rejects.toBeTruthy();
  });
});

export default {};
