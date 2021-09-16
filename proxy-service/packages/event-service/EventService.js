const {EventServiceInterface} =  require('gsp-framework');

const EventEmitter = require('events').EventEmitter;
class EventService extends EventServiceInterface {
    constructor(){
        super();
        this.eventBus = new EventEmitter();
    }

    async subscribeEvent(event, handleMsgFn){
        super.subscribeEvent(event,handleMsgFn);
        this.eventBus.on(event,handleMsgFn);
    }

    async emitEvent(event,msg,serviceName){
        this.eventBus.emit(event,{timestamp:Date.now(),data:msg,fromService:serviceName});
    }
}

module.exports = EventService;