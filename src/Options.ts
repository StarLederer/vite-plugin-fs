interface UserOptions {
  port?: number;
  rootDir?: string;
  goAboveRoot?: boolean;
}

interface Options extends Required<UserOptions> {}

const defaultOptions: Options = {
  port: 7070,
  rootDir: '',
  goAboveRoot: false,
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
