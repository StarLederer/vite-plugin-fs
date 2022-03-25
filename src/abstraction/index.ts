import type { ApiResponse } from 'src/common/ApiResponse';

const error = {
  relayError: 'Internal API on the relay server',
  unknown: 'An error occurred while fetching to the relay server',
};

const fs = {
  async readdir(path: string): Promise<ApiResponse> {
    const res = await fetch(`http://localhost:7070/${path}?command=readdir`);

    if (res.status === 200) {
      const data = await res.json() as ApiResponse;
      return data;
    }

    if (res.status === 404) {
      throw new Error(`Directory ${path} not found`);
    }

    if (res.status === 500) {
      throw new Error(error.relayError);
    }

    throw new Error(error.unknown);
  },

  async readFile(path: string): Promise<ApiResponse> {
    const res = await fetch(`http://localhost:7070/${path}?command=readfile`);

    if (res.status === 200) {
      const data = await res.json() as ApiResponse;
      return data;
    }

    if (res.status === 404) {
      throw new Error(`File ${path} not found`);
    }

    if (res.status === 500) {
      throw new Error(error.relayError);
    }

    throw new Error(error.unknown);
  },

  async stat(path: string): Promise<ApiResponse> {
    const res = await fetch(`http://localhost:7070/${path}?command=stat`);

    if (res.status === 200) {
      const data = await res.json() as ApiResponse;
      return data;
    }

    if (res.status === 404) {
      throw new Error(`File or directory ${path} not found`);
    }

    if (res.status === 500) {
      throw new Error(error.relayError);
    }

    throw new Error(error.unknown);
  },

  async writeFile(path: string, data: string): Promise<void> {
    await fetch(`http://localhost:7070/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
  },

  async rm(path: string, options: { recursive: boolean; force: boolean }): Promise<void> {
    const res = await fetch(`http://localhost:7070/${path}${options.recursive ? 'recursive=true' : ''}${options.force ? 'force=true' : ''}`, {
      method: 'DELETE',
    });

    switch (res.status) {
      case 200:
        return;

      case 404:
        throw new Error(`File or directory ${path} not found`);

      case 405:
        throw new Error(`${path} is a directory. Directories can only be removed with the recursive option`);

      default:
        throw new Error(error.relayError);
    }
  },
};

export default fs;
