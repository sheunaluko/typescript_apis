import {ethers} from "ethers" ;
import * as pbl from "../trading/portfolio_balancer_lib" 


export interface EVMParams extends pbl.BalanceParams {
    evm_wallet_instance : ethers.Wallet,
    provider : ethers.providers.JsonRpcProvider , 
}


/**
 * Creates an EVM balancer object 
 */
export abstract class EVMBalancer extends pbl.PortfolioBalancer {
    wallet : ethers.Wallet; 
    provider : ethers.providers.JsonRpcProvider ; 
    
    constructor(params : EVMParams ) {
	//build the constructor arguments for the super class
	//and instantiate it :) 
	super(params) ;
	this.wallet = params.evm_wallet_instance ;
	this.provider = params.provider ;
    }

    async connect_to_provider() {
	this.log("Attempting to connect wallet to provider") ; 
	this.wallet = await this.wallet.connect(this.provider)  ;
	this.log("Done") ; 
    } 
}


export interface AMMParams extends EVMParams {
    router_address : string,
    router_abi : string[] , 
} 

export class UniV2Balancer extends EVMBalancer {

    params : AMMParams ;
    routerContract : ethers.Contract ; 

    constructor(ammParams : AMMParams) {
	super(ammParams) ;
	this.params = ammParams ;
	let { router_address, router_abi, provider } = ammParams ; 
	this.routerContract = new ethers.Contract(router_address, router_abi, provider) ;  
    }

    /*
    async getPoolImmutables() {
	let data  = {
	    token0: await this.poolContract.token0(),
	    token1: await this.poolContract.token1(),
	}
	return data 
    }
    */

    async get_quote_balance(qa:string) : Promise<number> {
	return 10 ; 
    }
    
    async get_base_balance(ba:string) : Promise<number> {
	return 10 ;  
    }
    
    async get_base_price(ba:string,qa:string)  : Promise<number> {
	return 10 ; 
    }
    
    async do_market_trade(trade_type : MarketTradeType, base_amt : number) : Promise<MarketResult> {
	return {error : false, info : null } 
    }
    
    symbol_generator(ba : string , qa : string )  : string {
	return `${ba}/${qa}`
    } 
    
} 
