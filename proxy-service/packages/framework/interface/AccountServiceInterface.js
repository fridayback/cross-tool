const {ServiceBase,serviceFramework} = require('../ServiceFramework');

class AccountServiceInterface extends ServiceBase{
    constructor(serviceName){
        super('AccountServiceInterface',serviceName);
    }
    async init(){
        await supper.init();
    }
    async getAllAccounts(){}
}
//account:{accountId,nickName,chain,address,walletParams}
module.exports = AccountServiceInterface;