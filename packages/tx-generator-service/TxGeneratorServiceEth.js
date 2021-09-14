const { TxGeneratorServiceInterface, serviceFramework, SERVICE_FRAME_ERROR } = require('gsp-framework');
const fs = require('fs');
const path = require('path');
const Web3 = require("web3");
const BigNumber = require('bignumber.js');

class TxGeneratorServiceEth extends TxGeneratorServiceInterface {
    constructor() {
        super('TxGeneratorServiceEth');
        this.scConfig = {};
        this.scMap = {};
        this.onChainService = 'OnChainServiceEth';
    }
    async init() {
        let service = serviceFramework.getService('ConfigServiceInterface', 'ConfigService');
        if (!service) {
            throw SERVICE_FRAME_ERROR.NoService + ": ConfigService";
        }

        this.scConfig = await service.getConfig('TxGeneratorServiceInterface', 'TxGeneratorServiceEth');

    }
    async generateTxData(smartContract, method, args) {
        let scInst = this.scMap[smartContract];

        if (!scInst) {
            let web3 = new Web3(null);
            // let abiFile = path.join(__dirname, '../../../abi', this.scConfig[smartContract].abi);
            let abi = this.scConfig[smartContract].abi;
            scInst = //web3.eth.contract(abi).at('0x0123456789012345678901234567890123456789');
            new web3.eth.Contract(abi, '0x0123456789012345678901234567890123456789', {});
            this.scMap[smartContract] = scInst;
        }
        return scInst.methods[method].apply(this,args).encodeABI();
        // return scInst[method].getData.apply(null, args);
    }

    async generateTx(from, smartContract, method, args, options/**{value,gasLimit} */, to) {
        let txData = '';
        //普通转账交易不需要生成data
        if (smartContract) {
            txData = await this.generateTxData(smartContract, method, args);
        }

        let tx = {
            data: txData,
            value: options.value,
            to: to ? to : this.scConfig[smartContract].address,
            gas: options.gasLimit,
            gasLimit: options.gasLimit,
            gasPrice: options.gasPrice,
            nonce: options.nonce,
            chainId: options.chainId?options.chainId:0,
            from: from
        }

        let service = serviceFramework.getService('OnChainServiceInterface', this.onChainService);
        if (options.nonce === undefined) {

            if (!service) {
                throw SERVICE_FRAME_ERROR.NoService + ': ' + this.onChainService;
            }
            tx.nonce = await service.getNonce(from);
        }

        if (options.gasLimit === undefined) {
            if (!service) {
                throw SERVICE_FRAME_ERROR.NoService + ': ' + this.onChainService;
            }
            tx.gasLimit = await service.estimateGas(tx);
            tx.gas = tx.gasLimit;
        }
        tx.gasLimit = '0x' + new BigNumber(tx.gasLimit).toString(16);
        tx.gas = tx.gasLimit;

        if (options.gasPrice === undefined) {
            if (!service) {
                throw SERVICE_FRAME_ERROR.NoService + ': ' + this.onChainService;
            }
            tx.gasPrice = await service.getGasPrice();
        }

        tx.gasPrice = '0x' + new BigNumber(tx.gasPrice).toString(16);

        return tx;
    }
}

module.exports = TxGeneratorServiceEth;