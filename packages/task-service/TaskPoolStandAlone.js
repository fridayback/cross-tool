const { TaskBase, TaskPoolBase } = require('gsp-framework');

class TaskPoolStandAlone extends TaskPoolBase {
  constructor() {
    super();
    this.tasks = new Map();
    this.taskPriorityQueue = [];
  }

  async popTask() {
    if (this.taskPriorityQueue.length <= 0) return;
    let taskId = this.taskPriorityQueue.shift();
    return this.tasks.get(taskId);
  }

  async addTask(task) {
    // if (this.tasks.has(task.id)) {
    //     console.warn('task[', task.id, '] is existed');
    //     return;
    // }
    this.tasks.set(task.id, task);
    this.taskPriorityQueue.push(task.id);
    if (this.taskPriorityQueue.length > this.tasks.size) {
      // console.log('*********',this.taskPriorityQueue,'>',this.tasks);
    }
    if (this.taskPriorityQueue.length < 2) return;
    this.taskPriorityQueue = this.taskPriorityQueue.sort((a, b) => {
      return TaskBase.compare(this.tasks.get(a), this.tasks.get(b));
    });
  }

  async deleteTask(taskId) {
    this.tasks.delete(taskId);

    for (let index = 0; index < this.taskPriorityQueue.length; index++) {
      if (taskId === this.taskPriorityQueue[index]) {
        this.taskPriorityQueue[index] = this.taskPriorityQueue[
          this.taskPriorityQueue.length - 1
        ];
        this.taskPriorityQueue.pop();
        this.taskPriorityQueue = this.taskPriorityQueue.sort((a, b) => {
          return TaskBase.compare(this.tasks.get(a), this.tasks.get(b));
        });
        break;
      }
    }
  }

  async frontTask() {
    if (this.taskPriorityQueue.length <= 0) return;
    return this.tasks.get(this.taskPriorityQueue[0]);
  }

  async getTask(taskId) {
    return this.tasks.get(taskId);
  }

  async setTask(taskId, task) {
    if (this.tasks.has(taskId)) {
      this.tasks.set(taskId, task);
    }
  }
}

module.exports = TaskPoolStandAlone;
