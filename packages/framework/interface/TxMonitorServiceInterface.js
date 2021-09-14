const {ServiceBase} = require('../ServiceFramework');

class TxMonitorServiceInterface extends ServiceBase{
    constructor(serviceName){
        super('TxMonitorServiceInterface',serviceName);
    }

    async addTx(txMonitor) {throw new Error("Abstract method!");}
}

module.exports = TxMonitorServiceInterface;

   