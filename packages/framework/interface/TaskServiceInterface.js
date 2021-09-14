const {ServiceBase} = require('../ServiceFramework');

class TaskServiceInterface extends ServiceBase{
    constructor(serviceName){
        super('TaskServiceInterface',serviceName);
    }

    async addTask(task,delay = 0) {throw new Error("Abstract method!");}

    async removeTask(taskId){throw new Error("Abstract method!");}

    async pauseTask(taskId, bePause){throw new Error("Abstract method!");}

    async runTaskImmediate(taskId){throw new Error("Abstract method!");}

}

class TaskPoolBase {
    constructor() {
    }

    async popTask() { }

    async addTask(task) { }

    async deleteTask(taskId) { }

    async frontTask() { }

    async getTask(taskId) { }

    async setTask(taskId, task) { }
}

class TaskResult {
    constructor(error, data) {
        this.error = error;
        this.data = data;
    }
}

class TaskBase {
    constructor(taskId, options) {
        this.id = taskId;
        this.interval = (options && !(options.interval === undefined)) ? options.interval : 0;
        this.expireTime = (options && !(options.expireTime === undefined)) ? options.expireTime : 0;
        this.maxCircleTimes = (options && !(options.maxCircleTimes === undefined)) ? options.maxCircleTimes : 0;
        this.untilSucceed = (options && !(options.untilSucceed === undefined)) ? options.untilSucceed : false;

        this.nextTime = 0;
        this.circleTimes = 0;
        this._status = TASKSTATUS.READY;
    }



    calculateStatus(taskExecuteError) {
        
        this.circleTimes++;
        let curTime = Date.now();

        //执行次数达到最大次数，或者任务过期
        if ((this.circleTimes >= this.maxCircleTimes && this.maxCircleTimes !== 0) || (curTime >= this.expireTime && this.expireTime !== 0)) {
            this._status = taskExecuteError ? TASKSTATUS.FAILED : TASKSTATUS.SUCCESSFUL;
            return;
        }

        // 执行到任务执行成功
        if (this.untilSucceed && !taskExecuteError) {
            this._status = TASKSTATUS.SUCCESSFUL;

            return;
        }

        // 如果下次执行时间大于任务过期时间，则直接提前结束
        this.nextTime += this.interval;
        // console.log('*********',this.nextTime,this.interval);
        if (this.nextTime > this.expireTime && this.expireTime !== 0) {
            this._status = taskExecuteError ? TASKSTATUS.FAILED : TASKSTATUS.SUCCESSFUL;
            return;
        }

    }

    async run() { }

    async successful(data) { }

    async failed(error) { }

    async final() { }

    static compare(a, b) {
        try {
            return (a.nextTime - b.nextTime);
        } catch (error) {
            console.log('{}{}{}',a,b,error);
            throw error;
        }
        
    }

}

const TASKSTATUS = {
    READY: -1,
    GOING: 0,
    SUCCESSFUL: 1,
    FAILED: 2
}

class TaskOption {

    //1 只运行一次
    static once() {
        return {
            interval: 0,
            expireTime: 0,
            maxCircleTimes: 1,
            untilSucceed: false
        }
    }

    //2 按间隔执行指定次数,
    static multiple(maxTimes, interval = 100) {
        return {
            interval: interval,
            expireTime: 0,
            maxCircleTimes: maxTimes,
            untilSucceed: false
        }
    }

    static interval(interval = 100) {
        return {
            interval: interval,
            expireTime: 0,
            maxCircleTimes: 0,
            untilSucceed: false
        }
    }

    //3 按间隔执行到时间到期
    static expire(expireTime, interval = 100) {
        return {
            interval: interval,
            expireTime: expireTime,
            maxCircleTimes: 0,
            untilSucceed: false
        }
    }

    //4 按间隔一直执行直到执行成功
    static untilSucceed(interval = 100) {
        return {
            interval: interval,
            expireTime: 0,
            maxCircleTimes: 0,
            untilSucceed: true
        }
    }

    //5 按间隔一直执行直到执行成功或执行次数超过指定次数
    static untilSucceedOrMaxTimes(maxTimes, interval = 100) {
        return {
            interval: interval,
            expireTime: 0,
            maxCircleTimes: maxTimes,
            untilSucceed: true
        }
    }

    //6 按间隔一直执行直到执行成功或时间到期
    static untilSucceedOrExpire(expireTime, interval = 100) {
        return {
            interval: interval,
            expireTime: expireTime,
            maxCircleTimes: 0,
            untilSucceed: true
        }
    }

}

const TaskEvents = {
    EVENT_ADD_TASK_TO_POOL: 'add-task-to-pool'
}
module.exports = { TaskServiceInterface, TaskPoolBase, TaskBase, TaskResult, TASKSTATUS, TaskOption, TaskEvents };