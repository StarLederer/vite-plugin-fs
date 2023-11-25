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
};

const options = resolveOptions(userOptions);

function resolveWithRoot(...args: string[]) {
  return resolve(options.rootDir, ...args);
}

let url: string;

beforeAll(async () => {
  server = new FsServer(resolveOptions(options));
  await server.start(true);
  if (server.activePort) { url = `http://localhost:${server.activePort}`; }
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
    const response = await fetch(`${url}?cmd=readdir`);
    const data = await response.json() as string[];
    expect(response.status).toEqual(200);
    expect(data).toContain('file');
    expect(data).toContain('file2');
    expect(data).not.toContain('notfile');
  });

  it('should return correct file trees when ?withFileTypes=true', async () => {
    const response = await fetch(`${url}?cmd=readdir&withFileTypes=true`);
    const data = await response.json() as { name: string; dir: boolean }[];
    expect(response.status).toEqual(200);
    expect(data).toEqual(expect.arrayContaining([
      { name: 'file', dir: false },
      { name: 'directory', dir: true },
    ]));
  });

  it('should return 404 when reading entries that don\' exist', async () => {
    const response = await fetch(`${url}/notdirectory?cmd=readdir`);
    expect(response.status).toEqual(404);
  });

  it('should return error 400 when reading files', async () => {
    const response = await fetch(`${url}/file?cmd=readdir`);
    expect(response.status).toEqual(400);
  });

  it('should support various UTF-8 characters in path', async () => {
    const response = await fetch(`${url}/directory 目录 каталог/file 文件 файл?cmd=readFile`);
    expect(response.status).toEqual(200);
  });
});

// readFile

describe('readFile request', () => {
  it('should read files correctly', async () => {
    const response = await fetch(`${url}/file2?cmd=readFile`);
    const data = await response.text();
    expect(response.status).toEqual(200);
    expect(data).toContain('file2 content');
  });

  it('should read empty files correctly', async () => {
    const response = await fetch(`${url}/file2?cmd=readFile`);
    const data = await response.text();
    expect(response.status).toEqual(200);
    expect(data).toContain('');
  });

  it('should read files in subdirectories correctly', async () => {
    const response = await fetch(`${url}/directory/file3?cmd=readFile`);
    const data = await response.text();
    expect(response.status).toEqual(200);
    expect(data).toContain('file3 content');
  });

  it('should return 404 when reading files that don\'t exist', async () => {
    const response = await fetch(`${url}/notfile?cmd=readFile`);
    expect(response.status).toEqual(404);
  });

  it('should return 400 when reading directories', async () => {
    const response = await fetch(`${url}/directory?cmd=readFile`);
    expect(response.status).toEqual(400);
  });

  it('should support various UTF-8 characters in path', async () => {
    const response = await fetch(`${url}/directory 目录 каталог/file 文件 файл?cmd=readFile`);
    expect(response.status).toEqual(200);
  });
});

// stat

describe('stat request', () => {
  it('should stat files corectly', async () => {
    const response = await fetch(`${url}/file?cmd=stat`);
    const data = await response.json() as SimpleStats;
    expect(response.status).toEqual(200);
    expect(data.dir).toEqual(false);
  });

  it('should stat directories corectly', async () => {
    const response = await fetch(`${url}/directory?cmd=stat`);
    const data = await response.json() as SimpleStats;
    expect(response.status).toEqual(200);
    expect(data.dir).toEqual(true);
  });

  it('should return 404 for entries that don\'t exist', async () => {
    const response = await fetch(`${url}/notfile?cmd=stat`);
    expect(response.status).toEqual(404);
  });

  it('should support various UTF-8 characters in path', async () => {
    const response = await fetch(`${url}/directory 目录 каталог/file 文件 файл?cmd=stat`);
    expect(response.status).toEqual(200);
  });
});

// writeFile

