const {
  serviceFramework,
  SERVICE_FRAME_ERROR,
  TxMonitorServiceInterface,
  TaskBase,
  TaskOption,
  TASKSTATUS,
} = require('gsp-framework');

class TxMonitorTask extends TaskBase {
  constructor(taskId, options) {
    super(taskId, options);
    this.txHash = options.txHash;
    this.taskCallback = options.taskCallback;
    this.receipt = undefined;
    this.onChainService = options.onChainService
      ? options.onChainService
      : 'OnChainService';
  }

  async run() {
    try {
      let service = serviceFramework.getService(
        'OnChainServiceInterface',
        this.onChainService,
      );
      if (!service) {
        throw SERVICE_FRAME_ERROR.NoService + ': ' + this.onChainService;
      }

      let data = await service.getTransactionReceipt(this.txHash);

      if (!data) {
        return { error: 'no receipt was found' };
      }
      this.receipt = data;
      return { data: data };
    } catch (error) {
      this.expireTime = Date.now() + this.interval * 2;
      return { error: error };
    }
  }

  async final() {
    await this.taskCallback(this.txHash, this.receipt);
    // console.log('task[', this.id, '] finished at', Date.now());
  }
}

class TxMonitorService extends TxMonitorServiceInterface {
  constructor(options) {
    super('TxMonitorService');
    this.monitorInterval = 5000;
  }
  async init() {}
  async addTx(txMonitor) {
    let taskOptions = TaskOption.untilSucceedOrExpire(
      Date.now() + 600000,
      this.monitorInterval,
    );
    taskOptions.txHash = txMonitor.txHash;
    taskOptions.taskCallback = txMonitor.callback;
    switch (txMonitor.chain.toUpperCase()) {
      case 'WAN':
        taskOptions.onChainService = 'OnChainServiceWan';
        break;
      default:
        throw 'not support ' + txMonitor.chain + ' yet';
        break;
    }

    let task = new TxMonitorTask(
      'TxMonitorTask_' + txMonitor.chain + '_' + txMonitor.txHash,
      taskOptions,
    );
    let service = serviceFramework.getService(
      'TaskServiceInterface',
      'TaskService',
    );
    if (!service) {
      throw SERVICE_FRAME_ERROR.NoService + ': TaskService';
    }

    await service.addTask(task);
  }
}

module.exports = TxMonitorService;
