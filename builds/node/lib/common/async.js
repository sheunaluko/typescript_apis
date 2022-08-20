"use strict";
/*
   Async utility functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = exports.wait_until = exports.status = void 0;
let ms = () => performance.now();
var status;
(function (status) {
    status[status["TIMEOUT"] = 0] = "TIMEOUT";
})(status = exports.status || (exports.status = {}));
function wait_until(f, timeout, rate) {
    var t_start = ms();
    rate = rate || 200;
    let p = new Promise((resolve, reject) => {
        let id = setInterval(function () {
            let t_now = ms();
            if (f()) {
                //condition is met 
                resolve(false);
                clearInterval(id);
            }
            else {
                let elapsed = t_now - t_start;
                if (timeout && elapsed >= timeout) {
                    resolve(true); // reports an timeout
                    clearInterval(id);
                }
            }
        }, rate);
    });
    //return the promise now 
    return p;
}
exports.wait_until = wait_until;
function wait(t) {
    return new Promise((res, rej) => {
        setTimeout(function () {
            res(status.TIMEOUT);
        }, t);
    });
}
exports.wait = wait;
