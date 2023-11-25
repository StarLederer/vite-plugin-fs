[npm-version-src]: https://img.shields.io/npm/v/vite-plugin-fs/latest.svg
[npm-version-href]: https://npmjs.com/package/vite-plugin-fs
[npm-downloads-src]: https://img.shields.io/npm/dm/vite-plugin-fs.svg
[npm-downloads-href]: https://npmjs.com/package/vite-plugin-fs
[license-src]: https://img.shields.io/npm/l/nuxt-content-writer.svg
[license-href]: https://npmjs.com/package/nuxt-content-writer
[libera-src]: https://img.shields.io/badge/libera-manifesto-lightgrey.svg
[libera-href]: https://liberamanifesto.com

[issue-tracker]: https://github.com/StarLederer/vite-plugin-fs/issues
[show-n-tell]: https://github.com/StarLederer/vite-plugin-fs/discussions/categories/show-and-tell
[github]: https://github.com/StarLederer/vite-plugin-fs
[changelog]: https://github.com/StarLederer/vite-plugin-fs/tree/master/CHANGELOG.md

# [vite-plugin-fs](https://npmjs.com/package/vite-plugin-fs)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![libera manifesto][libera-src]][libera-href]

Interact with fs from the browser in dev mode.

> **News:** v1.1.0 is out and v2.0.0 is already in the works! See [changelog][changelog] for updates since v1.0.0 and keep and eye on the [issue tracker][issue-tracker] for future improvement plans.

## What's supported by the relay server

- readdir
- readFile (utf-8 only)
- rm
- stat
- writeFile (writes strings only; creates directories automatically)
- [something else?][issue-tracker]

## Setup

1. Add `vite-plugin-fs` to your project

```bash
pnpm install vite-plugin-fs
```

2. Add the plugin to `vite.config.js`

```ts
// vite.config.js
import fs from "vite-plugin-fs";

export default {
  plugins: [fs()],
};
```

## Options

```ts
interface UserOptions {
  /**
   * Port to serve the API at.
   * Chooses a random one if the one specified is taken.
   * Usually you don't need to configure this.
   *
   * @default 7070
   */
  port?: number;

  /**
   * Root directory visible to browser.
   *
   * @default '/'
   *
   * @example
   * './src/content'
   */
  rootDir?: string;
}
```

## Usage

The relay server only works in dev mode but the abstraction module can still be imported in production, it is up to you to ensure it is not. The abstraction layer is not buildable in production since it relies on fs relay server port, which does not exist at buid time. Importhing the abstraction layer at build time will casue an error.

This plugin runs a relay server that allows the browser to communicate with node. There are two ways to interact with the relay server:

- use the abstraction API (**recommended**),
- fetch network requests (tinkering only).

### Abstraction API

The abstraction API is designed to act as much like node fs as possible.

Import the abstraction API in your browser code

```ts
import fs from 'vite-plugin-fs/browser';

// To read a file
const file = await fs.readFile('path/to/somewhere');

// To read a directory
const dir = await fs.readdir('path/to/somewhere');

// To stat a path
const stats = await fs.stat('path/to/somewhere');

// To write a file
// Currently only strings are supported as the second argument
await fs.writeFile('path/to/somewhere', 'File content');

// To delete a file
await fs.rm('path/to/somewhere');

// To delete a file or directory (rm -r)
await fs.rm('path/to/somewhere', { recursive: true });
```

### Network requests

*Do not use this method in production!*

This is a more direct way to interact with the relay server, however, it is inconvenient, error-prone and does not have a stable API. Breaking changes to this method are not documented. **This method is documented purely for educational reasons.** Only use this method if you want to play around with the plugin and better understand what it does in the background.

```ts
import { activePort } from 'virtual:fs';

const url = `http://localhost:${activePort}`;

// To read a file
const fileData = await fetch(`${url}/path/to/somewhere?cmd=readFile`);

// To read a directory
const directoryEntries = await fetch(`${url}/path/to/somewhere?cmd=readdir`);

// To execute fs.stat
const stats = await fetch(`${url}/path/to/somewhere?cmd=stat`);

// To write a file
// (Creates the parent directories if they don't already exist automatically)
await fetch(`${url}/path/to/somewhere?cmd?=writeFile`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({data}),
});

// To delete a file
await fetch(`${url}/path/to/somewhere?cmd=rm`, { method: 'DELETE' });

// To delete a file or directory (rm -rf)
await fetch(`${url}/path/to/somewhere?cmd=rm&recursive=true&force=true`, { method: 'DELETE' });
```

## Sponsors

<p align="center">
  <a href="https://starlederer.github.io/sponsors/sponsors.svg">
    <img src="https://starlederer.github.io/sponsors/sponsors.svg"/>
  </a>
</p>

## License

MIT
