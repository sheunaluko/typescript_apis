import * as pbl from "../../common/trading/portfolio_balancer_lib";
import { binanceus } from "../ext_api/index";
export interface BinanceUsBalanceParams extends pbl.BalanceParams {
    keys: binanceus.UserDataParams;
}
export declare class BinanceUsBalancer extends pbl.PortfolioBalancer {
    params: BinanceUsBalanceParams;
    constructor(p: BinanceUsBalanceParams);
    get_base_balance(ba: string): Promise<number>;
    get_quote_balance(qa: string): Promise<number>;
    get_base_price(ba: string, qa: string): Promise<number>;
    do_market_trade(trade_type: pbl.MarketTradeType, base_amt: number): Promise<{
        error: boolean;
        info: any;
    }>;
    symbol_generator(ba: string, qa: string): string;
}
