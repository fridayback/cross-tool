const { OnChainServiceInterface } = require('gsp-framework');
class OnChainServiceEth extends OnChainServiceInterface {
  constructor(connector) {
    super('OnChainServiceEth', connector);
    this.connector = connector;
    this.chain = 'ETH';
  }

  getConnector() {
    return this.connector;
  }

  async getBlockNumber() {
    return await this.connector.getBlockNumber(this.chain);
  }

  async getBlock(block) {
    return await this.connector.getBlock(this.chain, block);
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
  async getGasPrice() {
    return await this.connector.getGasPrice(this.chain);
  }

  async getNonce(addr) {
    return await this.connector.getNonce(this.chain, addr);
  }

  async sendTransaction(unsignedTx) {
    return await window.web3.eth.sendTransaction(unsignedTx);
  }
  async sendRawTransaction(signedTx) {
    return await this.connector.sendRawTransaction(this.chain, signedTx);
  }

  async estimateGas(txObject) {
    return await this.connector.estimateGas(this.chain, txObject);
  }

  async getTransactionReceipt(txHash) {
    try {
      return await this.connector.getTransactionReceipt(this.chain, txHash);
    } catch (e) {
      if (e === 'no receipt was found') return;
      else throw e;
    }
  }

  //accountTokens format like this: {[account1]:[token1,token2...]}
  async getMultiBalanceEx(accountTokens) {
    return await this.connector.getMultiBalanceEx(this.chain, accountTokens);
  }

  async getPriceFromWasp(tokenPairs) {
    return await this.connector.getPriceFromWasp(this.chain, tokenPairs);
  }
  async getRegTokens() {
    return await this.connector.getRegTokens();
  }

  async getTokenAllowance(tokenAddress, owner, to) {
    return await this.connector.getTokenAllowance(
      this.chain,
      tokenAddress,
      owner,
      to,
    );
  }

  async getMultiTokenAllowance(params) {
    return await this.connector.getMultiTokenAllowance(this.chain, params);
  }

  async getTokenSupply(tokenAddress) {
    return await this.connector.getTokenSupply(this.chain, tokenAddress);
  }
}

module.exports = OnChainServiceEth;
