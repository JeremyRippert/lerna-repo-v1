const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  testRegex: 'tests/app.e2e-spec.ts',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
    '^.+\\.(t|j)sx$': 'ts-jest',
  },
};
