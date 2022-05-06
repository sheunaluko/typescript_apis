
/*
  Tue May  3 14:28:15 CDT 2022
  implementing portfolio balancing trading strategy 

  Todo: 
    - should be able to use the portfolio balancer class for 
      - 1) active trading on EVM DEX 
      - 2) backtesting using historical data 
      - 3) active trading on CEX 

    - Best architecture is likely:  cronjob that launches a  process that reads parameter files  
        - each pair has its own folder with a parameters.json file as well as any resources needed for API calls 
	- a single process handles a single paair. Can start with sequential execution and architect for eventual concurrent processing 

    - [ ] create EVM balancer class in portfolio_balancer_lib.ts ; 

*/

import * as pbl from "../../common/trading/portfolio_balancer_lib"  ;
import * as wallets from "../ext_api/ethers/wallets"
import * as R from 'ramda'
import {ethers} from 'ethers' ;
import * as web3 from '../../common/web3/index' ;
import * as evmb from '../../common/web3/evm_balancers' ;

type V2BalancerArgs = {
    wallet : wallets.WALLET,
    provider : ethers.providers.JsonRpcProvider,
    router_address : string,
    router_abi :  string[],
    balancer_params : pbl.BalanceParams
} 

/**
 * Creates an EVM Balancer Instance 
 * 
 */
export function get_uni_v2_balancer(ops : V2BalancerArgs) {

    let {
	wallet, provider, router_address, router_abi, balancer_params 
    } = ops ; 

    let amm_params = {
	evm_wallet_instance : wallet.wallet,  
	provider : provider ,
	router_address,
	router_abi 
    } ;

    return new evmb.UniV2Balancer( R.mergeDeepLeft(amm_params, balancer_params) ) ;
    
} 


export {
    pbl 
} 
