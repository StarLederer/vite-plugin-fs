import fetch from 'node-fetch';

import { UserOptions } from 'src/plugin/Options';
import FsServer from '../../../src/plugin/server';
import { resolveOptions } from '../../../src/plugin/Options';
// import fs from '../../src/abstraction';

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
  done();
});

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

export default {};
