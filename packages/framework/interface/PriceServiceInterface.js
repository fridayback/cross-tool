
const {ServiceBase} = require('../ServiceFramework');

class PriceServiceInterface extends ServiceBase{
    
    constructor(serviceName){
        super('PriceServiceInterface',serviceName);
    }

}


module.exports = PriceServiceInterface