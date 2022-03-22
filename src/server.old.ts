import * as fs from 'fs/promises';
import { resolve, dirname } from 'path';
import type { Stats } from 'fs';
import express from 'express';
import cors from 'cors';
import { Options } from './Options';

function start(rootDir: string, options: Options) {
  //
  //
  // Express
  const app = express();

  app.use(express.json());
  app.use(cors());

  //
  //
  // GET

  // Response types

  type FileResponse = {
    type: 'file';
    data: any;
  };

  type SimpleDirent = { name: string; dir: boolean; };
  type DirResponse = {
    type: 'dir';
    items: string[] | SimpleDirent[];
  };

  type SimpleStats = Stats & { dir: boolean; };
  type StatResponse = {
    type: 'stats';
    stats: SimpleStats;
  };

  type ErrorResponse = {
    type: 'error';
    code: number;
    message?: string;
  };

  type ApiResponse = FileResponse | DirResponse | StatResponse | ErrorResponse;

  // Readers

  async function readIfFile(
    path: string,
    stats: Stats,
  ): Promise<FileResponse | null> {
    if (stats.isFile()) {
      const data = await fs.readFile(path);
      return {
        type: 'file',
        data,
      };
    }

    return null;
  }

  async function readIfDir(
    path: string,
    stats: Stats,
    detailed = false,
  ): Promise<DirResponse | null> {
    if (stats.isDirectory()) {
      let items: any[];
      if (!detailed) {
        items = await fs.readdir(path);
      } else {
        const dirents = await fs.readdir(path, { withFileTypes: true });
        items = [];
        dirents.forEach((dirent) => {
          const simpleDirent: SimpleDirent = {
            name: dirent.name,
            dir: dirent.isDirectory(),
          };
          if (dirent.isFile() || dirent.isDirectory()) { items.push(simpleDirent); }
        });
      }
      return {
        type: 'dir',
        items,
      };
    }

    return null;
  }

  async function statIfSupported(stats: Stats): Promise<StatResponse | null> {
    if (stats.isFile() || stats.isDirectory()) {
      const simpleStats: SimpleStats = {
        ...stats,
        dir: stats.isDirectory(),
      };
      return {
        type: 'stats',
        stats: simpleStats,
      };
    }

    return null;
  }

  // Handler

  app.get('/*', async (req, res) => {
    const path = resolvePath(req.path);

    try {
      // Generate response
      let response: ApiResponse | null = null;
      const stats = await fs.stat(path);

      // .../request?command=...
      if (req.query.command) {
        if (req.query.command === 'readfile') {
          // readFile command
          response = await readIfFile(path, stats);
        } else if (req.query.command === 'readdir') {
          // readdir command
          response = await readIfDir(path, stats);
        } else if (req.query.command === 'readdir-detailed') {
          // readdir command
          response = await readIfDir(path, stats, true);
        } else if (req.query.command === 'stat') {
          // stat command
          response = await statIfSupported(stats);
        } else {
          // invalid command
          response = {
            type: 'error',
            code: 500,
            message: `Unknown command ${req.query.command}`,
          };
        }
      } else {
        // no command (try to read file and dir)
        response = (await readIfFile(path, stats)) ?? (await readIfDir(path, stats));
      }

      // Check if response is null
      if (response) {
        // Check if response is an ErrorResponse
        if (response.type !== 'error') {
          res.status(200).send(response);
        } else {
          res.status(response.code).send(response.message);
        }
      } else {
        // Response is null
        res.sendStatus(500);
      }
    } catch (err: any) {
      // Could not fs.stat() the path
      if (err.code === 'ENOENT') {
        res.sendStatus(404);
      } else {
        res.sendStatus(500);
      }
    }
  });

  // TODO: Implement these

  // POST request
  app.post('/*', async (req, res) => {
    const path = resolvePath(req.path);
    const dir = dirname(path);
    const { data } = req.body;

    try {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (err: any) {
        // Couldn't mkdir, assume it exists
      }

      await fs.writeFile(path, data);
      res.status(200).send();
    } catch (err) {
      // Couldn't writeFile
      res.status(500).send();
    }
  });

  // // DELETE request
  // app.delete('/*', async (req, res) => {
  //   const filePath = path.resolve(config.rootDir + req.path);

  //   try {
  //     await fs.unlink(filePath);
  //     fileManager.unlistFile(filePath);
  //     res.status(200).send();
  //   } catch (err) {
  //     res.status(500).send();
  //   }
  // });
}

export default start;
