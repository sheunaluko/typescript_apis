export declare type UserDataParams = {
    'secret_key': string;
    'api_key': string;
};
/**
 * Returns user information (including balances)
 * @param params Dictionary containing the api key and api secret
 */
export declare function get_user_data(params: UserDataParams): Promise<any>;
/**
 * Returns user balances
 * @param params Dictionary containing the api key and api secret
 */
export declare function get_user_balances(params: UserDataParams): Promise<any>;
/**
 * Retrieves the current price of a given symbol
 * @param symbol - The symbol
 */
export declare function get_price(symbol: string): Promise<number>;
export declare type OrderType = "LIMIT" | "MARKET" | "STOP_LOSS" | "STOP_LOSS_LIMIT" | "TAKE_PROFIT" | "TAKE_PROFIT_LIMIT" | "LIMIT_MAKER";
export interface MarketOrderParams {
    side: string;
    symbol: string;
    quantity: number;
}
/**
 * Execute a market order
 * @param params - Market order parameters
 */
export declare function market_order(marketParams: MarketOrderParams, userParams: UserDataParams): Promise<any>;
