const {ServiceBase} = require('../ServiceFramework');

class  EventServiceInterface extends ServiceBase{
    constructor(serviceName){
        super('EventServiceInterface',serviceName);
        this.events={};
    }
    
    async init(){await supper.init();}

    async subscribeEvent(event, handleMsgFn){
        if(!this.events[event]){
            this.events[event] =[];
        }
    }
    async emitEvent(event,msg){}
}

class EventMsg{
    constructor(data, fromService){
        this.timestamp = undefined;
        this.data = data;
        this.fromService = fromService;
    }
}

module.exports = EventServiceInterface;