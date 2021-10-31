import * as fs from 'fs/promises';
import { resolve } from 'path';
import express from 'express';
import cors from 'cors';
import { Options } from './Options';

export default function startApi(rootDir: string, options: Options) {
  //
  //
  // Path resovler
  const root = resolve(`${rootDir}/${options.rootDir}`);

  function resolvePath(path: string): string {
    if (options.goAboveRoot) {
      return resolve(root + path);
    }

    let p = resolve(root + path);
    if (!p.startsWith(root)) p = root;
    return p;
  }

  //
  //
  // Express
  const app = express();

  app.use(express.json());
  app.use(cors());

  //
  //
  // GET
  app.get('/*', async (req, res) => {
    const path = resolvePath(req.path);

    // TODO: command query key
    // * read (default)
    // * readdir
    // * read
    // * stat

    // No query keys
    try {
      const stat = await fs.stat(path);
      if (stat.isFile()) {
        //
        // Request leads to file
        const data = await fs.readFile(path);
        res.status(200).send({
          type: 'file',
          data,
        });
      } else if (stat.isDirectory()) {
        //
        // Request leads to directory
        const contents = await fs.readdir(path);
        res.status(200).send({
          type: 'directory',
          contents,
        });
      } else {
        //
        // Request leads to something else
        // (which we don't want to deal with)
        res.sendStatus(404);
      }
    } catch (err: any) {
      //
      // Request leads nowhere
      if (err.code === 'ENOENT') {
        res.sendStatus(404);
      } else {
        res.sendStatus(500);
      }
    }
  });

  // TODO: Implement these

  // // POST request
  // app.post('/*', async (req, res) => {
  //   const filePath = path.resolve(config.rootDir + req.path);
  //   const fileData = req.body;

  //   try {
  //     const file = fileManager.getFile(filePath);
  //     await file.setField(fileData.key, fileData.value);
  //   } catch (err) {
  //     res.status(500).send();
  //   }

  //   res.status(200).send();
  // });

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

  //
  //
  // Start
  app.listen(7070, () => {
    console.warn('\x1b[41m!!!');
    console.warn(`fs server is running on port ${options.port} and on /_fs`);
    console.warn('Please be careful since any requests to this server can modify your actual file system');
    console.warn(`Clamping to ${root} is ${options.goAboveRoot ? 'OFF! A DELETE request to ../ will wipe the parent of this directory!' : 'on. Everything outside this directory is safe'}`);
    console.warn('!!!\x1b[0m');
  });
}
