'use strict';
const { BCConnectorInterface } = require('gsp-framework');
var Web3 = require('web3');
const { aggregate } = require('@makerdao/multicall');
let erc20Abi = require('./ERC20.json');
var BigNumber = require('bignumber.js');

class Web3BCConnector extends BCConnectorInterface {
  /**
   *Creates an instance of BCConnectorIWan.
   * @param {*} option = {apiKey:'', secretKey:, urlOption:{}}
   * @memberof BCConnectorIWan
   */
  constructor(option) {
    super(option);
    this.bcClient = {};
    this.bcClient.wan = new Web3(
      new Web3.providers.HttpProvider(option.urlWan),
    );
    this.multicallAddress = option.multiCallAddr;
  }

  getClient(chain) {
    return this.bcClient[chain.toLowerCase()];
  }
  async getBlockNumber(chain) {
    let ret = await this.getClient(chain).eth.getBlockNumber();
    return ret;
  }

  async getBlock(chain, block) {
    let ret = await this.getClient(chain).eth.getBlock(block);
    return ret;
  }
  async getBalance(chain, addr) {
    let ret = await this.getClient(chain).eth.getBalance(addr);
    return ret;
  }

  async getMultiBalance(chain, addrArray) {
    let allPromise = [];
    for (let index = 0; index < addrArray.length; index++) {
      let p = this.getClient(chain)
        .eth.getBalance(addrArray[index])
        .then(balance => {
          return { [addrArray[index]]: balance };
        });
      allPromise.push(p);
    }

    let allBalances = await Promise.all(allPromise);

    let ret = {};
    for (let index = 0; index < allBalances.length; index++) {
      ret = Object.assign({}, ret, allBalances[index]);
    }

    return ret;
  }
  //accountTokens format like this: {[account1,token1],[account2,token2]}
  async getMultiBalanceEx(chain, accountTokens) {
    let calls = [];
    let ret = {};
    accountTokens.forEach(accountToken => {
      let account = accountToken[0];
      let token = accountToken[1];
      if (typeof ret[account] === 'undefined') {
        ret[account] = {};
      }
      let call = {};
      if (token === '0x0000000000000000000000000000000000000000') {
        call = {
          target: this.multicallAddress,
          call: ['getEthBalance(address)(uint256)', account],
          returns: [
            [
              account + '_' + token,
              val => (ret[account][token] = val.toString()),
            ],
          ],
        };
      } else {
        call = {
          target: token,
          call: ['balanceOf(address)(uint256)', account],
          returns: [
            [
              account + '_' + token,
              val => (ret[account][token] = val.toString()),
            ],
          ],
        };
      }

      calls.push(call);
    });

    await aggregate(calls, {
      multicallAddress: this.multicallAddress,
      web3: await this.getClient(chain),
    });

    return ret;
  }

  async getGasPrice(chain) {
    let ret = await this.getClient(chain).eth.getGasPrice();
    return ret;
  }

  async getNonce(chain, addr) {
    let ret = await this.getClient(chain).eth.getTransactionCount(addr);
    return ret;
  }

  async estimateGas(chain, txObject) {
    let ret = await this.getClient(chain).eth.estimateGas(txObject);
    return ret;
  }

  async sendRawTransaction(chain, signedTx) {
    let p = new Promise(async (resolve, reject) => {
      await this.getClient(chain)
        .eth.sendSignedTransaction(signedTx)
        .on('transactionHash', hash => {
          resolve(hash);
        })
        .on('receipt', receipt => {
          // console.log('[RECEIPT]',JSON.stringify(receipt));
        })
        .on('error', error => {
          // console.log('[TX ERROR]',error);
        });
    });

    return await p;
  }

  async getTransactionReceipt(chain, txHash) {
    let ret = await this.getClient(chain).eth.getTransactionReceipt(txHash);
    return ret;
  }

  async getRegTokens(chain) {
    // return await this.getClient(chain).getRegTokens(chain);
  }

