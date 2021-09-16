"use strict";

const {ServiceBase} = require('../ServiceFramework');

module.exports = class LogServiceInterface extends ServiceBase {
    constructor(serviceName) {
        super('LogServiceInterface',serviceName);
    }

    async init(){await supper.init();}

    async getLoggerInstance(strPrefix) {throw new Error("Abstract method!");}
}
