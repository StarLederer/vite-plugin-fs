import abstraction from '../../../src/abstraction';

const testPort = 7070;

let lastFetch: { url: RequestInfo, init?: RequestInit };
global.fetch = jest.fn((url: RequestInfo, init?: RequestInit) => {
  lastFetch = { url, init };
  return { status: 200, text() { return ''; }, json() { return '{}'; } };
}) as jest.Mock;

jest.mock('@vite-plugin-fs-runtime');

describe('abstraction', () => {
  it('should build correct readdir queries', async () => {
    await abstraction.readdir('');
    expect(lastFetch).toEqual({ url: `http://localhost:${testPort}/?command=readdir` });
    await abstraction.readdir('', true);
    expect(lastFetch).toEqual({ url: `http://localhost:${testPort}/?command=readdir&withFileTypes=true` });
  });
  it('should build correct readFile queries', async () => {
    await abstraction.readFile('');
    expect(lastFetch).toEqual({ url: `http://localhost:${testPort}/?command=readFile` });
  });
  it('should build correct stat queries', async () => {
    await abstraction.stat('');
    expect(lastFetch).toEqual({ url: `http://localhost:${testPort}/?command=stat` });
  });
  it('should build correct writeFile queries', async () => {
    await abstraction.writeFile('file', '');
    expect(lastFetch).toEqual({
      url: `http://localhost:${testPort}/file`,
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
      url: `http://localhost:${testPort}/`,
      init: { method: 'DELETE' },
    });
    await abstraction.rm('', { recursive: true });
    expect(lastFetch).toEqual({
      url: `http://localhost:${testPort}/?recursive=true`,
      init: { method: 'DELETE' },
    });
  });
});

export default {};
