const {
  BalanceServiceInterface,
  serviceFramework,
  SERVICE_FRAME_ERROR,
  TaskBase,
  TaskOption,
  TASKSTATUS,
} = require('gsp-framework');
const { BigNumber } = require('bignumber.js');
const MAX_MULTI_SIZE = 20;
class TaskFetchBalance extends TaskBase {
  constructor(taskId, options) {
    super(taskId, options);
    this.balanceParams = options.balanceParams;
  }

  async run() {
    let service = serviceFramework.getService(
      'OnChainServiceInterface',
      'OnChainServiceWan',
    );
    if (!service) {
      return { error: SERVICE_FRAME_ERROR.NoService };
    }
    try {
      let addrArray = [];
      this.balanceParams.accounts.forEach(account => {
        addrArray.push(account.address);
      });

      let balanceInfo;

      if (this.balanceParams && this.balanceParams.isNative) {
        balanceInfo = await service.getMultiBalance(addrArray);
      }

      if (this.balanceParams && !this.balanceParams.isNative) {
        balanceInfo = await service.getMultiTokenBalance(
          addrArray,
          this.balanceParams.tokenAddr,
        );
      }
      // console.log('****************balance',balanceInfo);
      for (const key in balanceInfo) {
        balanceInfo[key] = new BigNumber(balanceInfo[key]).toString(10);
      }

      return { data: balanceInfo };
    } catch (error) {
      return { error: error };
    }
  }

  async successful(data) {
    let balance = [];
    for (let index = 0; index < this.balanceParams.accounts.length; index++) {
      let item = {
        assetId: this.balanceParams.assetId,
        accountId: this.balanceParams.accounts[index].accountId,
        balance: data[this.balanceParams.accounts[index].address],
      };
      if (item.balance !== undefined) {
        balance.push(item);
      }
    }

    let service = serviceFramework.getService(
      'EventServiceInterface',
      'EventService',
    );
    await service.emitEvent('balance-update', balance, 'BalanceService');
  }

  async failed(error) {
    console.log('get balance failed:', error);
  }

  async final() {
    console.log('task[', this.id, '] finished at', Date.now());
  }
}

class TaskFetchBalanceByMultiCall extends TaskBase {
  constructor(taskId, options) {
    super(taskId, options);
    this.balanceParams = options.balanceParams;

    this.balanceParamsEx = [];
    this.balanceParams.forEach(element => {
      this.balanceParamsEx.push([
        element.account.address,
        element.asset.address,
      ]);
    });
  }

  async run() {
    let service = serviceFramework.getService(
      'OnChainServiceInterface',
      'OnChainServiceWan',
    );
    if (!service) {
      return { error: SERVICE_FRAME_ERROR.NoService };
    }
    try {
      let balanceInfo = await service.getMultiBalanceEx(this.balanceParamsEx);

      return { data: balanceInfo };
    } catch (error) {
      return { error: error };
    }
  }

  async successful(data) {
    let balance = [];

    for (let index = 0; index < this.balanceParams.length; index++) {
      let param = this.balanceParams[index];
      let item = {
        assetId: param.asset.assetId,
        accountId: param.account.accountId,
        balance: data[param.account.address][param.asset.address],
      };
      if (item.balance !== undefined) {
        balance.push(item);
      }
    }

    let service = serviceFramework.getService(
      'EventServiceInterface',
      'EventService',
    );
    await service.emitEvent('balance-update', balance, 'BalanceService');
  }

  async failed(error) {
    console.log('get balance failed:', error);
  }

  async final() {
    console.log('task[', this.id, '] finished at', Date.now());
  }
}

class BalanceService extends BalanceServiceInterface {
  constructor() {
    super();
    this.balanceTask = [];
    this.balanceMap = {};
  }

  async init() {
    await this.updateBalanceTaskEx();
    let service = serviceFramework.getService(
      'EventServiceInterface',
      'EventService',
    );
    if (!service) {
      throw SERVICE_FRAME_ERROR.NoService + ': EventService';
    }
    await service.subscribeEvent('add-account', accountInfo => {
      this.updateBalanceTaskEx();
    });
    await service.subscribeEvent('delete-account', accountInfo => {
      this.updateBalanceTaskEx();
    });

    await service.subscribeEvent('add-asset', assetInfo => {
      this.updateBalanceTaskEx();
    });
    await service.subscribeEvent('delete-asset', assetInfo => {
      this.updateBalanceTaskEx();
    });

    await service.subscribeEvent('balance-update', balances => {
      for (let i = 0; i < balances.data.length; i++) {
        if (this.balanceMap[balances.data[i].assetId] === undefined)
          this.balanceMap[balances.data[i].assetId] = {};
        this.balanceMap[balances.data[i].assetId][balances.data[i].accountId] =
          balances.data[i].balance;
      }
    });
  }

