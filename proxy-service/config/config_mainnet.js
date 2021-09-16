
const erc20Abi = require('./ERC20.json');


const compAddr = '0x230f0C01b8e2c027459781E6a56dA7e1876EFDbe'.toLowerCase();

let config = {
  chainId:{
    WanChain:888,
    Avalanche:43114
  },
  OnChainServiceInterface: {
    OnChainServiceWan: {
      connector: {
        type: 'web3',
        multiCallAddr: '0xBa5934Ab3056fcA1Fa458D30FBB3810c3eb5145f',
        url: 'https://gwan-ssl.wandevs.org:56891', //'http://192.168.1.2:8545',
        iWanOption: {
          options: [
            {
              url: 'api.wanchain.org',
              port: 8443,
              flag: 'ws',
              version: 'v3',
            },
            {
              url: 'api.wanglutech.net',
              port: 8443,
              flag: 'ws',
              version: 'v3',
            },
          ],
          apiKey:
            'dd5dceb07ae111aaa2693ccaef4e5f049d0b2bc089bee2adbf0509531f867f59',
          secretKey:
            '4928108949fa444f127198acbd2a89baa9d57a0a618794cb7a2fe12986b52c04',
        },
      },
    },
  },
  TxGeneratorServiceInterface: {
    TxGeneratorServiceWan: {
      Erc20: {
        abi: erc20Abi,
      },
    },
  },
};


module.exports = {
  config
};
