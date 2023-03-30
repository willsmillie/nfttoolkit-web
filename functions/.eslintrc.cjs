module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.dev.json'],
    sourceType: 'module',
  },
  ignorePatterns: [
    '/lib/**/*', // Ignore built files.
  ],
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'guard-for-in': 0,
    '@typescript-eslint/no-explicit-any': 0,
    'import/no-unresolved': 0,
    'max-len': [
      'error',
      {
        code: 120,
        tabWidth: 2,
        ignoreComments: true, //"comments": 80
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    'require-jsdoc': [
      'error',
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: false,
          ClassDeclaration: false,
          ArrowFunctionExpression: false,
          FunctionExpression: false,
        },
      },
    ],
  },
};