  async updateBalanceTaskEx() {
    let service = serviceFramework.getService(
      'AccountServiceInterface',
      'AccountService',
    );
    let accounts = await service.getAllAccounts();
    if (accounts.length <= 0) return;

    service = serviceFramework.getService(
      'AssetServiceInterface',
      'AssetService',
    );
    let assets = await service.getAllAssets();
    if (assets.length <= 0) return;

    let taskOption = TaskOption.interval(5000);

    /**
     * {
     *                 WAN:[{assetId:'1',isNative:false,chain:'',tokenAddr:'',accounts:[{accountId:'',address:''}]}],
     *                 ETH:[{assetId:'2',isNative:false,chain:'',tokenAddr:'',accounts:[{accountId:'',address:''}]}],
     *             }
     */
    let balanceParams = this._generateBalanceParamsEx(accounts, assets);
    let taskService = serviceFramework.getService(
      'TaskServiceInterface',
      'TaskService',
    );

    for (let index = 0; index < this.balanceTask.length; index++) {
      await taskService.removeTask(this.balanceTask[index]);
    }

    this.balanceTask = [];

    for (const chain in balanceParams) {
      let param = balanceParams[chain];
      let index = 0;
      while (1) {
        let splits = param.slice(index, index + MAX_MULTI_SIZE);

        if (splits.length <= 0) break;
        index = index + splits.length;

        let options = Object.assign({}, taskOption, {
          balanceParams: splits,
        });

        let task = new TaskFetchBalanceByMultiCall(
          'TaskFetchBalanceByMultiCall' + chain + '_' + index + Math.random(),
          options,
        );
        let taskId = await taskService.addTask(task, 5000);
        if (!taskId) throw 'add task repeatedly: ' + task.id;
        this.balanceTask.push(taskId);
      }
    }
  }

  async updateBalanceTask() {
    let service = serviceFramework.getService(
      'AccountServiceInterface',
      'AccountService',
    );
    let accounts = await service.getAllAccounts();
    if (accounts.length <= 0) return;

    service = serviceFramework.getService(
      'AssetServiceInterface',
      'AssetService',
    );
    let assets = await service.getAllAssets();
    if (assets.length <= 0) return;

    let taskOption = TaskOption.interval(5000);

    /**
     * {
     *                 WAN:[{assetId:'1',isNative:false,chain:'',tokenAddr:'',accounts:[{accountId:'',address:''}]}],
     *                 ETH:[{assetId:'2',isNative:false,chain:'',tokenAddr:'',accounts:[{accountId:'',address:''}]}],
     *             }
     */
    let balanceParams = this._generateBalanceParams(accounts, assets);
    let taskService = serviceFramework.getService(
      'TaskServiceInterface',
      'TaskService',
    );

    for (let index = 0; index < this.balanceTask.length; index++) {
      await taskService.removeTask(this.balanceTask[index]);
    }

    this.balanceTask = [];

    for (let i = 0; i < balanceParams.length; i++) {
      let options = Object.assign({}, taskOption, {
        balanceParams: balanceParams[i],
      });
      // console.log(options);
      let task = new TaskFetchBalance(
        'TaskFetchBalance_' +
          balanceParams[i].chain +
          '_' +
          balanceParams[i].assetId +
          Math.random(),
        options,
      );
      let taskId = await taskService.addTask(task, 5000);
      if (!taskId) throw 'add task repeatedly: ' + task.id;
      this.balanceTask.push(taskId);
    }
  }

  /**
   *
   * @param {*} accounts
   * @param {*} assets
   * @return {*} {
   *                 WAN:[{assetId:'1',isNative:false,chain:'',tokenAddr:'',accounts:[{accountId:'',address:''}]}],
   *                 ETH:[{assetId:'2',isNative:false,chain:'',tokenAddr:'',accounts:[{accountId:'',address:''}]}],
   *             }
   */
  _generateBalanceParams(accounts, assets) {
    let balanceParams = [];

    for (let i = 0; i < assets.length; i++) {
      let item = {
        assetId: assets[i].assetId,
        chain: assets[i].chain,
        isNative: assets[i].isNative,
        tokenAddr: assets[i].address,
        accounts: [],
      };

      accounts.forEach(a => {
        if (a.chain === assets[i].chain) item.accounts.push(a);
      });
      balanceParams.push(item);
    }

    return balanceParams;
  }

  _generateBalanceParamsEx(accounts, assets) {
    let balanceParams = {};

    for (let i = 0; i < assets.length; i++) {
      if (!balanceParams[assets[i].chain]) balanceParams[assets[i].chain] = [];

      accounts.forEach(a => {
        if (a.chain === assets[i].chain) {
          if (assets[i].isNative)
            assets[i].address = '0x0000000000000000000000000000000000000000';
          let item = { account: a, asset: assets[i] };

          balanceParams[assets[i].chain].push(item);
        }
      });
    }

    return balanceParams;
  }

  async getBalance(assetId, accountId) {
    if (this.balanceMap && this.balanceMap[assetId])
      return this.balanceMap[assetId][accountId];
  }
}

module.exports = BalanceService;
