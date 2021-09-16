'use strict';
const { BCConnectorInterface } = require('gsp-framework');
const iWanClient = require('iWan-js-sdk');
const CheckiWanSpeed = require('./checkiWanSpeed');

class IWanBCConnector extends BCConnectorInterface {
  /**
   *Creates an instance of BCConnectorIWan.
   * @param {*} option = {apiKey:'', secretKey:, urlOption:{}}
   * @memberof BCConnectorIWan
   */
  constructor(option) {
    super(option);
    // // dummy
    // // let option = {
    // //     url: "apitest.wanchain.org",
    // //     port: 8443,
    // //     flag: "ws",
    // //     version: "v3"
    // // };
    // this.apiClient = new iWanClient(option.apiKey, option.secretKey, option.option);
    this.m_iWanOption = option;

    this.apiClient = null;
    this.m_biWanConnected = false;
  }

  async init() {
    let iwanInstAry = [];
    for (let idx = 0; idx < this.m_iWanOption.options.length; ++idx) {
      let apiInst = new iWanClient(
        this.m_iWanOption.apiKey,
        this.m_iWanOption.secretKey,
        this.m_iWanOption.options[idx],
      );
      if (idx === 0) {
        this.apiClient = apiInst;
      }
      iwanInstAry.push(apiInst);
    }

    let checkiwanSpeed = new CheckiWanSpeed();
    checkiwanSpeed.checkiwanSpeed(
      iwanInstAry,
      this.oniwanCheckSpeedSuccess.bind(this),
      this.oniwanCheckSpeedFail.bind(this),
    );
  }

  async onConnect() {
    if (this.m_biWanConnected === false) {
      this.m_biWanConnected = true;
    }
  }

  async isConnected() {
    return this.m_biWanConnected;
  }

  async oniwanCheckSpeedSuccess(iwanInstAry, iwanInstance) {
    this.apiClient = iwanInstance;
    await this.onConnect();
    await this.closeOtherIwan(iwanInstAry, this.apiClient);
  }

  async oniwanCheckSpeedFail(iwanInstAry) {
    await this.apiClient.addConnectNotify(this.onConnect.bind(this));
    await this.closeOtherIwan(iwanInstAry, this.apiClient);
  }

  async closeOtherIwan(iwanInstAry, iwanInst) {
    for (let idx = 0; idx < iwanInstAry.length; ++idx) {
      let inst = iwanInstAry[idx];
      if (inst !== iwanInst) {
        console.log('closeOtherIwan close idx:', idx);
        inst.close();
      } else {
        console.log('choose iwan:', this.m_iWanOption.options[idx].url);
      }
    }
  }

  async getBlockNumber(chain) {
    let ret = await this.apiClient.getBlockNumber(chain);
    return ret;
  }

  async getBalance(chain, addr) {
    let ret = await this.apiClient.getBalance(chain, addr);
    return ret;
  }

  async getMultiBalance(chain, addrArray) {
    let ret = await this.apiClient.getMultiBalances(chain, addrArray);
    return ret;
  }

  async getGasPrice(chain) {
    let ret = await this.apiClient.getGasPrice(chain);
    return ret;
  }

  async getNonce(chain, addr) {
    let ret = await this.apiClient.getNonce(chain, addr);
    return ret;
  }

  async estimateGas(chain, txObject) {
    let ret = await this.apiClient.estimateGas(chain, txObject);
    return ret;
  }

  async sendRawTransaction(chain, signedTx) {
    let ret = await this.apiClient.sendRawTransaction(chain, signedTx);
    return ret;
  }

  async getTransactionReceipt(chain, txHash) {
    let ret = await this.apiClient.getTransactionReceipt(chain, txHash);
    return ret;
  }

  async getRegTokens(chain) {
    return await this.apiClient.getRegTokens(chain);
  }

  async getMultiTokenBalance(chain, addrArray, tokenAddr) {
    return await this.apiClient.getMultiTokenBalance(
      chain,
      addrArray,
      tokenAddr,
    );
  }

  async getTokenAllowance(chain, tokenAddr, owner, spender) {
    let ret = await this.apiClient.getTokenAllowance(
      chain,
      tokenAddr,
      owner,
      spender,
    );
    return ret;
  }

  async getTokenSupply(tokenAddress) {
    return await this.apiClient.getTokenSupply(this.chain, tokenAddress);
  }
}

module.exports = IWanBCConnector;
