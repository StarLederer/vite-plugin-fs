import * as fs from 'fs/promises';
import { resolve, dirname } from 'path';

import express from 'express';
import cors from 'cors';
import { Options } from './Options';

function start(rootDir: string, options: Options) {
  //
  //
  // Express
  const app = express();

  // Handler

  app.get('/*', async (req, res) => {

  });

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

  // TODO: Implement these

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
