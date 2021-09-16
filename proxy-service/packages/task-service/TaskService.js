const {
  serviceFramework,
  SERVICE_FRAME_ERROR,
  TaskServiceInterface,
  TaskEvents,
  TASKSTATUS,
} = require('gsp-framework');
const TaskPoolStandAlone = require('./TaskPoolStandAlone');

class TaskService extends TaskServiceInterface {
  constructor(options) {
    super('TaskService', options);
    let TaskPool =
      options && options.taskPool ? options.taskPool : TaskPoolStandAlone;
    this.taskPool = new TaskPool();
    this.taskList = [];
    this.maxOngoingTask =
      options && options.maxOngoingTask ? options.maxOngoingTask : 100;
    this.timer = undefined;
  }

  async init() {
    setTimeout(this._dispatchTask.bind(this), 0);
    const eventService = serviceFramework.getService(
      'EventServiceInterface',
      'EventService',
    );
    if (!eventService) {
      throw SERVICE_FRAME_ERROR.NoService + ': EventService';
    }
    eventService.subscribeEvent(
      TaskEvents.EVENT_ADD_TASK_TO_POOL,
      this._dispatchTask.bind(this),
    );
  }

  async _dispatchTask() {
    //获取任务优先级队列中首个任务,如果未到执行时间,则延迟到执行时间时再_dispatchTask。否则立即出队并执行
    let task = await this.taskPool.frontTask();
    if (!task) {
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    let curTime = Date.now();
    let delay = task.nextTime - curTime;
    delay = delay > 0 ? delay : 0;

    // console.log('_+_+_+_+_+',task.nextTime,curTime,delay);

    if (delay > 0) {
      this.timer = setTimeout(this._dispatchTask.bind(this), delay);
    } else {
      task = await this.taskPool.popTask();
      if (task) {
        this._runTask(task);
      }
      //为了防止本任务执行过长,导致其他任务不能及时执行,在popTask后立刻dispatchTask。
      await this._dispatchTask();
    }
  }

  async _runTask(task) {
    //执行任务
    let result = {};
    try {
      result = await task.run();
      if (!result) result = {};
      //执行结果处理逻辑
      if (result.error) {
        await task.failed(result.error);
      } else {
        await task.successful(result.data);
      }
    } catch (error) {
      console.warn('task execute error:', task, error);
    }

    //根据任务执行参数,计算下次执行时间,以及任务最终状态
    task.calculateStatus(result.error);

    //如果任务执行完成，则执行最后处理逻辑，并将任务从队列中删除
    //否则重新入对,并更新队列优先级
    switch (task._status) {
      case TASKSTATUS.SUCCESSFUL:
      case TASKSTATUS.FAILED: {
        await task.final();
        await this.taskPool.deleteTask(task.id);
        break;
      }
      default:
        await this._pushTaskToPool(task);
        // console.log('retry task:', task.id, 'at', Date.now());
        break;
    }

    //重新发起一次任务调度
    await this._dispatchTask();
  }

  async _pushTaskToPool(task, checkExist = true) {
    //防止删除的任务，在执行完后,又被错误的加入任务池
    if (checkExist && !this.taskPool.getTask(task.id)) {
      return;
    }

    await this.taskPool.addTask(task);

    const eventService = serviceFramework.getService(
      'EventServiceInterface',
      'EventService',
    );
    if (!eventService) {
      throw SERVICE_FRAME_ERROR.NoService + ': EventService';
    }
    await eventService.emitEvent(TaskEvents.EVENT_ADD_TASK_TO_POOL, task);
  }

  async addTask(task, delay = 0) {
    let existTask = await this.taskPool.getTask(task.id);
    if (existTask) {
      console.warn('task[', task.id, '] is existed');
      return;
    }
    task._status = TASKSTATUS.GOING;
    task.nextTime = Date.now() + delay;
    await this._pushTaskToPool(task, false);
    // console.log('add task:', task.id, 'at', Date.now());
    return task.id;
  }

  async removeTask(taskId) {
    let task = await this.taskPool.getTask(taskId);
    if (task) {
      task._status = TASKSTATUS.FAILED;
      await this.taskPool.deleteTask(task.id);
    }
  }

  async pauseTask(taskId, bePause) {
    super.pauseTask(taskId, bePause); //not support yet
  }

  async runTaskImmediate(taskId) {
    // console.log('=====runTaskImmediate=====1');
    let task = await this.taskPool.getTask(taskId);
    if (task) {
      task.nextTime = Date.now();
      await this.taskPool.setTask(taskId, task);
      await this._dispatchTask();
      // console.log('@=====runTaskImmediate=====<',task);
    }
    // else{
    //     // console.log('=====runTaskImmediate=====2');
    // }
    //
  }
}

class TaskServiceOptions {
  constructor() {
    this.maxOngoingTask = undefined;
    this.taskPool = undefined;
  }
  static defaultOptions() {
    return { maxOngoingTask: 100, taskPool: TaskPoolStandAlone };
  }

  static maxOngoingAndTaskPool(maxOngoingTask, taskPool) {
    if (!maxOngoingTask || maxOngoingTask < 0)
      throw 'bad TaskService options: ' + maxOngoingTask + ', ' + taskPool;

    return { maxOngoingTask: maxOngoingTask, taskPool: taskPool };
  }
}

module.exports = { TaskService, TaskServiceOptions };
