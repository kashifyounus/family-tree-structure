/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.watchFolders = [path.resolve(projectRoot, "../shared")];

module.exports = withNativewind(config, { inlineRem: 16 });
