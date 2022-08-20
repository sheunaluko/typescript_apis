export declare type CoinbaseUserDataParams = {
    'secret_key': string;
    'api_key': string;
    'passphrase': string;
};
/**
 * Base function for making coinbase queries
 * @param params Dictionary containing the api key and api secret and passphrase
 */
export declare function coinbase_query(params: CoinbaseUserDataParams, api_url: string, requestPath: string): Promise<any>;
/**
 * Returns user accounts on pro.coinbase.com
 * @param params Dictionary containing the api key and api secret and passphrase
 */
export declare function get_coinbase_pro_user_accounts(params: CoinbaseUserDataParams): Promise<any>;
/**
 * Returns user balances on pro.coinbase.com
 * @param params Dictionary containing the api key and api secret and passphrase
 */
export declare function get_coinbase_pro_user_balances(params: CoinbaseUserDataParams): Promise<any[]>;
/**
 * Returns user accounts on coinbase.com
 * @param params Dictionary containing the api key and api secret and passphrase
 */
export declare function get_coinbase_user_accounts(params: CoinbaseUserDataParams): Promise<any>;
/**
 * Returns user balances on coinbase.com
 * @param params Dictionary containing the api key and api secret and passphrase
 */
export declare function get_coinbase_balances(params: CoinbaseUserDataParams): Promise<any[]>;
/**
 * Returns all user balances on both coinbase.com and pro.coinbase.com
 * @param params Dictionary containing the api key and api secret and passphrase
 */
export declare function get_user_balances(params: CoinbaseUserDataParams): Promise<{
    coinbase: any[];
    coinbase_pro: any[];
}>;
/**
 * Generates the account_id to currency mapping, which allows looking up the currency
 * which correpsonds to a given account id
 * @param params Dictionary containing the api key and api secret and passphrase
 */
export declare function get_account_id_mapping(params: CoinbaseUserDataParams): Promise<any>;
/**
 * Returns all user transfers on pro.coinbase.com
 * For now this is limited to 300 transfers.
 * @param params Dictionary containing the api key and api secret and passphrase
 */
export declare function get_user_transfers(params: CoinbaseUserDataParams): Promise<any>;
/**
 * Returns all user transfers (with the currencies resolved) on pro.coinbase.com
 * For now this is limited to 300 transfers.
 * @param params Dictionary containing the api key and api secret and passphrase
 */
export declare function get_resolved_user_transfers(params: CoinbaseUserDataParams): Promise<any>;
