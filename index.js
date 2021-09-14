const { WanBridge, Wallet } = require('wanchain-cross-sdk');
async function main() {

    let bridge = new WanBridge("testnet"); // testnet or mainnet
    bridge.on("ready", assetPairs => {
        console.log('assetPairs =', assetPairs);
        /* the bridge is initialized successfully and is ready for cross-chain, you can filter assetPairs by asset and chain type as needed.
          assetPairs example: [
            {
              assetPairId: "39",
              assetType: "AVAX",
              decimals: "18",
              fromChainName: "Avalanche C-Chain",
              fromChainType: "AVAX",
              fromSymbol: "AVAX",
              smgs: [], // available storeman groups
              toChainName: "Wanchain",
              toChainType: "WAN",
              toSymbol: "wanAVAX"
            },
            ......
          ]
        */
    }).on("error", info => {
        console.error(info)
        /* failed to initialize the bridge, or cross-chain task failed.
          error info structure: {
            taskId, // optional, only task error info has taskId field
            reason
          }
        */
    }).on("ota", info => {
        console.log('ota =', info);
        /* the one-time-addess is generated to receive BTC, LTC or XRP.
          ota info structure: {
            taskId,
            address:, // BTC/LTC ota address, or XRP xAddress
            rAddress, // optional, XRP rAddress
            tagId     // optional, XRP tag ID
          }
        */
    }).on("lock", info => {
        console.log('lock =', info);
        /* the lock transaction hash
          lock info structure: {
            taskId,
            txHash
          }
        */
    }).on("redeem", info => {
        console.log('redeem =', info);
        /* the redeem transaction hash, indicates that the cross-chain task is finished.
          redeem info structure: {
            taskId,
            txHash,
            status    // "Succeeded" or "Error"
          }
        */
    });

    let iwanAuth = {
        apiKey: '8c817eb20fb7e4d6854269d1a48dad44c0de8d40acb070e20e3c29181afbf445',//'77989fb1c3e0cbba2d3429fe89c3bd8f01a906155c75095525343c1cf2e220d6',
        secretKey: '76af07587aa3a44f5e60edcabd2f4a67f8442d47990747fb0cc7edaa277eab5b',//'c9b5547ea3f72c78e1cfd835c2f1974e986b6a5f83e55e1c7afe0fad286e9d87',
    };

    await bridge.init(iwanAuth);
}