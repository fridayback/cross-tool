const {ServiceBase} = require('../ServiceFramework');


class TxGeneratorServiceInterface extends ServiceBase{
    constructor(serviceName,scConfig)
    {
        if (new.target === TxGeneratorServiceInterface) {
            throw new TypeError("Cannot construct Abstract class directly");
        }
        super('TxGeneratorServiceInterface',serviceName);

        this.scConfig = scConfig;
        this.scMap = {};
    }
    async generateTxData(smartContract,method,args){throw new Error("Abstract method!");}

}

module.exports = TxGeneratorServiceInterface;