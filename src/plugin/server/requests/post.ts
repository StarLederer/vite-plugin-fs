import * as fs from 'fs/promises';
import { dirname } from 'path';
import Router from 'koa-router';
import isNodeError from '../../../common/isNodeError';

//
//
// Main

export default function createRoutes(resolvePath: (path: string) => string): Router.IMiddleware {
  //
  // Post request routing

  const router = new Router();

  router.post(/.*/, async (ctx) => {
    ctx.status = 500;
    ctx.body = 'Relay server error';

    let path;
    try {
      path = resolvePath(decodeURIComponent(ctx.path));
    } catch (err) {
      if (isNodeError(err)) {
        ctx.status = 403;
        ctx.body = err.message;
      }
      return;
    }

    if (ctx.query.cmd) {
      if (ctx.query.cmd === 'writeFile') {
        const dir = dirname(path);
        const data = ctx.request.body as string;

        try {
          try {
            await fs.mkdir(dir, { recursive: true });
          } catch (err) {
            // Couldn't mkdir, assume it exists
          }

          await fs.writeFile(path, data);
          ctx.status = 200;
        } catch (err) {
          // Couldn't writeFile
          ctx.status = 500;
        }
      }

      // Other commands ...
    } else {
      ctx.status = 400;
      ctx.body = 'Command query param not specified';
    }
  });

  return router.routes();
}
