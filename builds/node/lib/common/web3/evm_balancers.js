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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniV2Balancer = exports.EVMBalancer = void 0;
const ethers_1 = require("ethers");
const pbl = __importStar(require("../trading/portfolio_balancer_lib"));
const sdk_1 = __importDefault(require("@uniswap/sdk"));
const abis = __importStar(require("./abis/index"));
const utils_1 = require("./utils");
const smart_wallet_1 = require("./smart_wallet");
/**
 * Creates an EVM balancer object
 */
class EVMBalancer extends pbl.PortfolioBalancer {
    constructor(params) {
        super(params);
        this.wallet = params.smartWallet;
    }
}
exports.EVMBalancer = EVMBalancer;
class UniV2Balancer extends EVMBalancer {
    constructor(ammParams) {
        super(ammParams);
        this.params = ammParams;
        this.routerContract = null;
        this.poolContract = null;
        this.token0 = null;
        this.token1 = null;
        this.token0Contract = null;
        this.token1Contract = null;
        this.tokens = null;
        this.gasLimitMultiple = 1.2;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("Initializing");
            let { router_address, pool_address, chain_id, token0, token1, token0_is_base_asset, } = this.params;
            let v2abi = abis.uni_v2;
            this.routerContract = new ethers_1.ethers.Contract(router_address, v2abi.router, this.wallet);
            this.poolContract = new ethers_1.ethers.Contract(pool_address, v2abi.pool, this.wallet);
            /*
               Create the token objects if they exist
            */
            if (token0) {
                let { contract_address, decimals, symbol, name } = token0;
                this.token0 = new sdk_1.default.Token(chain_id, contract_address, decimals, symbol, name);
                this.token0Contract = new ethers_1.ethers.Contract(contract_address, abis.erc20, this.wallet);
            }
            else {
                this.token0 = null;
                this.token0Contract = null;
            }
            //  -- 
            if (token1) {
                let { contract_address, decimals, symbol, name } = token1;
                this.token1 = new sdk_1.default.Token(chain_id, contract_address, decimals, symbol, name);
                this.token1Contract = new ethers_1.ethers.Contract(contract_address, abis.erc20, this.wallet);
            }
            else {
                this.token1 = null;
                this.token1Contract = null;
            }
            this.tokens = {
                base_token: (token0_is_base_asset ? this.token0 : this.token1),
                quote_token: (token0_is_base_asset ? this.token1 : this.token0),
                base_token_contract: (token0_is_base_asset ? this.token0Contract : this.token1Contract),
                quote_token_contract: (token0_is_base_asset ? this.token1Contract : this.token0Contract),
                base_token_decimals: (token0_is_base_asset ? this.token0.decimals : this.token1.decimals),
                quote_token_decimals: (token0_is_base_asset ? this.token1.decimals : this.token0.decimals),
            };
            this.log("Initialization complete");
        });
    }
    /*
         - The below functions use the provided
        - this.token0Contract
            - this.token1Contract
        - this.routerContract
            - this.poolContract
     - Which are all connected to the wallet and the provider.

     //Helpful resources:
     //(1) ref https://github.com/BlockchainWithLeif/PancakeswapBot/blob/main/newbot.js
     //(2) https://www.quicknode.com/guides/defi/how-to-swap-tokens-on-uniswap-with-ethers-js
     
    */
    get_base_balance(ba) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokens = this.tokens;
            let base_token = tokens.base_token;
            let quote_token = tokens.quote_token;
            let tmp = (yield tokens.base_token_contract.balanceOf(this.wallet.address));
            let decimals = base_token.decimals;
            return Number(ethers_1.ethers.utils.formatUnits(tmp.toString(), decimals));
        });
    }
    get_quote_balance(qa) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokens = this.tokens;
            let base_token = tokens.base_token;
            let quote_token = tokens.quote_token;
            let tmp = (yield tokens.quote_token_contract.balanceOf(this.wallet.address));
            let decimals = quote_token.decimals;
            return Number(ethers_1.ethers.utils.formatUnits(tmp.toString(), decimals));
        });
    }
    get_base_price(ba, qa) {
        return __awaiter(this, void 0, void 0, function* () {
            let { base_reserves, quote_reserves } = yield this.get_pool_reserves();
            return quote_reserves / base_reserves;
        });
    }
    /*
       Generates a swap transaction, as well as info about slippage, etc. Does not send the transaction!
    */
    generate_swap_transaction(base_or_quote, amt) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`Generating transaction that will consume ${amt} ${base_or_quote} tokens`);
            var output_info;
            var _amt;
            let tokens = this.tokens;
            let base_token = tokens.base_token;
            let quote_token = tokens.quote_token;
            if (base_or_quote == "BASE") {
                _amt = Number(amt.toFixed(base_token.decimals));
                this.log(`Converted ${amt} to ${_amt} for base input`);
                output_info = yield this.estimate_quote_out(_amt);
            }
            else {
                _amt = Number(amt.toFixed(quote_token.decimals));
                this.log(`Converted ${amt} to ${_amt} for quote input`);
                output_info = yield this.estimate_base_out(_amt);
            }
            let { amounts, amountOutNoSlip, amountIn, amountOut, slippageRatio, slippagePercent, path, max_slippage_percent, minAmountOutNum, minAmountOut, } = output_info;
            this.log(output_info);
            let overrides = yield this.wallet.get_gas_overrides();
            overrides.gasLimit = ethers_1.ethers.BigNumber.from("200000");
            this.log("Estimating gas");
            let gas_estimate = yield this.routerContract
                .estimateGas
                .swapExactTokensForTokens(amountIn, minAmountOut, path, this.wallet.address, (Date.now() + 1000 * 60 * 10), overrides);
            this.log("Gas estimate=");
            this.log(gas_estimate);
            // and then incorporate gas estimate into the beloow transaction
            // by update overrides.gasLimit
            overrides.gasLimit = gas_estimate;
            let tx = yield this.routerContract
                .populateTransaction
                .swapExactTokensForTokens(amountIn, minAmountOut, path, this.wallet.address, (Date.now() + 1000 * 60 * 10), overrides);
            return { tx, output_info, gas_estimate };
        });
    }
    do_swap(base_or_quote, amt, base_smart_send_ops) {
        return __awaiter(this, void 0, void 0, function* () {
            let { tx, output_info } = yield this.generate_swap_transaction(base_or_quote, amt);
            let { slippagePercent, max_slippage_percent } = output_info;
            if (slippagePercent > max_slippage_percent) {
                //abort
                this.log("Aborting swap due to high slippage");
                this.log(output_info);
                return { success: false };
            }
            else {
                //can proceed with the swap
                this.log("Proceeding with swap");
                let ops = Object.assign({ tx }, base_smart_send_ops);
                return (yield this.wallet.smartSendTransaction(ops));
            }
        });
    }
    // --- 
    base_token_approved() {
        return __awaiter(this, void 0, void 0, function* () {
            let tokens = this.tokens;
            let token_contract = tokens.base_token_contract;
            let router_address = this.routerContract.address;
            return (yield this.wallet.token_allowance_is_maxed(token_contract, router_address));
        });
    }
    quote_token_approved() {
        return __awaiter(this, void 0, void 0, function* () {
            let tokens = this.tokens;
            let token_contract = tokens.quote_token_contract;
            let router_address = this.routerContract.address;
            return (yield this.wallet.token_allowance_is_maxed(token_contract, router_address));
        });
    }
    approve_token(token_contract, base_smart_send_ops) {
        return __awaiter(this, void 0, void 0, function* () {
            let router_address = this.routerContract.address;
            // approve the token
            let ops = {
                token_contract,
                allowee_addr: router_address,
                base_smart_send_ops
            };
            return (yield this.wallet.fully_approve_token(ops));
        });
    }
    approve_quote_token(base_smart_send_ops) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokens = this.tokens;
            let token_contract = tokens.quote_token_contract;
            return (yield this.approve_token(token_contract, base_smart_send_ops));
        });
    }
    approve_base_token(base_smart_send_ops) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokens = this.tokens;
            let token_contract = tokens.base_token_contract;
            return (yield this.approve_token(token_contract, base_smart_send_ops));
        });
    }
    prepare_tokens(base_smart_send_ops) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("Checking tokens");
            if (!base_smart_send_ops) {
                this.log("No gas args provided!");
                return null;
            }
            var base_result;
            var quote_result;
            if (!(yield this.base_token_approved())) {
                this.log("Base token not approved...");
                base_result = yield this.approve_base_token(base_smart_send_ops);
            }
            else {
                this.log("Base token already approved...");
                base_result = { status: smart_wallet_1.TxStatus.Success };
            }
            if (!(yield this.quote_token_approved())) {
                this.log("Quote token not approved...");
                quote_result = yield this.approve_quote_token(base_smart_send_ops);
            }
            else {
                this.log("Quote token already approved...");
                quote_result = { status: smart_wallet_1.TxStatus.Success };
            }
            if ((base_result.status == smart_wallet_1.TxStatus.Success) &&
                (quote_result.status == smart_wallet_1.TxStatus.Success)) {
                this.log("Both token approvals succeeded!");
                return { success: true };
            }
            else {
                this.log("Unfortunately there was an error with the token approvals");
                return { success: false, data: { base_result, quote_result } };
            }
        });
    }
    // --- 
    get_base_tx_ops() {
        return __awaiter(this, void 0, void 0, function* () {
            let wallet = this.wallet;
            let addr = wallet.address;
            let overrides = yield this.wallet.get_gas_overrides();
            let { base_token, quote_token, base_token_contract, quote_token_contract } = this.tokens;
            return {
                wallet,
                addr,
                from: addr,
                overrides,
                base_token: base_token,
                quote_token: quote_token,
                base_token_contract: base_token_contract,
                quote_token_contract: quote_token_contract,
                router_contract: this.routerContract,
            };
        });
    }
    get_tx_gas_info(tx, usd_price) {
        let { gasPrice, gasLimit } = tx;
        let max_total_gas = Number(ethers_1.ethers.utils.formatEther(gasPrice.mul(gasLimit)));
        let l1_price_usd = usd_price;
        let max_total_gas_usd = max_total_gas * l1_price_usd;
        return {
            max_total_gas,
            max_total_gas_usd,
            l1_price_usd,
            gasPrice, gasLimit,
        };
    }
    estimate_quote_out(amt) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokens = this.tokens;
            let base_token = tokens.base_token;
            let quote_token = tokens.quote_token;
            var { base_amt, quote_amt, base_price, portfolio_value, current_ratio, ratio_error, target_achieved, target_base_amt, base_delta, trade_type, base_market_amt } = (yield this.get_balance_data());
            let amountIn = ethers_1.ethers.utils.parseUnits(String(amt), base_token.decimals);
            let path = [base_token.address, quote_token.address];
            let amountOutNoSlip = amt * base_price;
            //this.log(amountIn) ; 
            let amounts = yield this.routerContract.getAmountsOut(amountIn, path);
            let amountOut = Number(ethers_1.ethers.utils.formatUnits(amounts[1], quote_token.decimals));
            let slippageRatio = (amountOutNoSlip - amountOut) / amountOutNoSlip;
            let slippagePercent = slippageRatio * 100;
            let { max_slippage_percent } = this.params;
            let minAmountOutNum = (amountOutNoSlip * (1 - max_slippage_percent / 100)).toFixed(quote_token.decimals);
            //console.log(minAmountOutNum) ; 
            let minAmountOut = ethers_1.ethers.utils.parseUnits(String(minAmountOutNum), quote_token.decimals);
            return {
                amounts,
                amountOutNoSlip,
                amountIn,
                amountOut,
                slippageRatio,
                slippagePercent,
                max_slippage_percent,
                minAmountOutNum,
                minAmountOut,
                path
            };
        });
    }
    estimate_base_out(amt) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokens = this.tokens;
            let base_token = tokens.base_token;
            let quote_token = tokens.quote_token;
            var { base_amt, quote_amt, base_price, portfolio_value, current_ratio, ratio_error, target_achieved, target_base_amt, base_delta, trade_type, base_market_amt } = (yield this.get_balance_data());
            let amountIn = ethers_1.ethers.utils.parseUnits(String(amt), quote_token.decimals);
            let path = [quote_token.address, base_token.address];
            let amountOutNoSlip = amt / base_price;
            //this.log(amountIn) ; 
            let amounts = yield this.routerContract.getAmountsOut(amountIn, path);
            let amountOut = Number(ethers_1.ethers.utils.formatUnits(amounts[1], base_token.decimals));
            let slippageRatio = (amountOutNoSlip - amountOut) / amountOutNoSlip;
            let slippagePercent = slippageRatio * 100;
            let { max_slippage_percent } = this.params;
            let minAmountOutNum = (amountOutNoSlip * (1 - max_slippage_percent / 100)).toFixed(base_token.decimals);
            //console.log(minAmountOutNum) ; 
            let minAmountOut = ethers_1.ethers.utils.parseUnits(String(minAmountOutNum), base_token.decimals);
            return {
                amounts,
                amountOutNoSlip,
                amountIn,
                amountOut,
                slippageRatio,
                slippagePercent,
                max_slippage_percent,
                minAmountOutNum,
                minAmountOut,
                path
            };
        });
    }
    get_pool_reserves() {
        return __awaiter(this, void 0, void 0, function* () {
            let tokens = this.tokens;
            var tmp = yield this.poolContract.getReserves();
            let token0reserves = (0, utils_1.toEth)(tmp[0], this.token0.decimals);
            let token1reserves = (0, utils_1.toEth)(tmp[1], this.token1.decimals);
            let base_reserves = (this.params.token0_is_base_asset ? token0reserves : token1reserves);
            let quote_reserves = (this.params.token0_is_base_asset ? token1reserves : token0reserves);
            return {
                token0reserves,
                token1reserves,
                base_reserves,
                quote_reserves,
            };
        });
    }
    do_market_trade(trade_type, base_amt) {
        return __awaiter(this, void 0, void 0, function* () {
            var result;
            switch (trade_type) {
                case pbl.MarketTradeType.BUY:
                    result = yield this.do_swap("QUOTE", base_amt, this.wallet.default_smart_send_base(0.05));
                    break;
                case pbl.MarketTradeType.SELL:
                    result = yield this.do_swap("BASE", base_amt, this.wallet.default_smart_send_base(0.05));
                    break;
            }
            if (result.status == smart_wallet_1.TxStatus.Success) {
                return { error: false, info: result };
            }
            else {
                return { error: true, info: result };
            }
        });
    }
    symbol_generator(ba, qa) {
        return `${ba}/${qa}`;
    }
}
exports.UniV2Balancer = UniV2Balancer;
