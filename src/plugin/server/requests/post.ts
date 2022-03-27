import * as fs from 'fs/promises';
import { dirname } from 'path';
import Router from 'koa-router';

//
//
// Main

export default function createRoutes(resolvePath: (path: string) => string): Router.IMiddleware {
  //
  // Post request routing

  const router = new Router();

  router.post(/.*/, async (ctx) => {
    let path;
    try {
      path = resolvePath(ctx.path);
    } catch (err: any) {
      ctx.status = 403;
      ctx.body = err.message;
      return;
    }

    const dir = dirname(path);
    const data = ctx.request.body.data ?? '';

    try {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (err: any) {
        // Couldn't mkdir, assume it exists
      }

      await fs.writeFile(path, data);
      ctx.status = 200;
    } catch (err) {
      // Couldn't writeFile
      ctx.status = 500;
    }
  });

  return router.routes();
}
