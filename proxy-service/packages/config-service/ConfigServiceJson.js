const _ = require('lodash');
const { serviceFramework, SERVICE_FRAME_ERROR ,ConfigServiceInterface} = require('gsp-framework');
// const ConfigServiceInterface = require('./ConfigServiceInterface');
// const fs = require('fs');
const path = require('path');


// function listFile(directory) {
//     console.log('------------------->1<',directory);
//     //转换为绝对路径
//     let dir = path.resolve(directory);
//     console.log('------------------->2<',dir);
//     let stats = fs.statSync(dir);
//     let fileList = []
//     //如果是目录的话，遍历目录下的文件信息
//     if (stats.isDirectory()) {
//         let file = fs.readdirSync(dir);
//         file.forEach((e) => {
//             //遍历之后递归调用查看文件函数
//             //遍历目录得到的文件名称是不含路径的，需要将前面的绝对路径拼接
//             var absolutePath = path.resolve(path.join(dir, e));
//             fileList = fileList.concat(listFile(absolutePath));
//         })
//     } else {
//         //如果不是目录，打印文件信息
//         if (path.parse(dir).ext === '.json') {
//             // console.log(param);
//             fileList.push(dir);
//         }
//     }
//     return fileList
// }
const {config_testNet,config_mainNet} = require('../../config');
class ConfigServiceJson extends ConfigServiceInterface {
    constructor(cfgDir/*, storageService*/) {
        super(cfgDir/*, storageService*/);
        this.cfg_mainnet = config_mainNet;
        this.cfg_testnet = config_testNet;
        this.schema = {
            name: 'ConfigServiceJson',
            fields: [
                { name: 'configName', primary: true, type: 'string', required: true },
                { name: 'configValue', primary: false, type: 'string', required: true }
            ]
        };
        this.storageService = undefined;
        this.currentNet = 'testNet';
    }

    switchNet(net){
        this.currentNet = net;
    }

    _getCfg(){
        if(this.currentNet === 'mainNet'){
            return this.cfg_mainnet;
        }else
        return this.cfg_testnet;
    }

    async init() {
        // await super.init();
        this.storageService = await serviceFramework.getService('StorageServiceInterface', 'StorageService');
        if (!this.storageService) {
            throw SERVICE_FRAME_ERROR.NoService + ": StorageService";
        }

        await this.storageService.initDB(this.schema);

        // let cfgFileList = listFile(this.cfgDir);
        // for (let index = 0; index < cfgFileList.length; index++) {
        //     const cfgFile = cfgFileList[index];
        //     let cfg = JSON.parse(fs.readFileSync(cfgFile));
        //     if (!this.cfg[cfg.serviceType]) this.cfg[cfg.serviceType] = {};
        //     this.cfg[cfg.serviceType][cfg.serviceName] = cfg.config;
        // }
        // console.log('^^^^^^^^^^^^^',process.cwd());
        // this.cfg = require('../../config');

    }
    async getConfig(serviceType, serviceName, propertyPath) {
        let fullPropertyPath = serviceType + '.' + serviceName;
        if (propertyPath && propertyPath !== '.') fullPropertyPath = fullPropertyPath + '.' + propertyPath;
        let ret = _.get(this._getCfg(), fullPropertyPath);
        return ret;
    }
    async setConfig(serviceType, serviceName, config) {
        // this.cfg = _.set(cfg,serviceType+'.'+serviceName,config);
        throw Error('setConfig() unsupported');
    }
    // async getGlobalConfig(name) {
    //     let cfg = await this.storageService.findByOption(this.schema.name, { configName: name });
    //     if (cfg.length > 0) {
    //         return cfg[0].configValue;
    //     }
    // }
    // async setGlobalConfig(name, value) {
    //     let cfg = await this.storageService.findByOption(this.schema.name, { configName: name });
    //     if (cfg.length > 0) {
    //         cfg = await this.storageService.updateByOption(this.schema.name, { configName: name }, { configValue: value });
    //         return (cfg != undefined)
    //     } else {
    //         cfg = await this.storageService.insert(this.schema.name, { configName: name, configValue: value });
    //         return (cfg != undefined);
    //     }
    // }
}

module.exports = ConfigServiceJson;