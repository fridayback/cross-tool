const { serviceFramework ,TaskBase, TaskResult} = require('gsp-framework');
// const taskSchedule = serviceFramework.getService("TaskServiceInterface","TaskService");
class TaskSample extends TaskBase {
    constructor(taskId, options) {
        super(taskId, options)
        this.cnt = 0
    }

    async run() {
        console.log('TaskSample[', this.id, '] running...', this.circleTimes, 'nextTime =', this.nextTime, 'interval=', this.interval, 'cnt', this.cnt);

        let data = this.id;
        this.cnt--;
        if (this.cnt % 2 === 0) return { data: data }
        else return { error: 'retrieve data failed' }
    }

    async successful(data) {
        console.log('TaskSample[', this.id, '] finished at', Date.now());
        await serviceFramework.getService('EventServiceInterface', 'EventService').emitEvent('task-data', data, 'TaskEvent');
    }

    async failed(error) {
        console.log('TaskSample[', this.id, '] finished error at', Date.now());
        await serviceFramework.getService('EventServiceInterface', 'EventService').emitEvent('task-data', error, 'TaskEvent');
    }

    async final() {
        await serviceFramework.getService('EventServiceInterface', 'EventService').emitEvent('task-data', '' + this.id + ' finished:' + this._status, 'TaskEvent');
    }

}

module.exports = TaskSample;
