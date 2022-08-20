"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toGweiBN = exports.BNtoGwei = exports.toEth = void 0;
const ethers_1 = require("ethers");
function toEth(bigNum, decimals) {
    return Number(ethers_1.ethers.utils.formatUnits(bigNum.toString(), decimals));
}
exports.toEth = toEth;
function BNtoGwei(bigNum) {
    return Number(ethers_1.ethers.utils.formatUnits(bigNum, 'gwei'));
}
exports.BNtoGwei = BNtoGwei;
function toGweiBN(s) {
    return ethers_1.ethers.utils.parseUnits(s, 'gwei');
}
exports.toGweiBN = toGweiBN;
