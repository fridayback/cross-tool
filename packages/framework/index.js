const ServiceFrameworkModel = require('./ServiceFramework');
const AccountServiceInterface = require('./interface/AccountServiceInterface');
const AssetServiceInterface = require('./interface/AssetServiceInterface');
const BalanceServiceInterface = require('./interface/BalanceServiceInterface');
const ConfigServiceInterface = require('./interface/ConfigServiceInterface');
const EventServiceInterface = require('./interface/EventServiceInterface');
const OnChainServiceInterface = require('./interface/OnChainServiceInterface');
const BCConnectorInterface = require('./interface/BCConnectorInterface');
const PriceServiceInterface = require('./interface/PriceServiceInterface');
const StorageServiceInterfaceModel = require('./interface/StorageServiceInterface');
const TaskServiceInterfaceModel = require('./interface/TaskServiceInterface');
const TxGeneratorServiceInterface = require('./interface/TxGeneratorServiceInterface');
const TxMonitorServiceInterface = require('./interface/TxMonitorServiceInterface');
const logServiceInterface = require('./interface/logServiceInterface');



class FrameworkStarter {
    constructor() {
    };

    async start(startOptions, callBack) {
        let serviceInstance = [];

        for (let index = 0; index < startOptions.serviceOptions.length; index++) {

            const serviceClass = startOptions.serviceOptions[index].class;
            let service = new serviceClass();

            let initError;
            try {
                await storageService.init(startOptions.serviceOptions[index].options);

            } catch (error) {
                initError = error;
            }

            if (startOptions.serviceOptions[index].initCallBack) {
                startOptions.serviceOptions[index].initCallBack(initError);
            }else{
                throw initError;
            }

            serviceFramework.registerService("StorageServiceInterface", "StorageService", storageService);

            serviceInstance.push(service);
        }

        for (let index = 0; index < serviceInstance.length; index++) {
            let startError;
            try {
                await serviceInstance[index].start();

            } catch (error) {
                startError = error;
            }

            if (startOptions.serviceOptions[index].startCallBack) {
                startOptions.serviceOptions[index].startCallBack(startError);
            }else{
                throw startError;
            }
            
        }

        if(callBack){
            callBack();
        }

    }
}

class StartOptions {
    constructor() {
        this.serviceOptions = [];
    }

    addService(classType, name, initOption, initCallBack, startCallBack) {
        let options = {
            class: classType,
            name: name,
            options: initOption,
            initCallBack: initCallBack,
            startCallBack: startCallBack
        }
        this.serviceOptions.push(options);
    }
}


module.exports = {
    AccountServiceInterface,
    AssetServiceInterface,
    BalanceServiceInterface,
    ConfigServiceInterface,
    EventServiceInterface,
    OnChainServiceInterface,
    BCConnectorInterface,
    PriceServiceInterface,
    TxGeneratorServiceInterface,
    TxMonitorServiceInterface,
    logServiceInterface,
    ...TaskServiceInterfaceModel,
    ...StorageServiceInterfaceModel,
    ...ServiceFrameworkModel,
    StartOptions,
    FrameworkStarter
};