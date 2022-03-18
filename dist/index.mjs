var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/startApi.ts
import {
  readFile,
  readdir,
  stat
} from "fs/promises";
import { resolve } from "path";
import express from "express";
import cors from "cors";
function startApi(rootDir, options) {
  const root = resolve(`${rootDir}/${options.rootDir}`);
  function resolvePath(path) {
    if (options.goAboveRoot) {
      return resolve(root + path);
    }
    let p = resolve(root + path);
    if (!p.startsWith(root))
      p = root;
    return p;
  }
  const app = express();
  app.use(express.json());
  app.use(cors());
  async function readIfFile(path, stats) {
    if (stats.isFile()) {
      const data = await readFile(path);
      return {
        type: "file",
        data
      };
    }
    return null;
  }
  async function readIfDir(path, stats, detailed = false) {
    if (stats.isDirectory()) {
      let items;
      if (!detailed) {
        items = await readdir(path);
      } else {
        const dirents = await readdir(path, { withFileTypes: true });
        items = [];
        dirents.forEach((dirent) => {
          const simpleDirent = {
            name: dirent.name,
            dir: dirent.isDirectory()
          };
          if (dirent.isFile() || dirent.isDirectory()) {
            items.push(simpleDirent);
          }
        });
      }
      return {
        type: "dir",
        items
      };
    }
    return null;
  }
  async function statIfSupported(stats) {
    if (stats.isFile() || stats.isDirectory()) {
      const simpleStats = __spreadProps(__spreadValues({}, stats), {
        dir: stats.isDirectory()
      });
      return {
        type: "stats",
        stats: simpleStats
      };
    }
    return null;
  }
  app.get("/*", async (req, res) => {
    var _a;
    const path = resolvePath(req.path);
    try {
      let response = null;
      const stats = await stat(path);
      if (req.query.command) {
        if (req.query.command === "readfile") {
          response = await readIfFile(path, stats);
        } else if (req.query.command === "readdir") {
          response = await readIfDir(path, stats);
        } else if (req.query.command === "readdir-detailed") {
          response = await readIfDir(path, stats, true);
        } else if (req.query.command === "stat") {
          response = await statIfSupported(stats);
        } else {
          response = {
            type: "error",
            code: 500,
            message: `Unknown command ${req.query.command}`
          };
        }
      } else {
        response = (_a = await readIfFile(path, stats)) != null ? _a : await readIfDir(path, stats);
      }
      if (response) {
        if (response.type !== "error") {
          res.status(200).send(response);
        } else {
          res.status(response.code).send(response.message);
        }
      } else {
        res.sendStatus(500);
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        res.sendStatus(404);
      } else {
        res.sendStatus(500);
      }
    }
  });
  app.listen(7070, () => {
    console.warn("[41m!!!");
    console.warn(`fs server is running on port ${options.port} and on /_fs`);
    console.warn("Please be careful since any requests to this server can modify your actual file system");
    console.warn(`Clamping to ${root} is ${options.goAboveRoot ? "OFF! A DELETE request to ../ will wipe the parent of this directory!" : "on. Everything outside this directory is safe"}`);
    console.warn("!!![0m");
  });
}

// src/Options.ts
var defaultOptions = {
  port: 7070,
  rootDir: "",
  goAboveRoot: false,
  proxy: {
    enable: true,
    path: "/_fs"
  }
};
function resolveOptions(userOptiuons) {
  return Object.assign(defaultOptions, userOptiuons);
}

// src/index.ts
function VitePluginFs(userOptiuons = {}) {
  const options = resolveOptions(userOptiuons);
  return {
    name: "vite-plugin-fs",
    apply: "serve",
    config() {
      const config = {};
      if (options.proxy.enable) {
        config.server = {};
        config.server.proxy = {};
        config.server.proxy[options.proxy.path] = {
          target: `http://localhost:${options.port}`,
          changeOrigin: true,
          rewrite: (path) => path.substring(options.proxy.path.length)
        };
      }
      return config;
    },
    configResolved({ root }) {
      startApi(root, options);
    }
  };
}
var src_default = VitePluginFs;
export {
  src_default as default
};