  async getMultiTokenBalance(chain, addrArray, tokenAddr) {
    let Contract = this.getClient(chain).eth.Contract;
    tokenAddr = tokenAddr.toLowerCase();
    let contract = new Contract(erc20Abi, tokenAddr, {});

    let allPromise = [];
    for (let index = 0; index < addrArray.length; index++) {
      let p = contract.methods
        .balanceOf(addrArray[index])
        .call()
        .then(balance => {
          return { [addrArray[index]]: balance };
        });
      allPromise.push(p);
    }

    let allBalances = await Promise.all(allPromise);
    let ret = {};
    for (let index = 0; index < allBalances.length; index++) {
      ret = Object.assign({}, ret, allBalances[index]);
    }

    return ret;
  }
  // params format like this:[{token, owner, spender}]
  async getMultiTokenAllowance(chain, params) {
    let calls = [];
    let ret = [];
    params.forEach(arg => {
      let call = {
        target: arg.token,
        call: ['allowance(address,address)(uint256)', arg.owner, arg.spender],
        returns: [
          [
            arg.token + '_' + arg.owner + '_' + arg.spender,
            val =>
              ret.push({
                token: arg.token,
                owner: arg.owner,
                allowance: val.toString(),
              }),
          ],
        ],
      };

      calls.push(call);
    });

    await aggregate(calls, {
      multicallAddress: this.multicallAddress,
      web3: await this.getClient(chain),
    });

    return ret;
  }

  async getTokenAllowance(chain, tokenAddr, owner, spender) {
    let Contract = this.getClient(chain).eth.Contract;
    tokenAddr = tokenAddr.toLowerCase();
    let contract = new Contract(erc20Abi, tokenAddr, {});

    return await contract.methods.allowance(owner, spender).call();
  }

  async getTokenSupply(chain, tokenAddr) {
    let Contract = this.getClient(chain).eth.Contract;
    tokenAddr = tokenAddr.toLowerCase();
    let contract = new Contract(erc20Abi, tokenAddr, {});

    return await contract.methods.totalSupply().call();
  }

  async getAirDropStatus(chain, address, amount) {
    let Contract = this.getClient(chain).eth.Contract;

    let contract = new Contract(
      [
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: '',
              type: 'bytes32',
            },
          ],
          name: 'airDropAmount',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
          constant: true,
        },
      ],
      '0x15407f2C7f8032346978Fc7B0C01A13Ad3d5B439',
      {},
    );
    const web3 = this.getClient(chain);

    const binaryData = web3.eth.abi.encodeParameters(
      ['address', 'uint256'],
      [address, amount],
    );
    const hash = web3.utils.sha3(binaryData, { encoding: 'hex' });

    return await contract.methods.airDropAmount(hash).call();
  }

  async getPriceFromOracle(chain, oracleAddress, symbols) {
    let calls = [];
    let prices = {};
    symbols.forEach(symbol => {
      let call = {
        target: oracleAddress,
        call: ['getValue(bytes32)(uint)', symbol],
        returns: [
          [
            'Price_' + symbol,
            val => {
              prices[symbol] = val * 1;
            },
          ],
        ],
      };

      calls.push(call);
    });

    await aggregate(calls, {
      multicallAddress: this.multicallAddress,
      web3: await this.getClient(chain),
    });
    return prices;
  }

  async getPriceFromWasp(chain, tokenPairs) {
    let calls = [];
    let reserveLs = {};
    tokenPairs.forEach(pair => {
      let call = {
        target: pair,
        call: ['getReserves()(uint112,uint112,uint32)'],
        returns: [
          [
            'reserve0_' + pair,
            val => {
              if (!reserveLs[pair]) reserveLs[pair] = {};
              reserveLs[pair].reserve0 = val * 1;
            },
          ],
          [
            'reserve1_' + pair,
            val => {
              if (!reserveLs[pair]) reserveLs[pair] = {};
              reserveLs[pair].reserve1 = val * 1;
            },
          ],
          [
            'timestamp_' + pair,
            val => {
              if (!reserveLs[pair]) reserveLs[pair] = {};
              reserveLs[pair].timestamp = val * 1;
            },
          ],
        ],
      };

      calls.push(call);
    });

    await aggregate(calls, {
      multicallAddress: this.multicallAddress,
      web3: await this.getClient(chain),
    });

    // for (const key in reserveLs) {
    //     reserveLs[key].token0Price = new BigNumber(reserveLs[key].reserve0).div(reserveLs[key].reserve1).toString(10);
    // }
    return reserveLs;
  }
}

module.exports = Web3BCConnector;
