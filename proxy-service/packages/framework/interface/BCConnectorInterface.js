'use strict';

class BCConnectorInterface {

    constructor(option) {
        if (new.target === BCConnectorInterface) {
            throw new TypeError("Cannot construct Abstract class directly");
        }
    }

    async getBalance(chain, addr) {
        // dummy
    }

    async getMultiBalance(chain, addrArray) {
        // dummy
    }

    async getGasPrice(chain) {
        // dummy
    }

    async getNonce(chain, addr) {
        // dummy
    }

    async sendRawTransaction(chain, signedTx) {
        // dummy
    }

    async estimateGas(chain, txObject) {
        // dummy
    }

    async getTransactionReceipt(chain,txHash){
        // dummy
    }
};

module.exports = BCConnectorInterface;
