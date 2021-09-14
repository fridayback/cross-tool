const { AccountServiceInterface } = require('gsp-framework');
const { loadKeyStoreFile } = require('gsp-utils');

const {
  serviceFramework,
  SERVICE_FRAME_ERROR,
  TaskBase,
  TaskOption,
  TASKSTATUS,
} = require('gsp-framework');

class AccountService extends AccountServiceInterface {
  constructor() {
    super();
    this.accountList = [];
  }

  async init() {
    // let service = serviceFramework.getService(
    //   'WalletServiceInterface',
    //   'WalletService',
    // );
    // console.log('<<<<<<================>', service.isConnected());
    let accounts = [];
    // let accounts = await service.getAccountAry();

    let service = serviceFramework.getService(
      'EventServiceInterface',
      'EventService',
    );
    await service.subscribeEvent('WanMaskAccountChanged', async data => {
      this.updateAccounts(data.data);
    });

    await service.subscribeEvent('WanMaskChainChanged', data => {
      this.updateAccounts(data.data.accounts);
    });

    this.updateAccounts(accounts);
  }

  async updateAccounts(accounts) {
    if (accounts.length <= 0) return;
    let service = serviceFramework.getService(
      'WalletServiceInterface',
      'WalletService',
    );
    let chainId = await service.getChainId();
    if (!chainId) throw 'Get ChainId failed';

    this.accountList = [];
    accounts.forEach(element => {
      let accountAddress = element.toLowerCase();
      this.accountList.push({
        accountId: accountAddress,
        chain: 'WAN',
        chainId: chainId,
        address: accountAddress,
      });
    });

    service = serviceFramework.getService(
      'EventServiceInterface',
      'EventService',
    );
    service.emitEvent('add-account', this.accountList);
  }

  async getAllAccounts() {
    // let address = ['0xb25f3ad042e84928046abde93d51d554670a33e3', '0xb4173fddaa6e5a3b496460ba440cff0f984b98b8'];//web3.getAccounts(); //TO MODIFY
    // let chainId = 3;//web3.getChainId(); //TO MODIFY
    // let accountList = [];
    // for (let index = 0; index < address.length; index++) {
    //     let accountInfo = { accountId: address[index], chain: 'WAN', chainId: chainId, address: address[index] };
    //     this.accountList.push(accountInfo);
    // }

    return this.accountList;
  }

  async loadAccountFromKeystoreForTest(accounts) {
    let account1 = loadKeyStoreFile('A.json', '123456');
    let account2 = loadKeyStoreFile('B.json', '123456');
    this.accountList.push({
      accountId: account1.address,
      chain: 'WAN',
      chainId: 0,
      address: account1.address,
      privateKey: account1.privateKey,
    });
    this.accountList.push({
      accountId: account2.address,
      chain: 'WAN',
      chainId: 0,
      address: account2.address,
      privateKey: account2.privateKey,
    });
  }
}

module.exports = AccountService;
