"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.polygon_provider = exports.arbitrum_provider = exports.ethereum_provider = exports.fantom_provider = exports.get_provider = exports.ProviderType = exports.SmartWallet = exports.TxType = exports.TxStatus = exports.scale_big_num = exports.MaxGasType = void 0;
const ethers_1 = require("ethers");
const logger_1 = require("../logger");
const asnc = __importStar(require("../async"));
const R = __importStar(require("ramda"));
const { formatEther, parseEther, formatUnits, parseUnits } = ethers_1.ethers.utils;
/*

  Extension of the ethers.Wallet class

  - can automatically resend transactions with higher gasPrice until the transaction is mined
  OR the number of tries is reached OR a max gasPrice is reached
  - Supports EIP_1559 and legacy transactions for greater EVM coverage
  - Supports eth transfers
  - Supports token approvals
  - Supports token swaps


*/
const maxNumAsString = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
const maxBigNum = ethers_1.ethers.BigNumber.from(maxNumAsString);
var MaxGasType;
(function (MaxGasType) {
    MaxGasType[MaxGasType["GasPrice"] = 0] = "GasPrice";
    MaxGasType[MaxGasType["TxFee"] = 1] = "TxFee";
})(MaxGasType = exports.MaxGasType || (exports.MaxGasType = {}));
function scale_big_num(n, ratio) {
    let x_num = Math.ceil(ratio * Number(n.toString()));
    return ethers_1.ethers.BigNumber.from(String(x_num));
}
exports.scale_big_num = scale_big_num;
var TxStatus;
(function (TxStatus) {
    TxStatus[TxStatus["Error"] = 0] = "Error";
    TxStatus[TxStatus["MaxRetriesReached"] = 1] = "MaxRetriesReached";
    TxStatus[TxStatus["MaxGasReached"] = 2] = "MaxGasReached";
    TxStatus[TxStatus["GasVerified"] = 3] = "GasVerified";
    TxStatus[TxStatus["Success"] = 4] = "Success";
})(TxStatus = exports.TxStatus || (exports.TxStatus = {}));
var TxType;
(function (TxType) {
    TxType[TxType["EIP_1559"] = 0] = "EIP_1559";
    TxType[TxType["LEGACY"] = 1] = "LEGACY";
})(TxType = exports.TxType || (exports.TxType = {}));
class SmartWallet extends ethers_1.ethers.Wallet {
    constructor(ops) {
        let { privateKey, provider, tx_type } = ops;
        super(privateKey, provider);
        this.params = ops;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let { chainId } = yield this.params.provider.ready;
            this.id = `${this.address.slice(1, 6)}@${chainId}`;
            this.log = (0, logger_1.get_logger)({ id: this.id });
        });
    }
    get_fee_data() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.provider.getFeeData();
        });
    }
    wrap_transactions_with_gas(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            let fee_data = yield this.get_fee_data();
            let { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = fee_data;
            switch (this.params.tx_type) {
                case TxType.EIP_1559:
                    txs.map(tx => Object.assign(tx, { maxFeePerGas }));
                    return txs;
                    break;
                case TxType.LEGACY:
                    txs.map(tx => Object.assign(tx, { gasPrice }));
                    return txs;
                    break;
            }
        });
    }
    get_gas_overrides() {
        return __awaiter(this, void 0, void 0, function* () {
            let tx = {};
            return (yield this.wrap_transactions_with_gas([tx]))[0];
        });
    }
    multiply_transactions_gas_pricing(txs, multiplier) {
        let scaler = ((x) => scale_big_num(x, multiplier));
        switch (this.params.tx_type) {
            case TxType.EIP_1559:
                // @ts-ignore
                return txs.map(R.modifyPath(['maxFeePerGas'], scaler));
            case TxType.LEGACY:
                // @ts-ignore		
                return txs.map(R.modifyPath(['gasPrice'], scaler));
        }
    }
    smart_eth_transfer(ops) {
        return __awaiter(this, void 0, void 0, function* () {
            var { to, amt, max_gas_ops, max_retries, timeout_ms } = ops;
            let default_gas_ops = { type: MaxGasType.TxFee,
                value: parseEther("0.0001") };
            max_gas_ops = (max_gas_ops || default_gas_ops);
            max_retries = (max_retries || 5);
            timeout_ms = (timeout_ms || 1000 * 30);
            let tx = yield this.generate_l1_transfer_tx(to, amt);
            let smart_ops = {
                tx, max_gas_ops, max_retries, timeout_ms
            };
            return (yield this.smartSendTransaction(smart_ops));
        });
    }
    generate_l1_transfer_tx(to, amt) {
        return __awaiter(this, void 0, void 0, function* () {
            let tx = {
                from: this.address,
                to,
                value: ethers_1.ethers.utils.parseEther(amt),
                gasLimit: ethers_1.ethers.BigNumber.from("25000"),
            };
            return (yield this.wrap_transactions_with_gas([tx]))[0];
        });
    }
    get_token_allowance(token_contract, allowee_addr) {
        return __awaiter(this, void 0, void 0, function* () {
            let allowance = yield token_contract.allowance(this.address, allowee_addr);
            return allowance;
        });
    }
    token_allowance_is_maxed(token_contract, allowee_addr) {
        return __awaiter(this, void 0, void 0, function* () {
            let allowance = yield this.get_token_allowance(token_contract, allowee_addr);
            return (allowance.eq(maxBigNum));
        });
    }
    generate_approve_token_tx(token_contract, allowee_addr) {
        return __awaiter(this, void 0, void 0, function* () {
            var overrides = yield this.get_gas_overrides();
            overrides.gasLimit = ethers_1.ethers.utils.parseUnits("100000", 'gwei'); //set gasLimit 
            let gas_estimate = yield token_contract.estimateGas.approve(allowee_addr, maxBigNum, overrides);
            //set the estimate as the new gasLimit 
            overrides.gasLimit = gas_estimate;
            //populate the transaction 
            let tx = yield token_contract.populateTransaction.approve(allowee_addr, maxBigNum, overrides);
            return tx;
        });
    }
    fully_approve_token(ops) {
        return __awaiter(this, void 0, void 0, function* () {
            let { token_contract, allowee_addr, base_smart_send_ops } = ops;
            let tx = yield this.generate_approve_token_tx(token_contract, allowee_addr);
            let smart_ops = Object.assign({ tx }, base_smart_send_ops);
            return (yield this.smartSendTransaction(smart_ops));
        });
    }
    max_fee_ops(value) {
        return {
            type: MaxGasType.TxFee,
            value
        };
    }
    max_price_ops(value) {
        return {
            type: MaxGasType.GasPrice,
            value
        };
    }
    default_smart_send_base(ethFee) {
        let max_gas_ops = this.max_fee_ops(ethers_1.ethers.utils.parseEther(String(ethFee)));
        let max_retries = 4;
        let timeout_ms = 45 * 1000;
        return {
            max_gas_ops, max_retries, timeout_ms
        };
    }
    smartSendTransaction(ops) {
        return __awaiter(this, void 0, void 0, function* () {
            let { tx, max_gas_ops, max_retries, timeout_ms, } = ops;
            var nonce = yield this.getTransactionCount();
            let tx_log = (0, logger_1.get_logger)({ id: `${this.id}:${nonce}` });
            var tx_attempts = [];
            var tx_receipts = [];
            tx_log("Processing SmartSend Tx Request::");
            tx_log(`Nonce is ${nonce}`);
            tx_log(tx);
            let overrides = yield this.get_gas_overrides();
            overrides.nonce = nonce;
            for (var i = 0; i < max_retries; i++) {
                tx_log(`Attempt number: ${i + 1}`);
                tx_log('overrides:');
                tx_log(overrides);
                Object.assign(tx, overrides);
                tx_log('tx:');
                tx_log(tx);
                try {
                    //check transaction gas before even submitting 
                    let info = yield this.check_transaction_gas(tx, max_gas_ops);
                    let { tx_gas_info, status, details } = info;
                    if (status != TxStatus.GasVerified) {
                        tx_log("Tx gas failed verification... aborting");
                        return {
                            status,
                            tx_gas_info,
                            tx_attempts,
                            details,
                            ops
                        };
                    }
                    else {
                        // set up for next iteration
                        tx_log("Tx gas check passed... will send following tx: (see gas info after tx)");
                        tx_log(tx);
                        tx_log(tx_gas_info);
                    }
                    /*
                       This is complex... there was a bug where the first transaction timed out, so a second transaction with the same nonce was sent with higher gas. But then the second
                       transaction error with "nonce already used", since the first one had gotten mined already. But the first tx_receipt had already been "forgotten".
            
                       So I upgraded the architecture to hold the array of transaction receipts, and to run promise.any on these after appending the new transaction receipt. Theoretically, in this above case, the second transaction would error but the promise.any would be ok and return the FIRST tx_receipt which would now have completed. Theoretically..
            
                       The final step is to include this aggregate promise in a race with the timeout...
            
                     */
                    let tx_response = yield this.sendTransaction(tx);
                    let tx_receipt = tx_response.wait();
                    tx_attempts.push([tx_response, tx_receipt]);
                    tx_receipts.push(tx_receipt); //keeps track of all transaction receipts
                    // @ts-ignore 
                    let receipts_promise = Promise.any(tx_receipts); //wait for ANY on of the transactions to be successful, or for ALL to fail... 
                    let x = yield Promise.race([receipts_promise, asnc.wait(timeout_ms)]); //wait for one of the receipts, OR for the timeout
                    // either a status.TIMEUT occurred OR the tx_receipt is returned 
                    if (x == asnc.status.TIMEOUT) {
                        //timeout occured
                        tx_log("Timeout occurred.. tx not yet mined or errored");
                        tx_log("Modifying gas params...");
                        let multiplier = (1 + (i + 1) * 0.1);
                        tx_log("Multiplier=" + multiplier);
                        //request the new gas estimate and populate the overrides 
                        Object.assign(overrides, yield this.get_gas_overrides());
                        tx_log("Got gas estimation:");
                        tx_log(overrides);
                        //modify the old transaction
                        Object.assign(tx, overrides);
                        tx_log("Looping");
                    }
                    else {
                        //there was no timeout -- so the transaction must have been mined and x is the transaction receipt
                        tx_log("Transaction mined successfully!");
                        //tx_log(x) ;
                        return {
                            status: TxStatus.Success,
                            receipt: x,
                            tx_attempts,
                            ops,
                        };
                    }
                }
                catch (e) {
                    //some kind of error happened.. the transaction may have been rejected, who knows.
                    tx_log("Error occurred :(");
                    tx_log(e);
                    return {
                        status: TxStatus.Error,
                        details: e,
                        tx_attempts,
                        ops,
                    };
                }
            }
            //here we have reached the max number of retries
            return {
                status: TxStatus.MaxRetriesReached,
                tx_attempts,
                ops,
            };
        });
    }
    get_gas_price_field() {
        switch (this.params.tx_type) {
            case TxType.EIP_1559:
                return 'maxFeePerGas';
            case TxType.LEGACY:
                return 'gasPrice';
        }
    }
    calculate_transaction_gas(tx) {
        let maxGasPrice = tx[this.get_gas_price_field()];
        let gasLimit = tx.gasLimit;
        let maxTxFee = maxGasPrice.mul(gasLimit);
        return {
            maxGasPrice,
            gasLimit,
            maxTxFee
        };
    }
    check_transaction_gas(tx, gas_ops) {
        let tx_gas_info = this.calculate_transaction_gas(tx);
        let { maxGasPrice, gasLimit, maxTxFee } = tx_gas_info;
        var status;
        var details;
        switch (gas_ops.type) {
            case MaxGasType.TxFee:
                this.log("0");
                if (maxTxFee.gt(gas_ops.value)) {
                    status = TxStatus.MaxGasReached;
                    details = `MaxFee of ${formatEther(gas_ops.value)} was exceeded by planned fee of ${formatEther(maxTxFee)}`;
                }
                else {
                    status = TxStatus.GasVerified;
                    details = `MaxFee of ${formatEther(gas_ops.value)} was verified by planned fee of ${formatEther(maxTxFee)}`;
                }
                break;
            case MaxGasType.GasPrice:
                if (maxGasPrice.gt(gas_ops.value)) {
                    status = TxStatus.MaxGasReached;
                    details = `MaxGasPrice of ${formatUnits(gas_ops.value, 'gwei')} (gwei) was exceeded by planned price of ${formatUnits(maxGasPrice, 'gwei')} (gwei)`;
                }
                else {
                    status = TxStatus.GasVerified;
                    details = `MaxGasPrice of ${formatUnits(gas_ops.value, 'gwei')} (gwei) was verified by planned price of ${formatUnits(maxGasPrice, 'gwei')} (gwei)`;
                }
                break;
            default:
                status = TxStatus.Error;
                details = "Unkown MaxGasType";
                break;
        }
        let to_ret = {
            tx_gas_info,
            status,
            details,
        };
        this.log(details);
        return to_ret;
    }
    balanceAsNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            return Number(formatEther(yield this.getBalance()));
        });
    }
}
exports.SmartWallet = SmartWallet;
// ---
// Providers 
// -- 
var ProviderType;
(function (ProviderType) {
    ProviderType[ProviderType["Ethereum"] = 0] = "Ethereum";
    ProviderType[ProviderType["Fantom"] = 1] = "Fantom";
    ProviderType[ProviderType["Arbitrum"] = 2] = "Arbitrum";
    ProviderType[ProviderType["Polygon"] = 3] = "Polygon";
})(ProviderType = exports.ProviderType || (exports.ProviderType = {}));
function get_provider(p) {
    switch (p) {
        case ProviderType.Ethereum:
            return new ethers_1.ethers.providers.InfuraProvider('mainnet', process.env['ETHER_INFURA_PROJECT_ID']);
            break;
        case ProviderType.Fantom:
            //return new ethers.providers.JsonRpcProvider("https://rpc.ftm.tools/") ;
            return new ethers_1.ethers.providers.JsonRpcProvider("https://rpcapi.fantom.network/");
            break;
        case ProviderType.Arbitrum:
            return new ethers_1.ethers.providers.InfuraProvider('mainnet', process.env['ARBITRUM_INFURA_PROJECT_ID']);
            break;
        case ProviderType.Polygon:
            return new ethers_1.ethers.providers.JsonRpcProvider('https://polygon-rpc.com');
            break;
    }
}
exports.get_provider = get_provider;
function fantom_provider() { return get_provider(ProviderType.Fantom); }
exports.fantom_provider = fantom_provider;
function ethereum_provider() { return get_provider(ProviderType.Ethereum); }
exports.ethereum_provider = ethereum_provider;
function arbitrum_provider() { return get_provider(ProviderType.Arbitrum); }
exports.arbitrum_provider = arbitrum_provider;
function polygon_provider() { return get_provider(ProviderType.Polygon); }
exports.polygon_provider = polygon_provider;
