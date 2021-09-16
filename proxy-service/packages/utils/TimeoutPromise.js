
class TimeoutPromise extends Promise {
    constructor(callback, ms = 30 * 1000) {
        let timeout;
        let wrapperPromise = Promise.race([
            new Promise(callback),
            new Promise((resolve, reject) => {
                timeout = setTimeout(() => {
                    reject(new Error('PTIMEOUT'));
                }, ms);
            })
        ]);

        super((resolve, reject) => {
            wrapperPromise.then((data) => {
                clearTimeout(timeout);
                resolve(data);
            }).catch((error) => {
                clearTimeout(timeout);
                reject(error); // if timeout, reject the `PTIMEOUT` error
            })
        });
    }
}

module.exports = TimeoutPromise;