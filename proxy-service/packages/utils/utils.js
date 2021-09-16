class Address {
    constructor(address) {
        if (typeof address === 'string') {
            this.address = address;
        }
        if (typeof address === 'object' && address instanceof Address) {
            this.address = address.address;
        }
    }

    isEqual(address) {
        let compareTarget = address;

        if (typeof address === 'object' && address instanceof Address) {
            compareTarget = address.address;
        }

        return this.address.toLowerCase() === compareTarget.toLowerCase();
    }

    static isValidAddress(str) {
        let compareTarget = address;

        if (typeof address === 'object' && address instanceof Address) {
            compareTarget = address.address;
        }

        let reg = /^0[xX][0-9a-fA-F]{40}$/g;
        return reg.test(compareTarget);
    }
}

const wanUtil = require('wanchain-util');
var wanTx = wanUtil.wanchainTx;
const BigNumber = require('bignumber.js')

const signTxByPrivateKey = function (tx, privateKey) {
    var err = '';
    var signtx = '';
    try {
        if (tx == undefined || tx == null) {
            throw "transactionSign tx is empty"
        }

        if (privateKey == undefined || privateKey == null) {
            throw "privateKey is  empty"
        }
        // console.log("sigtx function tx:" + tx);
        if (tx.Txtype === undefined) tx.Txtype = '0x01';


        var signtx = new wanTx({
            Txtype: tx.Txtype,
            nonce: '0x' + new BigNumber(tx.nonce).toString(16),
            gasPrice: '0x' + new BigNumber(tx.gasPrice).toString(16),
            gasLimit: '0x' + new BigNumber(tx.gasLimit).toString(16),
            to: tx.to,
            value: '0x' + new BigNumber(tx.value).toString(16),
            data: tx.data,
            chainId: '0x' + new BigNumber(tx.chainId).toString(16)
        });

        signtx.sign(privateKey);

        signtx = '0x' + signtx.serialize().toString('hex');
    } catch (e) {
        err = e.toString();
        console.error("err:", err);
    }

    var result = {
        "err": err,
        "signedTx": signtx
    };
    return result;
}


var keythereum = require('keythereum');
let fs = require("fs");
var ethUtil = require('ethereumjs-util');

// let a = require('../account-service/A.json')
// let b = require('../account-service/B.json')

const loadKeyStoreFile = function (keyStoreFile, password) {
    // let keyStoreContent = fs.readFileSync(keyStoreFile);
    // var keyStore = JSON.parse(keyStoreContent);
    let keyStore;
    // if(keyStoreFile === 'A.json') keyStore = a;
    // if(keyStoreFile === 'B.json') keyStore = b;
    let keyObj = { version: keyStore.version, crypto: keyStore.crypto };
    let privateKey = keythereum.recover(password, keyObj);
    let address = ethUtil.bufferToHex(ethUtil.privateToAddress(privateKey));


    return { privateKey: privateKey, address: address };
}

module.exports = { Address, signTxByPrivateKey, loadKeyStoreFile };