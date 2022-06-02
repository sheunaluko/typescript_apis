/*
  Configure the repl environment for development purposes. 
*/

import * as apis from "./ext_api/index" ;
import * as R from 'ramda' ; 
import {get_logger} from "../common/logger";
import * as web3 from '../common/web3/index' ;
import {get_smart_wallet_by_address,
	get_wallet_by_address,
}  from '../node/ext_api/ethers/wallets' ;
import {MaxGasType,
	TxType , 
	SmartWallet} from '../common/web3/smart_wallet' ;

declare var global : any ; 
var ethers = apis.ethers.ethers;

const log = get_logger({id:"ndev"})

/**
 * Main function that runs after initialization of the repl. 
 * Use this to configure the nrepl environment prior to your use. 
 */
async function main() {
    await configure_repl() ;
    let e1  = await get_ether_smart_wallet(addr.bot1) ;
    let e2  = await get_ether_smart_wallet(addr.bot2) ;    
    let f1  = await get_fantom_smart_wallet(addr.bot1)  ;
    let f2  = await get_fantom_smart_wallet(addr.bot2)  ;
    let p1  = await get_polygon_smart_wallet(addr.bot1)  ;
    let p2  = await get_polygon_smart_wallet(addr.bot2)  ;    
    let test = async function(gwei :number) {
	return await e1.smart_eth_transfer({to: addr.bot2 , amt : "0.0001" , max_gas_ops : {type : MaxGasType.GasPrice , value : gwei_to_bn(gwei) }})
    } ; 
    
    let smart_gwei_send = async function(sw : SmartWallet , to : string, amt : string, gwei : number ) {
	return await sw.smart_eth_transfer({to , amt, max_gas_ops : {type : MaxGasType.GasPrice , value : gwei_to_bn(gwei) } }) 
    }  ;
    
    Object.assign( global , {e1, e2 , f1, f2 ,p1,p2, test , smart_gwei_send  }   ) 
    
}

async function get_ether_smart_wallet(addr : string) {
    return await get_smart_wallet_by_address(addr,get_provider(ProviderType.Ethereum), TxType.EIP_1559)
}

async function get_fantom_smart_wallet(addr : string) {
    return await get_smart_wallet_by_address(addr,get_provider(ProviderType.Fantom), TxType.LEGACY)
}

async function get_polygon_smart_wallet(addr : string) {
    return await get_smart_wallet_by_address(addr,get_provider(ProviderType.Polygon), TxType.LEGACY ) //maxFeePerGas is innacutate -- gasPrice works better? NOt sure if this is an RPC endpoint issue... 
}

var addr = {
    'anyswap' : '0x4F730dbC5C4753068BBd32e13f23F6c3f162b303' ,
    'bot1' : "0x9FF8E70bf57f3C522F32400aDdB4AE4dD9922B9F"  ,
    'bot2' : "0xA137aCD905fC9B133C418D0042E994a50D19F7bA", 
}

function gwei_to_bn(gwei: number ) {
    return ethers.utils.parseUnits( String(gwei) , 'gwei')  ; 
} 


async function l1_tx(sw: SmartWallet) {

    let tx = await sw.generate_l1_transfer_tx( addr.anyswap , "0.005" ) ; 

    let tx_ops = {
	tx ,
	max_gas_ops : { 
	    type : MaxGasType.TxFee ,
	    value : ethers.utils.parseEther("0.0001") ,
	} ,
	timeout_ms : 1000*20 ,
	max_retries : 5 ,
    } 

    return {
	tx, tx_ops 
    } 
} 

async function configure_repl() {
    // ---
    let {info} = web3 ;
    Object.assign(global, {
	web3,
	wallets : apis.ethers.wallets,
	u : web3.ethers.utils  ,
	R,
	apis,
	sw : web3.smart_wallet  ,
	addr ,
	gwei_to_bn, 
    })

}

enum ProviderType {
    Ethereum,
    Fantom ,
    Arbitrum,
    Polygon,
}

function get_provider(p : ProviderType) {
    switch (p) {
	case ProviderType.Ethereum :
	    return new ethers.providers.InfuraProvider( 'mainnet', process.env['ETHER_INFURA_PROJECT_ID'] ) ;
	    break
	case ProviderType.Fantom :
	    return new ethers.providers.JsonRpcProvider("https://rpc.ftm.tools/") ; 
	    break 
	case ProviderType.Arbitrum :
	    return new ethers.providers.InfuraProvider( 'mainnet', process.env['ARBITRUM_INFURA_PROJECT_ID'] ) ; 
	    break
	case ProviderType.Polygon :
	    return new ethers.providers.JsonRpcProvider('https://polygon-rpc.com') ; 
	    break
    } 
} 

async function amm_balancer() {
    let info = web3.info ; 
    let balancer_params = {
	base_asset : "FTM" ,
	logger_id : "ftmusdc.1" ,
	quote_asset : "USDC" ,
	target_precision : 0.05,
	target_ratio : 0.5 ,
    } ;
    const addr = "0x9FF8E70bf57f3C522F32400aDdB4AE4dD9922B9F" ;
    let smartWallet  = await get_fantom_smart_wallet(addr)  ; 
    let ops = {
	smartWallet , 
	router_address : info.fantom.mainnet.spookyswap.router.address ,
	pool_address : info.fantom.mainnet.spookyswap.pools.usdc_ftm.address , 
	balancer_params,
	chain_id : info.fantom.mainnet.chain_id ,
	token0 : info.fantom.mainnet.tokens.usdc , 
	token1 : info.fantom.mainnet.tokens.wftm ,
	token0_is_base_asset : false,
	max_slippage_percent : 1,
    }
    
    var w = new web3.evm_balancers.UniV2Balancer( R.mergeDeepLeft(ops , balancer_params) ) ; await w.init()  ; 
    global.w = w ; 
}

await main() ; 

