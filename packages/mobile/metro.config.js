const { createMetroConfiguration } = require('expo-yarn-workspaces');

const path = require('path');

const config = createMetroConfiguration(__dirname);
const nodeModulesPaths = [path.resolve(path.join(__dirname, './node_modules'))];
config.resolver.nodeModulesPaths = nodeModulesPaths;

module.exports = config;
