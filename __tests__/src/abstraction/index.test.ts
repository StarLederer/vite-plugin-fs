import abstraction from '../../../src/abstraction';

let lastFetch: { url: RequestInfo, init?: RequestInit };
global.fetch = jest.fn((url: RequestInfo, init?: RequestInit) => {
  lastFetch = { url, init };
  return { status: 200, text() { return ''; }, json() { return '{}'; } };
}) as jest.Mock;

const testPort = 7070;
jest.mock('virtual:fs', () => ({ activePort: 7070 }), { virtual: true });

describe('abstraction', () => {
  it('should build correct readdir queries', async () => {
    await abstraction.readdir('');
    expect(lastFetch).toEqual({ url: `http://localhost:${testPort}/?cmd=readdir` });
    await abstraction.readdir('', true);
    expect(lastFetch).toEqual({ url: `http://localhost:${testPort}/?cmd=readdir&withFileTypes=true` });
  });

  it('should build correct readFile queries', async () => {
    await abstraction.readFile('');
    expect(lastFetch).toEqual({ url: `http://localhost:${testPort}/?cmd=readFile` });
  });

  it('should build correct stat queries', async () => {
    await abstraction.stat('');
    expect(lastFetch).toEqual({ url: `http://localhost:${testPort}/?cmd=stat` });
  });

  it('should build correct writeFile queries', async () => {
    const expected = {
      url: `http://localhost:${testPort}/file?cmd=writeFile`,
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: '',
      },
    };

    await abstraction.writeFile('file', '');
    expect(lastFetch).toEqual(expected);

    await abstraction.writeFile('file', new Uint8Array());
    expect(lastFetch).toEqual(expected);

    await abstraction.writeFile('file', new DataView(new ArrayBuffer(0)));
    expect(lastFetch).toEqual(expected);
  });

  it('should build correct rm queries', async () => {
    await abstraction.rm('');
    expect(lastFetch).toEqual({
      url: `http://localhost:${testPort}/?cmd=rm`,
      init: { method: 'DELETE' },
    });
    await abstraction.rm('', { recursive: true });
    expect(lastFetch).toEqual({
      url: `http://localhost:${testPort}/?cmd=rm&recursive=true`,
      init: { method: 'DELETE' },
    });
  });
});

export default {};
