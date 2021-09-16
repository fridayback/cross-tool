const OnChainServiceEth = require('./OnChainServiceEth');
class OnChainServiceWan extends OnChainServiceEth {
  constructor(connector) {
    super(connector);
    this.serviceName = 'OnChainServiceWan';
    this.chain = 'WAN';
  }

  async getBlockNumber() {
    return await this.connector.getBlockNumber(this.chain);
  }

  async getBalance(addr) {
    return await this.connector.getBalance(this.chain, addr);
  }

  async getMultiBalance(addrArray) {
    return await this.connector.getMultiBalance(this.chain, addrArray);
  }

  async getMultiTokenBalance(addrArray, tokenAddr) {
    return await this.connector.getMultiTokenBalance(
      this.chain,
      addrArray,
      tokenAddr,
    );
  }

  async getMultiBalanceEx(accountTokens) {
    return await this.connector.getMultiBalanceEx(this.chain, accountTokens);
  }

  async getGasPrice() {
    return await this.connector.getGasPrice(this.chain);
  }

  async getNonce(addr) {
    return await this.connector.getNonce(this.chain, addr);
  }

  async sendTransaction(unsignedTx) {
    // console.log('======>sendTransaction:',JSON.stringify(unsignedTx));
    return '' + Date.now();
    // return await window.web3.eth.sendTransaction(unsignedTx);
  }

  // async estimateGas(txObject) {
  //     return 10000000;
  // }

  async getTransactionReceipt(txHash) {
    try {
      // let current = Date.now();
      // if(current - txHash > 30000) return {status:'0x1'};
      return await this.connector.getTransactionReceipt(this.chain, txHash);
    } catch (e) {
      if (e === 'no receipt was found') return;
      else throw e;
    }
  }

  async getRegTokens() {
    return await this.connector.getRegTokens();
  }

  async getAirDropStatus(address, amount) {
    return await this.connector.getAirDropStatus(this.chain, address, amount);
  }
  async getPriceFromOracle(oracleAddress, symbols) {
    return await this.connector.getPriceFromOracle(
      this.chain,
      oracleAddress,
      symbols,
    );
  }
}

module.exports = OnChainServiceWan;
