import * as pbl from "./portfolio_balancer_lib";
export declare type Portfolio = {
    base_balance: number;
    quote_balance: number;
    value?: number;
    t?: string;
    p?: number;
};
export declare type BacktestData = {
    t: string;
    p: number;
}[];
export interface BacktestBalancerParams extends pbl.BalanceParams {
    data: BacktestData;
    initial_portfolio: Portfolio;
    slippage: number;
    fee: number;
}
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
export declare class BacktestBalancer extends pbl.PortfolioBalancer {
    data: BacktestData;
    current_index: number;
    rebalances: any[];
    portfolio: Portfolio;
    initial_portfolio: Portfolio;
    balance_portfolio_series: Portfolio[];
    hodl_portfolio_series: Portfolio[];
    ratio_series: number[];
    slippage: number;
    fee: number;
    transactions_costs: any;
    constructor(p: BacktestBalancerParams);
    get_quote_balance(qa: string): Promise<number>;
    get_base_balance(ba: string): Promise<number>;
    get_base_price(ba: string, qa: string): Promise<number>;
    do_market_trade(trade_type: pbl.MarketTradeType, base_amt: number): Promise<{
        error: boolean;
        info: any;
    }>;
    symbol_generator(ba: string, qa: string): string;
    process_data(): Promise<void>;
    get_portfolio_value_and_time(portfolio: Portfolio, p: number, t: string): {
        base_balance: number;
        quote_balance: number;
        value: number;
        p: number;
        t: string;
    };
    get_transactions_costs_values(tc: any, p: number): {
        fee_cost: any;
        slippage_cost: any;
        total: any;
    };
    backtest(): Promise<void>;
}
