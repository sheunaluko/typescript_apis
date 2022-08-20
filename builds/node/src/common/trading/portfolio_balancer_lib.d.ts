export declare type MarketResult = {
    error: boolean;
    info: any;
};
export declare enum MarketTradeType {
    BUY = 0,
    SELL = 1
}
export declare type BalanceParams = {
    logger_id: string;
    target_ratio: number;
    target_precision: number;
    quote_asset: string;
    base_asset: string;
    adaptive?: boolean;
    alpha?: number;
};
/**
 * Creates a PortfolioBalancer object using the supplied parameters.
 * See class methods.
 */
export declare abstract class PortfolioBalancer {
    Params: BalanceParams;
    Logger: any;
    last_balance_data: any;
    log_mode: string;
    state: any;
    constructor(params: BalanceParams);
    /**
     * Logs data via std method
     */
    log(v: any): void;
    /**
     * Performs a portfolio re-balance using the supplied parameters
     */
    balance_portfolio(): Promise<{
        balanced: boolean;
        balance_needed: boolean;
        info: any;
    }>;
    /**
     * Retrieve data about a potential rebalancing
     */
    get_balance_data(): Promise<{
        base_amt: number;
        quote_amt: number;
        base_price: number;
        portfolio_value: number;
        current_ratio: number;
        ratio_error: number;
        target_achieved: boolean;
        target_ratio: number;
        target_precision: number;
        target_base_amt: number;
        base_delta: number;
        trade_type: MarketTradeType;
        base_market_amt: number;
    }>;
    set_log_mode(s: string): void;
    abstract get_quote_balance(qa: string): Promise<number>;
    abstract get_base_balance(ba: string): Promise<number>;
    abstract get_base_price(ba: string, qa: string): Promise<number>;
    abstract do_market_trade(trade_type: MarketTradeType, base_amt: number): Promise<MarketResult>;
    abstract symbol_generator(ba: string, qa: string): string;
}
