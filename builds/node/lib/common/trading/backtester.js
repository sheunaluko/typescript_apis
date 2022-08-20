"use strict";
/*
   File for running backtests usings a portfolio balancer
*/
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
exports.BacktestBalancer = void 0;
const pbl = __importStar(require("./portfolio_balancer_lib"));
/**
 * Class for running a backtest. See below for usage example.
 * @example
 * ```
 * // 1. First create the backtester options
 * let ops = {
 *    base_asset : "ETH",
 *    quote_asset : "BUSD",
 *    data : [ {p :1450 , t : "ISO_DATE" }...],
 *    initial_portfolio : {
 *      base_balance : 20 ,
 *      quote_balance : 0 ,
 *    } ,
 *   logger_id : "ETHUSDC" ,
 *   fee : 0.001 ,
 *   slippage : 0.01,
 *   target_precision  : 0.05,
 *   target_ratio : 0.6,
 * }
 *
 * // 2. Then create the backtester
 * let backtester = new BacktestBalancer(ops) ;
 *
 * // 3. Then run the backtest
 * await backtester.backtest() ;
 *
 * // 4. Then extract the backtest metrics and use them in a graph, analysis, etc...
 * let  {
 *  hodl_porfolio_series,
 *  balance_portfolio_series,
 *  rebalances
 * } = backtester  ;
 * ```
 *
 */
class BacktestBalancer extends pbl.PortfolioBalancer {
    constructor(p) {
        super(p);
        this.data = p.data;
        this.current_index = -1;
        this.portfolio = Object.assign({}, p.initial_portfolio);
        this.initial_portfolio = Object.assign({}, p.initial_portfolio);
        this.rebalances = [];
        this.slippage = p.slippage;
        this.fee = p.fee;
        this.transactions_costs = {
            fees: {
                base: 0,
                quote: 0,
            },
            slippage: {
                base: 0,
                quote: 0,
            }
        };
        this.balance_portfolio_series = [];
        this.hodl_portfolio_series = [];
        this.ratio_series = [];
    }
    get_quote_balance(qa) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.portfolio.quote_balance;
        });
    }
    get_base_balance(ba) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.portfolio.base_balance;
        });
    }
    get_base_price(ba, qa) {
        return __awaiter(this, void 0, void 0, function* () {
            return (this.data[this.current_index]).p;
        });
    }
    do_market_trade(trade_type, base_amt) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
               The following assumptions are made:
               1) A fee of this.fee is incurred and manifested as a reduction in the amount of the
               purchased asset by this.fee. For example, if 1 ETH is market bought, only 0.999 ETH
               will be credited (assuming this.fee = 0.001)
        
               2) A slippage of this.slippage is incurred with each trade. Assume that X units of
               base asset are being bought. This means Y units of quote asset should be  consumed.
               Slippage manifests as Y*(1+this.slippage) being consumed for the trade.
               This is actually slightly different depending on market sell or buy - so I will need
               to look more into this and adjust the code.
        
               3) The price at which the trade occurs is given by the 'p' field in the data object.
            */
            //first a sanity check 
            let base_price = yield this.get_base_price("", "");
            let current_data = this.data[this.current_index];
            if (base_price != current_data.p) {
                this.log("Sanity check failed! - there is a problem with price indexing");
                process.exit(1);
            }
            //then the trade mechanics --> 
            let { p, t } = current_data;
            var new_base;
            var new_quote;
            //- 
            switch (trade_type) {
                case pbl.MarketTradeType.BUY:
                    //market BUY the base token
                    new_base = base_amt * (1 - this.fee);
                    new_quote = -(base_amt * p) * (1 + this.slippage);
                    //update the transactions cost object
                    this.transactions_costs.fees.base += base_amt * this.fee;
                    this.transactions_costs.slippage.quote += (base_amt * p) * (this.slippage);
                    break;
                case pbl.MarketTradeType.SELL:
                    //market SELL the base token		
                    new_base = -base_amt;
                    new_quote = (base_amt * p) * (1 - this.fee) * (1 - this.slippage);
                    //update the transactions cost object
                    this.transactions_costs.fees.quote += (base_amt * p) * (this.fee);
                    this.transactions_costs.slippage.quote += (base_amt * p) * (this.slippage);
                    break;
            }
            //- 
            let new_base_amt = this.portfolio.base_balance += new_base;
            let new_quote_amt = this.portfolio.quote_balance += new_quote;
            //first we update the portfolio object
            this.portfolio = {
                base_balance: new_base_amt,
                quote_balance: new_quote_amt
            };
            //now we update the rebalances array 
            this.rebalances.push({
                index: this.current_index,
                p, t,
                trade_type,
                base_amt,
                quote_amt: (base_amt * p),
                portfolio: this.get_portfolio_value_and_time(this.portfolio, p, t),
                hodl_portfolio: this.get_portfolio_value_and_time(this.initial_portfolio, p, t),
                cummulative_transactions_costs: {
                    raw: Object.assign({}, this.transactions_costs),
                    values: this.get_transactions_costs_values(this.transactions_costs, p)
                },
            });
            return { error: false, info: null };
            //fin 
        });
    }
    symbol_generator(ba, qa) { return "BACKTESTER"; }
    process_data() {
        return __awaiter(this, void 0, void 0, function* () {
            this.current_index += 1;
            yield this.balance_portfolio();
            /*
              pretty elegant, huh?
              A portfolio balance may or may not have happened.
              Either way, for post-analysis we will keep track of the portfolio series overtime
            */
            let { p, t } = this.data[this.current_index];
            this.hodl_portfolio_series.push(this.get_portfolio_value_and_time(this.initial_portfolio, p, t));
            this.balance_portfolio_series.push(this.get_portfolio_value_and_time(this.portfolio, p, t));
            this.ratio_series.push(this.Params.target_ratio);
        });
    }
    get_portfolio_value_and_time(portfolio, p, t) {
        let value = portfolio.base_balance * p + portfolio.quote_balance;
        return {
            base_balance: portfolio.base_balance,
            quote_balance: portfolio.quote_balance,
            value,
            p,
            t
        };
    }
    get_transactions_costs_values(tc, p) {
        let { fees, slippage } = tc;
        let fee_cost = fees.base * p + fees.quote;
        let slippage_cost = slippage.base * p + slippage.quote;
        let total = fee_cost + slippage_cost;
        return {
            fee_cost,
            slippage_cost,
            total
        };
    }
    backtest() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("Starting backtest...");
            let len = this.data.length;
            for (var x = 0; x < len; x++) {
                yield this.process_data();
                if ((x % 100) == 0) {
                    this.log(`Progress = ${x}/${len}`);
                }
            }
            this.log("Done");
        });
    }
}
exports.BacktestBalancer = BacktestBalancer;
