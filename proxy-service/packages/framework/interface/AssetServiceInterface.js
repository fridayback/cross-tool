const {ServiceBase} = require('../ServiceFramework');

class AssetServiceInterface extends ServiceBase{
    constructor(serviceName){
        super('AssetServiceInterface',serviceName);
    }
    async init(){await supper.init();}
    async getAllAssets(){}
    // async getAssetIcon(assets){}
    async getAssetMetaData(assets){}
}

module.exports = AssetServiceInterface;