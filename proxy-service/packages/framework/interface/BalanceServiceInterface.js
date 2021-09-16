const {ServiceBase} = require('../ServiceFramework');

class BalanceServiceInterface extends ServiceBase{
    constructor(serviceName){
        super('BalanceServiceInterface',serviceName);
    }
    async init(){await supper.init();}
    async getAllBalance(){}
}
//balance:{accountId,assetId,value}

module.exports = BalanceServiceInterface;