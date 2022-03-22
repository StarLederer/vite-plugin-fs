var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// src/index.ts
__export(exports, {
  default: () => src_default
});

// src/startApi.ts
var fs = __toModule(require("fs/promises"));
var import_path = __toModule(require("path"));
var import_express = __toModule(require("express"));
var import_cors = __toModule(require("cors"));
function startApi(rootDir, options) {
  const root = (0, import_path.resolve)(`${rootDir}/${options.rootDir}`);
  function resolvePath(path) {
    if (options.goAboveRoot) {
      return (0, import_path.resolve)(root + path);
    }
    let p = (0, import_path.resolve)(root + path);
    if (!p.startsWith(root))
      p = root;
    return p;
  }
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  app.use((0, import_cors.default)());
  async function readIfFile(path, stats) {
    if (stats.isFile()) {
      const data = await fs.readFile(path);
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
        items = await fs.readdir(path);
      } else {
        const dirents = await fs.readdir(path, { withFileTypes: true });
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
      const stats = await fs.stat(path);
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
  app.post("/*", async (req, res) => {
    const path = resolvePath(req.path);
    const dir = (0, import_path.dirname)(path);
    const { data } = req.body;
    try {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (err) {
      }
      await fs.writeFile(path, data);
      res.status(200).send();
    } catch (err) {
      res.status(500).send();
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
