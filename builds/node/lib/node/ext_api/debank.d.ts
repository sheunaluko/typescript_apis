/**
 *  Given a crypto currency address (EVM compatible), returns the users protocol assets across multiple
 *  EVM chains.
 */
export declare function get_protocol_assets(u: string): Promise<Pick<unknown, never>[]>;
export declare type TokenReturn = {
    'symbol': string;
    'name': string;
    'chain': string;
    'price': number;
    'amount': number;
    'usd_value': number;
};
/**
 *  Given a crypto currency address (EVM compatible), returns the users tokens across multiple
 *  EVM chains, sorted by total USD value
 *  @param u The crypto address string
 *  @param thresh The dollar value threshold to filter the returned tokens by
 */
export declare function get_tokens(u: string, thresh: number): Promise<TokenReturn[]>;
