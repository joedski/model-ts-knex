const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  "preset": "ts-jest",
  "roots": [
    "<rootDir>/lib-ts",
    "<rootDir>/tests",
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
};
