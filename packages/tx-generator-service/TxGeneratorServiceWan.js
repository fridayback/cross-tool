const { serviceFramework, SERVICE_FRAME_ERROR } = require('gsp-framework');
const TxGeneratorServiceEth = require('./TxGeneratorServiceEth');

class TxGeneratorServiceWan extends TxGeneratorServiceEth {
  constructor(scConfig) {
    super(scConfig);
    this.serviceName = 'TxGeneratorServiceWan';
    this.onChainService = 'OnChainServiceWan';
  }

  async init() {
    let service = serviceFramework.getService(
      'ConfigServiceInterface',
      'ConfigService',
    );
    if (!service) {
      throw SERVICE_FRAME_ERROR.NoService + ': ConfigService';
    }

    this.scConfig = await service.getConfig(
      'TxGeneratorServiceInterface',
      'TxGeneratorServiceWan',
    );
  }

  covertChainId(chainId) {
    if (chainId == '888' || chainId == '1') return '1';
    if (chainId == '999' || chainId == '3') return '3';
    return chainId;
  }

  async generateTx(
    from,
    smartContract,
    method,
    args,
    options /**{value,gasLimit} */,
    to,
    TxType = '0x01',
  ) {
    let tx = await super.generateTx(
      from,
      smartContract,
      method,
      args,
      options /**{value,gasLimit} */,
      to,
    );
    tx.Txtype = TxType;
    // tx.chainId = this.covertChainId(tx.chainId);
    // console.log('**********generateTx:',tx);
    return tx;
  }
}
module.exports = TxGeneratorServiceWan;
