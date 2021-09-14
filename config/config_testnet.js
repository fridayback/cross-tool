const erc20Abi = require('./ERC20.json');


let config = {
  OnChainServiceInterface: {
    chainId:{
      WanChain:999,
      Avalanche:43113
    },
    OnChainServiceWan: {
      connector: {
        type: 'web3',
        multiCallAddr: '0x14095a721Dddb892D6350a777c75396D634A7d97',
        url: 'https://gwan-ssl.wandevs.org:46891', //'http://192.168.1.2:8545',
        iWanOption: {
          options: [
            {
              url: 'apitest.wanchain.org',
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
