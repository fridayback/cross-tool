
const {ServiceBase} = require('../ServiceFramework');

class PriceServiceInterface extends ServiceBase{
    
    constructor(serviceName){
        super('PriceServiceInterface',serviceName);
    }

    async init(){await supper.init();}

}


module.exports = PriceServiceInterface