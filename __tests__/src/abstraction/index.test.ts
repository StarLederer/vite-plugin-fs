// import * as fs from 'fs/promises';
// import { resolve } from 'path';

// import { UserOptions } from 'src/plugin/Options';
// import FsServer from '../../../src/plugin/server';
import abstraction from '../../../src/abstraction';
// import { resolveOptions } from '../../../src/plugin/Options';

let lastFetch: { url: RequestInfo, init?: RequestInit };
global.fetch = jest.fn((url: RequestInfo, init?: RequestInit) => {
  lastFetch = { url, init };
  return { status: 200, text() { return ''; }, json() { return '{}'; } };
}) as jest.Mock;

// const userOptions: UserOptions = {
//   rootDir: '__tests__/assets',
//   goAboveRoot: false,
// };
// const options = resolveOptions(userOptions);

describe('abstraction', () => {
  it('should build correct readdir queries', async () => {
    await abstraction.readdir('');
    expect(lastFetch).toEqual({ url: 'http://localhost:7070/?command=readdir' });
    await abstraction.readdir('', true);
    expect(lastFetch).toEqual({ url: 'http://localhost:7070/?command=readdir&withFileTypes=true' });
  });
  it('should build correct readFile queries', async () => {
    await abstraction.readFile('');
    expect(lastFetch).toEqual({ url: 'http://localhost:7070/?command=readFile' });
  });
  it('should build correct stat queries', async () => {
    await abstraction.stat('');
    expect(lastFetch).toEqual({ url: 'http://localhost:7070/?command=stat' });
  });
  it('should build correct writeFile queries', async () => {
    await abstraction.writeFile('file', '');
    expect(lastFetch).toEqual({
      url: 'http://localhost:7070/file',
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{"data":""}',
      },
    });
  });
  it('should build correct rm queries', async () => {
    await abstraction.rm('');
    expect(lastFetch).toEqual({
      url: 'http://localhost:7070/',
      init: { method: 'DELETE' },
    });
    await abstraction.rm('', { recursive: true });
    expect(lastFetch).toEqual({
      url: 'http://localhost:7070/?recursive=true',
      init: { method: 'DELETE' },
    });
  });
});

export default {};
