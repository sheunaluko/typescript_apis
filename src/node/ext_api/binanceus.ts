/*
  Binance us apis 
*/

import * as tapi from "../../index"
const { node, common  } = tapi ;
const {hmac} = node.cryptography

// -- 

export type UserDataParams = {
    'secret_key' : string,
    'api_key' : string, 
} 

/**
 * Returns user information (including balances) 
 * @param params Dictionary containing the api key and api secret 
 */
export async function get_user_data(params: UserDataParams) {
    let {api_key, secret_key} = params; 
    let timestamp=Number(new Date()) ; 
    let api_url="https://api.binance.us"
    let sig = hmac({algorithm:'sha256', secret : secret_key, data : `timestamp=${timestamp}`, digest : 'hex'})
    let url = `${api_url}/api/v3/account?timestamp=${timestamp}&signature=${sig}`
    let headers = {'X-MBX-APIKEY': api_key} 
    return await node.http.get_json_with_headers(url, headers)
} 

/**
 * Returns user balances
 * @param params Dictionary containing the api key and api secret 
 */
export async function get_user_balances(params: UserDataParams) {
    let balances = (await get_user_data(params) as any ).balances  ; 
    let non_zero = ((x:any)=> Number(x.free) > 0) ; 
    return balances.filter(non_zero).map( (x:any)=> ({symbol : x.asset,
						      amount : (Number(x.free) + Number(x.locked))
						     })) 
} 
