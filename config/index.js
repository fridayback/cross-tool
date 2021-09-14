const config_testNet = require('./config_testnet').config;
const config_mainNet = require('./config_mainnet').config;

const NETWORK = 'TESTNET';


const config = (NETWORK === 'TESTNET') ? config_mainNet : config_testNet;


module.exports = {
  ...config
};
