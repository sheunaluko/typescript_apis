
/*
  Configure the repl environment for development purposes. 
*/

import * as apis from "./ext_api/index" ;
import * as R from 'ramda' ; 
import {get_logger} from "../common/logger";
import * as pb from "./trading/portfolio_balancer"; 
import * as web3 from '../common/web3/index' ;
import {get_wallet_by_address}  from '../node/ext_api/ethers/wallets' ;
import {get_json} from './http'

declare var global : any ; 

var {
    ethers , 
} =  apis ; 

const log = get_logger({id:"ndev"})

/**
 * Main function that runs after initialization of the repl. 
 * Use this to configure the nrepl environment prior to your use. 
 */
async function main() {
    
    // ---
    global.web3 = web3 ;
    let info = web3.info ; global.info = info; 
    global.wallets = ethers.wallets ;  let num_wallets = 5;

    // --- Generate or retrieve a set number of EVM wallets 
    log(`Generating ${num_wallets} evm wallets`) ;
    global.ws = await ethers.wallets.generate_numbered_wallets(num_wallets) ;

    /*
    //get infura provider
    let ArbitrumProvider = new ethers.ethers.providers.InfuraProvider( 'mainnet',
								       '67d14b6d72d04ca2a30fd1a0e9afb651') ;

    //get infura provider
    let EthereumProvider = new ethers.ethers.providers.InfuraProvider( 'mainnet',
								       'cdf1e43343174576b54246bf31a1f895') ;

    global.ArbitrumProvider = ArbitrumProvider ;
    global.EthereumProvider = EthereumProvider ;
    */

    let FantomProvider = new ethers.ethers.providers.JsonRpcProvider("https://rpc.ftm.tools/")
    
    global.FantomProvider = FantomProvider ;    


    let balancer_params = {
	base_asset : "FTM" ,
	logger_id : "ftmusdc.1" ,
	quote_asset : "USDC" ,
	target_precision : 0.05,
	target_ratio : 0.5 ,
    } ;

    //connect
    let wallet_address = "0x5806028f4F588E56bCB5d011465EbB4A91531946" ;
    let wallet_data  = (await get_wallet_by_address(wallet_address) as any)  ;
    let gas_estimator = async function()  {
	let api_key = process.env['FTMSCAN_API_KEY'] as string;
	let url  = `https://api.ftmscan.com/api?module=gastracker&action=gasoracle&apikey=${api_key}`
	log(`Using url for gasPrice =>  ${url}`) 
	let result : any = await get_json(url)  ;
	let {toGweiBN} = web3.utils ; 
	try {
	    return { 
		low : toGweiBN(result.result.SafeGasPrice),
		medium : toGweiBN(result.result.ProposeGasPrice), 
		high : toGweiBN(result.result.FastGasPrice),
		usd_price : Number(result.result['UsdPrice']) ,
	    } 
	} catch (error) {
	    return null ; 
	} 
    } 
    let ops = {
	evm_wallet_instance : wallet_data.wallet  , 
	provider : FantomProvider,
	router_address : info.fantom.mainnet.spookyswap.router.address ,
	pool_address : info.fantom.mainnet.spookyswap.pools.usdc_ftm.address , 
	balancer_params,
	chain_id : info.fantom.mainnet.chain_id ,
	token0 : info.fantom.mainnet.tokens.usdc , 
	token1 : info.fantom.mainnet.tokens.wftm ,
	token0_is_base_asset : false,
	gas_estimator ,
	max_slippage_percent : 1,
    }
    
    var w = new web3.evm_balancers.UniV2Balancer( R.mergeDeepLeft(ops , balancer_params) ) ; 
    await w.init()  ; 
    global.w = w ; global.wallet_data = wallet_data ;
    global.w3u = web3.ethers.utils 

    /* 
       TODO : 
       'gas required exceeds allowance ' is the error I am getting here 
     */ 
    
    global.go = async ()=> await w.generate_base_to_quote_swap_transaction(200,1)
}

await main() ; 

