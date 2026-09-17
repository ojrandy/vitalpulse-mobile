const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * Metro's package-exports resolution (on by default) can't resolve
 * `libphonenumber-js`'s `metadata.min.json` export entry — a known Metro
 * bug with packages that map an `exports` subpath straight to a `.json`
 * file. Disabling it is Expo's own documented escape hatch for exactly
 * this class of third-party `package.json#exports` incompatibility.
 */
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
