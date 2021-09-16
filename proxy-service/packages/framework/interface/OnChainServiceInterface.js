
const {ServiceBase} = require('../ServiceFramework');

class OnChainServiceInterface extends ServiceBase{

    constructor(serviceName,connector) {
        if (new.target === OnChainServiceInterface) {
            throw new TypeError("Cannot construct Abstract class directly");
        }
        super('OnChainServiceInterface',serviceName);
        this.connector = connector;
    }

    async init(){await supper.init();}

    getConnector() {
        return this.connector;
    }

    async getBalance(addr) {throw new Error("Abstract method!");}

    async getMultiBalance(addrArray) {throw new Error("Abstract method!");}

    async getMultiErc20Balance(addrArray){throw new Error("Abstract method!");}

    async getGasPrice() {throw new Error("Abstract method!");}

    async getNonce(addr) {throw new Error("Abstract method!");}

    async sendTransaction(unsignedTx){throw new Error("Abstract method!");}

    async estimateGas(txObject) {throw new Error("Abstract method!");}

    async getTransactionReceipt(txHash){throw new Error("Abstract method!");}
};

module.exports = OnChainServiceInterface;
