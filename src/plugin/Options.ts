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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Options extends Required<UserOptions> {}

const defaultOptions: Options = {
  port: 7070,
  rootDir: '',
};

function resolveOptions(userOptiuons: UserOptions): Options {
  return Object.assign(defaultOptions, userOptiuons);
}

export {
  UserOptions,
  Options,
  defaultOptions,
  resolveOptions,
};
