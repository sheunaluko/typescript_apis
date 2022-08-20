"use strict";
/*
  Tue May  3 12:49:15 CDT 2022
  Abstract logic for implementing portfolio balancing trading strategy

  Todo:
  - 1) create EVM balancer (extend PortfolioBalancer and BalanceParams)  [x]
  - 2) create Backtest balancer  [ ... ]

*/
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
exports.PortfolioBalancer = exports.MarketTradeType = void 0;
const logger_1 = require("../../common/logger");
var MarketTradeType;
(function (MarketTradeType) {
    MarketTradeType[MarketTradeType["BUY"] = 0] = "BUY";
    MarketTradeType[MarketTradeType["SELL"] = 1] = "SELL";
})(MarketTradeType = exports.MarketTradeType || (exports.MarketTradeType = {}));
/**
 * Creates a PortfolioBalancer object using the supplied parameters.
 * See class methods.
 */
class PortfolioBalancer {
    constructor(params) {
        this.Params = params;
        this.Logger = (0, logger_1.get_logger)({ id: params.logger_id });
        this.last_balance_data = {};
        this.log_mode = "verbose";
        this.state = {
            price_history: [],
            last_price: null,
            r: params.target_ratio,
        };
        this.Params.alpha = (this.Params.alpha || 0.01);
    }
    /**
     * Logs data via std method
     */
    log(v) { this.Logger(v); }
    /**
     * Performs a portfolio re-balance using the supplied parameters
     */
    balance_portfolio() {
        return __awaiter(this, void 0, void 0, function* () {
            let { base_asset, quote_asset } = this.Params;
            if (this.log_mode == "verbose") {
                this.log("Balancing...");
            }
            let info = yield this.get_balance_data();
            let { base_amt, quote_amt, base_price, portfolio_value, current_ratio, ratio_error, target_achieved, target_base_amt, base_delta, trade_type, base_market_amt } = info;
            if (this.log_mode == "verbose") {
                this.log(info);
            }
            /*
             Adaptive logic here...
            */
            if (this.Params.adaptive && this.state.last_price) {
                let dp = base_price - this.state.last_price;
                let gate01 = (x) => Math.max(Math.min(1, x), 0);
                this.state.r = gate01(this.state.r - this.Params.alpha * dp);
                this.Params.target_ratio = this.state.r;
            }
            //update the last price 
            this.state.last_price = base_price;
            this.state.price_history.push(base_price);
            // -- 
            if (target_achieved) {
                if (this.log_mode == "verbose") {
                    this.log("Target ratio already achieved. Returning");
                }
                return { balanced: false, balance_needed: false, info: null };
            }
            else {
                //allocation ratio is outta whack
                //need to rebalance the portfolio
                if (this.log_mode == "verbose") {
                    this.log("Target ratio NOT achieved. Continuing.");
                    this.log(`Processing order to ${trade_type} ${base_market_amt} ${base_asset}`);
                }
                let result = yield this.do_market_trade(trade_type, base_market_amt);
                let { error, info: result_info } = result;
                return { balanced: !error, balance_needed: true, info: result_info };
            }
        });
    }
    /**
     * Retrieve data about a potential rebalancing
     */
    get_balance_data() {
        return __awaiter(this, void 0, void 0, function* () {
            let { target_ratio, target_precision, quote_asset, base_asset, } = this.Params;
            let base_amt = yield this.get_base_balance(base_asset);
            let quote_amt = yield this.get_quote_balance(quote_asset);
            let base_price = yield this.get_base_price(base_asset, quote_asset);
            let portfolio_value = base_amt * base_price + quote_amt; //in units of quote asset (usually USD) 
            let current_ratio = base_amt * base_price / portfolio_value;
            let ratio_error = target_ratio - current_ratio;
            let target_achieved = (Math.abs(ratio_error) < target_precision);
            let target_base_amt = (portfolio_value * target_ratio) / base_price;
            let base_delta = target_base_amt - base_amt;
            let trade_type = (base_delta >= 0) ? MarketTradeType.BUY : MarketTradeType.SELL;
            let base_market_amt = Math.abs(base_delta);
            let info = {
                base_amt, quote_amt, base_price, portfolio_value,
                current_ratio, ratio_error, target_achieved, target_ratio, target_precision,
                target_base_amt, base_delta, trade_type, base_market_amt
            };
            this.last_balance_data = info; // :) 
            return info;
        });
    }
    set_log_mode(s) {
        if (this.log_mode == "verbose") {
            this.log(`Setting log mode to ${s}`);
            this.log_mode = s;
        }
    }
}
exports.PortfolioBalancer = PortfolioBalancer;
