module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/member-ordering': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/unified-signatures': 'error',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/unbound-method': 'off',
    'dot-notation': 'error',
    eqeqeq: ['error', 'smart'],
    'guard-for-in': 'error',
    'no-bitwise': 'error',
    'no-console': 'warn',
    'no-eval': 'error',
    'no-invalid-this': 'off',
    'no-new-wrappers': 'error',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-throw-literal': 'error',
    'no-undef-init': 'error',
    'no-underscore-dangle': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'error',
    'no-restricted-imports': [
      'error',
      {
        // Lodash tree shaking isn"t working so directly importing lodash results in importing the whole library.
        // This rule should prevent importing the whole lodash library.
        // https://lodash.com/per-method-packages
        paths: [
          {
            name: 'lodash',
            message: 'Please use lodash/{module} import instead',
          },
        ],
      },
    ],
    'import/no-extraneous-dependencies': ['off'],
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: 'return',
      },
    ],
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  ignorePatterns: ['.eslintrc.js'],
};