describe('writeFile request', () => {
  const textDecoder = new TextDecoder();

  it('should write strings to files correctly', async () => {
    const testData = 'new data';
    const testFilename = 'newfile-string';
    const response = await fetch(`${url}/newdirectory/${testFilename}?cmd=writeFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: testData,
    });
    const newdata = await fs.readFile(resolveWithRoot(`newdirectory/${testFilename}`), 'utf-8');
    expect(response.status).toEqual(200);
    expect(newdata).toEqual(testData);
  });

  it('should write TypedArrays to files correctly', async () => {
    const testData = new Uint8Array([84, 121, 112, 101, 100, 65, 114, 114, 97, 121]);
    const testFilename = 'newfile-typedarray';
    const response = await fetch(`${url}/newdirectory/${testFilename}?cmd=writeFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: textDecoder.decode(testData),
    });
    const newdata = await fs.readFile(resolveWithRoot(`newdirectory/${testFilename}`));
    expect(response.status).toEqual(200);
    expect(newdata.buffer).toEqual(testData.buffer);
  });

  it('should write DataViews to files correctly', async () => {
    const testData = new Uint8Array([68, 97, 116, 97, 86, 105, 101, 119]).buffer;
    const testFilename = 'newfile-dataview';
    const response = await fetch(`${url}/newdirectory/${testFilename}?cmd=writeFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: new DataView(testData),
    });
    const newdata = await fs.readFile(resolveWithRoot(`newdirectory/${testFilename}`));
    expect(response.status).toEqual(200);
    expect(newdata.buffer).toEqual(testData);
  });

  it('should support various UTF-8 characters in path', async () => {
    const testFilename = 'new file 文件 файл';
    const response = await fetch(`${url}/newdirectory/${testFilename}?cmd=writeFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: '',
    });
    const statPromise = fs.stat(resolveWithRoot(`newdirectory/${testFilename}`));
    expect(response.status).toEqual(200);
    await expect(statPromise).resolves.toBeTruthy();
  });
});

// rm

describe('rm request', () => {
  it('should rm files', async () => {
    try { await fs.writeFile(resolve(resolveWithRoot('autofile')), ''); } catch (err) { /**/ }
    const response = await fetch(`${url}/autofile?cmd=rm`, { method: 'DELETE' });
    const statPromise = fs.stat(resolveWithRoot('autofile'));
    expect(response.status).toEqual(200);
    await expect(statPromise).rejects.toBeTruthy();
  });

  it('should not rm entries that don\'t exist', async () => {
    const response = await fetch(`${url}/notfile?cmd=rm`, { method: 'DELETE' });
    expect(response.status).toEqual(404);
  });

  it('should not rm directories', async () => {
    try { await fs.mkdir(resolveWithRoot('autodirectory')); } catch (err) { /**/ }
    const response = await fetch(`${url}/autodirectory?cmd=rm`, { method: 'DELETE' });
    const statPromise = fs.stat(resolveWithRoot('autodirectory'));
    expect(response.status).toEqual(400);
    await expect(statPromise).resolves.toBeTruthy();
  });

  it('should rm directories when ?recursive=true', async () => {
    try { await fs.mkdir('./__tests__/assets/autodirectory'); } catch (err) { /**/ }
    const response = await fetch(`${url}/autodirectory?cmd=rm&recursive=true`, { method: 'DELETE' });
    const statPromise = fs.stat('./__tests__/assets/autodirectory');
    expect(response.status).toEqual(200);
    await expect(statPromise).rejects.toBeTruthy();
  });

  it('should support various UTF-8 characters in path', async () => {
    const testFilename = 'auto file 文件 файл';
    try { await fs.writeFile(resolve(resolveWithRoot(testFilename)), ''); } catch (err) { /**/ }
    const response = await fetch(`${url}/${testFilename}?cmd=rm`, { method: 'DELETE' });
    const statPromise = fs.stat(resolveWithRoot(testFilename));
    expect(response.status).toEqual(200);
    await expect(statPromise).rejects.toBeTruthy();
  });
});

export default {};
