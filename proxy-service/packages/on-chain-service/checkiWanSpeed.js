'use strict';

function idleSleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

class CheckiWanSpeed {
  constructor() {}

  async init() {}

  async checkiwanSpeed(iwanInstAry, success_callback, fail_callback) {
    //*****************************************************
    async function fun_test_speed(_inner_apiInst) {
      let startTime = new Date().getTime();
      do {
        if (_inner_apiInst.isConnetionOpen()) {
          try {
            let firstTime = new Date().getTime();
            let epochId = await _inner_apiInst.getEpochID('WAN');
            let secondTime = new Date().getTime();
            if (epochId) {
              //console.log('fun_test_speed --- epochId', epochId);
              let ret = {
                cnn: true,
                inst: _inner_apiInst,
                dura: secondTime - firstTime,
              };
              return ret;
            }
          } catch (e) {
            console.log(e);
          }
        }

        let curTime = new Date().getTime();
        if (startTime + 5000 < curTime) {
          let ret = {
            cnn: false,
            inst: _inner_apiInst,
            dura: curTime - startTime,
          };
          return ret;
        } else {
          await idleSleep(500);
        }
      } while (true);
    }
    //*****************************************************
    let testSpeedAry = [];
    for (let idx = 0; idx < iwanInstAry.length; ++idx) {
      let inst = iwanInstAry[idx];
      testSpeedAry.push(fun_test_speed(inst));
    }

    let ret = await Promise.race(testSpeedAry);
    if (ret.cnn === true) {
      await success_callback(iwanInstAry, ret.inst);
      return;
    }

    await fail_callback(iwanInstAry);
  }
}

module.exports = CheckiWanSpeed;
