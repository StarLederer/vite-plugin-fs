import * as fs from 'fs/promises';
import * as path from 'path';
import express from 'express';
import cors from 'cors';

export default function startAPI(options: { rootDir: string }): Express.Application {
  const app = express();

  app.use(express.json());
  app.use(cors());

  //
  //
  // Requests

  // GET request
  app.get('/*', async (req, res) => {
    const absPath = path.resolve(options.rootDir + req.path);

    // TODO: command query key
    // * read (default)
    // * readdir
    // * read
    // * stat

    // No query keys
    try {
      const stat = await fs.stat(absPath);
      if (stat.isFile()) {
      // Request leads to file
        const data = await fs.readFile(absPath);
        res.status(200).send({
          type: 'file',
          data,
        });
      } else if (stat.isDirectory()) {
      // Request leads to directory
        const contents = await fs.readdir(absPath);
        res.status(200).send({
          type: 'directory',
          contents,
        });
      } else {
        res.sendStatus(404);
      }
    } catch (err: any) {
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
  // Start the app

  app.listen(7070, () => {
    console.log('fs server has started on port 7070');
  });

  return app;
}
