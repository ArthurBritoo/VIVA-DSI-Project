const { getDefaultConfig } = require('@expo/metro-config');
const { exclusionList } = require('metro-config');

const config = getDefaultConfig(__dirname);

// Bloquear a pasta do backend para evitar duplicar dependências (ex.: react)
config.resolver.blockList = exclusionList([
  /backend\/.*/ // ajuste se sua pasta do backend tiver outro nome
]);

module.exports = config;