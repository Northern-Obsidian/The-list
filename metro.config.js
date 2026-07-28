const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('sql');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/assets/')) {
    const filePath = moduleName.replace('@/assets/', '');
    return context.resolveRequest(
      context,
      path.resolve(__dirname, 'assets', filePath),
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
