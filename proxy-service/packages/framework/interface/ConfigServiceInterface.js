const {ServiceBase} = require('../ServiceFramework');

class ConfigServiceInterface extends ServiceBase{
    constructor(serviceName,cfgDir/*,storageService*/){
        if (new.target === ConfigServiceInterface) {
            throw new TypeError("Cannot construct Abstract class directly");
        }
        super('ConfigServiceInterface',serviceName);
        this.cfgDir = cfgDir;
        // this.storageService = storageService;
    }
    async init(){}

    async getConfig(serviceType,serviceName,propertyPath){
        throw new Error("Abstract method!");
    }
    async setConfig(serviceType,serviceName,config){
        throw new Error("Abstract method!");
    }

    async getGlobalConfig(name){
        throw new Error("Abstract method!");
    }
    async setGlobalConfig(name,value){
        throw new Error("Abstract method!");
    }
}

module.exports = ConfigServiceInterface;