let { serviceFramework } = require('gsp-framework');
const { EventService } = require('event-service');
const { TaskService } = require('task-service');
const { ConfigServiceJson } = require('config-service');
const { StorageService } = require('storage-service');
const EventEmitter = require('events').EventEmitter;
// const {LogService} = require('log-service');

class StartServiceFramework {
  constructor() {
    this.state = 'uninitialized';
    this.event = new EventEmitter();
  }

  async assemble(otherServiceStartFun) {

    try {
      let storageService = new startOption.StorageService();
      serviceFramework.registerService(
        'StorageServiceInterface',
        'StorageService',
        storageService,
      );
      await storageService.init();
      this.event.emit('storage-service-ready', storageService);

      let configService = new ConfigServiceJson('./config');
      await configService.init();
      serviceFramework.registerService(
        'ConfigServiceInterface',
        'ConfigService',
        configService,
      );

      let eventService = new EventService();
      await eventService.init();
      serviceFramework.registerService(
        'EventServiceInterface',
        'EventService',
        eventService,
      );

      this.event.emit('config-service-ready', eventService);


      let taskService = new TaskService();
      serviceFramework.registerService(
        'TaskServiceInterface',
        'TaskService',
        taskService,
      );
      await taskService.init();
      this.event.emit('task-service-ready', taskService);

      
      await otherServiceStartFun(this);
      this.state = 'initialized';
      this.event.emit('over', '');
    } catch (error) {
      this.event.emit('error', error);
    }
  }

  async start(startOption, otherServiceStartFun) {
    if (this.state === 'uninitialized') {
      this.state = 'initializing';
      await this.assemble(startOption, otherServiceStartFun);
    } else if (this.state === 'initializing') {
      let p = new Promise((resolve, reject) => {
        this.event.on('over', () => {
          resolve();
        });

        this.event.on('error', error => {
          reject(error);
        });
      });
      await p;
    } else if (this.state === 'initialized') {
      return;
    } else {
      throw 'panic';
    }
  }

  async waitStart() {
    if (this.state === 'initialized') return;

    let p = new Promise((resolve, reject) => {
      this.event.on('over', () => {
        resolve();
      });

      this.event.on('error', error => {
        reject(error);
      });
    });
    await p;
  }
}

module.exports = StartServiceFramework;
