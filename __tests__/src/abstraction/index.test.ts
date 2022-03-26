import fetch from 'node-fetch';
import * as fs from 'fs/promises';

import { UserOptions } from 'src/plugin/Options';
import { SimpleStats } from 'src/common/ApiResponses';
import FsServer from '../../../src/plugin/server';
import { resolveOptions } from '../../../src/plugin/Options';

let server: FsServer;

beforeAll(() => {
  const options: UserOptions = {
    rootDir: '__tests__/assets',
  };
  server = new FsServer(resolveOptions(options));
  server.start(true);
});

afterAll((done) => {
  server.stop();
  fs.rm('./__tests__/assets/newdirectory', { recursive: true }).then(() => {}).catch(() => {});
  fs.rm('./__tests__/assets/autodirectory', { recursive: true }).then(() => {}).catch(() => {});
  done();
});

// readdir

describe('readdir request of __tests__/assets', () => {
  it('should return the correct file tree', async () => {
    const response = await fetch('http://localhost:7070?command=readdir');
    const data = await response.json() as string[];
    expect(response.status).toEqual(200);
    expect(data).toContain('file');
    expect(data).toContain('file2');
    expect(data).not.toContain('notfile');
  });

  it('should return correct file tree when ?withFileTypes=true', async () => {
    const response = await fetch('http://localhost:7070?command=readdir&withFileTypes=true');
    const data = await response.json() as { name: string; dir: boolean }[];
    expect(response.status).toEqual(200);
    expect(data).toEqual(expect.arrayContaining([
      { name: 'file', dir: false },
      { name: 'directory', dir: true },
    ]));
  });
});

describe('readdir request of __tests__/assets/notdirectory', () => {
  it('should return error 404', async () => {
    const response = await fetch('http://localhost:7070/notdirectory?command=readdir');
    expect(response.status).toEqual(404);
  });
});

describe('readdir request of __tests__/assets/file', () => {
  it('should return error 400', async () => {
    const response = await fetch('http://localhost:7070/file?command=readdir');
    expect(response.status).toEqual(400);
  });
});

// readFile

describe('readFile request of __tests__/assets/file', () => {
  it('should return empty string', async () => {
    const response = await fetch('http://localhost:7070/file2?command=readFile');
    const data = await response.text();
    expect(response.status).toEqual(200);
    expect(data).toContain('');
  });
});

describe('readFile request of __tests__/assets/file2', () => {
  it('should return \'file2 content\'', async () => {
    const response = await fetch('http://localhost:7070/file2?command=readFile');
    const data = await response.text();
    expect(response.status).toEqual(200);
    expect(data).toContain('file2 content');
  });
});

describe('readFile request of __tests__/assets/directory/file3', () => {
  it('should return \'file3 content\'', async () => {
    const response = await fetch('http://localhost:7070/directory/file3?command=readFile');
    const data = await response.text();
    expect(response.status).toEqual(200);
    expect(data).toContain('file3 content');
  });
});

describe('readFile request of __tests__/assets/notfile', () => {
  it('should return error 404', async () => {
    const response = await fetch('http://localhost:7070/notfile?command=readFile');
    expect(response.status).toEqual(404);
  });
});

describe('readFile request of __tests__/assets/directory', () => {
  it('should return error 400', async () => {
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

  it('should not stat entries that don\'t exist', async () => {
    const response = await fetch('http://localhost:7070/notfile?command=stat');
    expect(response.status).toEqual(404);
  });
});

// writeFile

describe('writeFile request to __tests__/assets/newdirectory/newfile', () => {
  it('should write \'new data\' to the file', async () => {
    const response = await fetch('http://localhost:7070/newdirectory/newfile',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: 'new data' }),
      });
    const newdata = await fs.readFile('./__tests__/assets/newdirectory/newfile', 'utf-8');
    expect(response.status).toEqual(200);
    expect(newdata).toEqual('new data');
  });
});

// rm

describe('rm request', () => {
  it('should not be able to rm entries that don\'t exist', async () => {
    const response = await fetch('http://localhost:7070/notfile', { method: 'DELETE' });
    expect(response.status).toEqual(404);
  });

  it('should not be able to rm directories', async () => {
    try { await fs.mkdir('./__tests__/assets/autodirectory'); } catch (err) { /**/ }
    const response = await fetch('http://localhost:7070/autodirectory', { method: 'DELETE' });
    expect(response.status).toEqual(400);
    // TODO: check if the dir is actually kept
  });

  it('should be able to remove directories when with ?recursive=true', async () => {
    try { await fs.mkdir('./__tests__/assets/autodirectory'); } catch (err) { /**/ }
    const response = await fetch('http://localhost:7070/autodirectory?recursive=true', { method: 'DELETE' });
    expect(response.status).toEqual(200);
    // TODO: check if the dir is actually removed
  });
});

export default {};
