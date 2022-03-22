const rules = {
  'no-plusplus': 'off',
  'import/no-mutable-exports': 'off',
  'import/extensions': 'off',
  'import/no-extraneous-dependencies': [
    'error',
    {
      devDependencies: true,
    },
  ],
};

module.exports = {
  root: true,

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },

  env: {
    es6: true,
    browser: true,
  },

  extends: ['airbnb-base'],

  // settings: {
  //   'import/resolver': {
  //     node: {
  //       extensions: ['.ts'],
  //     },
  //   },
  // },

  overrides: [
    // Typescript files
    {
      files: ['*.ts'],
      parserOptions: {
        project: './tsconfig.json',
      },
      extends: [
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules,
    },
  ],

  rules,

  ignorePatterns: ['node_modules/**', '**/dist/**'],
};
