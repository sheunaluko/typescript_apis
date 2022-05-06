
/*
  Configure the repl environment for development purposes. 
*/

import * as apis from "./ext_api/index" ;
import * as R from 'ramda' ; 
import {get_logger} from "../common/logger";
import * as pb from "./trading/portfolio_balancer"; 
import * as web3 from '../common/web3/index' ; 

declare var global : any ; 

let {
    ethers , 
} =  apis ; 

const log = get_logger({id:"ndev"})

/**
 * Main function that runs after initialization of the repl. 
 * Use this to configure the nrepl environment prior to your use. 
 */
async function main() {
    
    // --- 
    global.w = ethers.wallets ;  let w = global.w ; let num_wallets = 5;

    // --- Generate or retrieve a set number of EVM wallets 
    log(`Generating ${num_wallets} evm wallets`) ;
    global.ws = await w.generate_numbered_wallets(num_wallets) ;

    //get infura provider
    let ArbitrumProvider = new ethers.ethers.providers.InfuraProvider( 'mainnet',
								       '67d14b6d72d04ca2a30fd1a0e9afb651') ;

    //get infura provider
    let EthereumProvider = new ethers.ethers.providers.InfuraProvider( 'mainnet',
								       'cdf1e43343174576b54246bf31a1f895') ;

    let FantomProvider = new ethers.ethers.providers.JsonRpcProvider("https://rpc.ftm.tools/")
    
    global.ArbitrumProvider = ArbitrumProvider ;
    global.EthereumProvider = EthereumProvider ;
    global.FantomProvider = FantomProvider ;    


    /* 
       
     */ 

    let balancer_params = {
	base_asset : "FTM" ,
	logger_id : "ftmusdc.1" ,
	quote_asset : "USDC" ,
	target_precision : 0.05,
	target_ratio : 0.5 ,
    } ;

    //connect
    let w1 = w.LOADED_WALLETS[0] ;
    let v2args = {
	wallet : w1,
	provider : FantomProvider,
	router_address : web3.fantom.spookyswap.router.address ,
	router_abi : web3.uniswap2.router_abi ,
	balancer_params, 
    }
    
    let ammb = pb.get_uni_v2_balancer( v2args ) ; 
    await ammb.connect_to_provider(); 
    global.ammb = ammb ; 
    // - 
}

await main() ; 

