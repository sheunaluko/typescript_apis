import * as tapi from "../../index"
const { node, common  } = tapi ;
const {hmac} = node.cryptography
const {R} = common; 

export type CoinbaseUserDataParams = {
    'secret_key' : string,
    'api_key' : string,
    'passphrase' : string , 
} 

/**
 * Returns user balances on pro.coinbase.com
 * @param params Dictionary containing the api key and api secret and passphrase 
 */
export async function get_coinbase_pro_user_balances(params: CoinbaseUserDataParams) {
    //see https://docs.cloud.coinbase.com/exchange/docs/authorization-and-authentication
    let {api_key, secret_key, passphrase} = params;
    let timestamp= (Date.now()/1000)
    let api_url = `https://api.exchange.coinbase.com/accounts` ;
    let requestPath = "/accounts" 
    let sig_data = timestamp + "GET" +  requestPath ;
    let sig = hmac({algorithm:'sha256', secret : Buffer.from(secret_key,'base64'), data : sig_data, digest : 'base64'})
    let headers = {"Accept": "application/json" ,
		   "CB-ACCESS-KEY" : api_key  ,
		   "CB-ACCESS-SIGN" :  sig ,
		   "CB-ACCESS-PASSPHRASE" : passphrase , 		   
		   "CB-ACCESS-TIMESTAMP" : timestamp} 
    let balances = await node.http.get_json_with_headers(api_url, headers)
    let non_zero = ((x:any)=> Number(x.balance) > 0)
    let parser = R.pipe(
	R.filter(non_zero),
	R.map(  (x:any)=> ({symbol : x.currency,
			    amount : (Number(x.hold) + Number(x.available)) }) ),
	R.sortBy( (x:any)=> -x.amount)
    )
    return parser(balances) 
				

}

/**
 * Returns user balances on coinbase.com
 * @param params Dictionary containing the api key and api secret and passphrase 
 */
export async function get_coinbase_balances(params: CoinbaseUserDataParams) {
    //see https://docs.cloud.coinbase.com/exchange/docs/authorization-and-authentication
    let {api_key, secret_key, passphrase} = params;
    let timestamp= (Date.now()/1000)
    let api_url = `https://api.exchange.coinbase.com/coinbase-accounts`
    let requestPath = "/coinbase-accounts" 
    let sig_data = timestamp + "GET" +  requestPath ;
    let sig = hmac({algorithm:'sha256', secret : Buffer.from(secret_key,'base64'), data : sig_data, digest : 'base64'})
    let headers = {"Accept": "application/json" ,
		   "CB-ACCESS-KEY" : api_key  ,
		   "CB-ACCESS-SIGN" :  sig ,
		   "CB-ACCESS-PASSPHRASE" : passphrase , 		   
		   "CB-ACCESS-TIMESTAMP" : timestamp} 
    let balances = await node.http.get_json_with_headers(api_url, headers)
    let non_zero = ((x:any)=> Number(x.balance) > 0)
    let parser = R.pipe(
	R.filter(non_zero),
	R.map(  (x:any)=> ({symbol : x.currency,
			    amount : (Number(x.hold_balance) + Number(x.balance)) }) ),
	R.sortBy( (x:any)=> -x.amount)
    )
    return parser(balances) 
} 


/**
 * Returns all user balances on both coinbase.com and pro.coinbase.com
 * @param params Dictionary containing the api key and api secret and passphrase 
 */
export async function get_user_balances(params: CoinbaseUserDataParams) {
    return {
	coinbase : await get_coinbase_balances(params) , 
	coinbase_pro : await get_coinbase_pro_user_balances(params) 
    } 
} 


