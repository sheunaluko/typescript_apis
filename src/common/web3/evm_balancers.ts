import {ethers} from "ethers" ;
import * as pbl from "../trading/portfolio_balancer_lib" ; 
import UNISWAP from "@uniswap/sdk" ; 
import * as abis from  "./abis/index" ;
import {toEth} from "./utils" 
import {SmartWallet, TxType} from "./smart_wallet" ; 


export type GasOps = {
    low : ethers.BigNumber,
    medium : ethers.BigNumber,
    high : ethers.BigNumber ,
    usd_price : number, 
} 

export type GasEstimator = () => Promise<GasOps | null> ;

export interface EVMParams extends pbl.BalanceParams {
    smartWallet : SmartWallet  , 
}


/**
 * Creates an EVM balancer object 
 */
export abstract class EVMBalancer extends pbl.PortfolioBalancer {
    wallet : SmartWallet  ;
    
    constructor(params : EVMParams ) {
	super(params) ; 
	this.wallet = params.smartWallet ;  
    }
}

export type Token = {
    contract_address : string,
    decimals : number ,
    symbol : string,
    name : string, 

}  ;



export interface AMMParams extends EVMParams {
    router_address : string,
    pool_address : string, 
    chain_id : number,
    token0? : Token , 
    token1? : Token ,
    token0_is_base_asset : boolean ,
    max_slippage_percent : number  , 
}

type TokensInfo = {
    base_token : UNISWAP.Token | null ,
    quote_token : UNISWAP.Token | null ,
    base_token_contract : ethers.Contract | null ,
    quote_token_contract : ethers.Contract | null ,
    base_token_decimals : number | null ,
    quote_token_decimals : number | null , 
}

export class UniV2Balancer extends EVMBalancer {

    params : AMMParams ;
    routerContract : ethers.Contract | null ;
    poolContract : ethers.Contract | null  ;    
    token0 : UNISWAP.Token | null ;
    token1 : UNISWAP.Token | null ;
    token0Contract : ethers.Contract | null ;
    token1Contract : ethers.Contract | null ;
    tokens : TokensInfo | null ;
    maxNumAsString : string ; 
    gasLimitMultiple : number  ; 
    
    
    constructor(ammParams : AMMParams) {
	super(ammParams) ;
	this.params = ammParams ;
	this.routerContract = null;
	this.poolContract = null;
	this.token0 = null;
	this.token1 = null;
	this.token0Contract = null;
	this.token1Contract = null;
	this.tokens = null ;
	this.maxNumAsString = "115792089237316195423570985008687907853269984665640564039457584007913129639935" ;
	this.gasLimitMultiple = 1.2; 
    }

    async init() {

	this.log("Initializing")
	let { router_address,
	      pool_address,
	      chain_id,
	      token0 ,
	      token1 ,
	      token0_is_base_asset, 	      
	} = this.params ;
	let v2abi = abis.uni_v2 ;

	this.routerContract = new ethers.Contract(router_address,v2abi.router , this.wallet) ;
	this.poolContract = new ethers.Contract(pool_address, v2abi.pool , this.wallet) ;	
	/* 
	   Create the token objects if they exist 
	*/
	if (token0) {
	    let { contract_address, decimals, symbol, name } = token0 ; 
	    this.token0 = new UNISWAP.Token( chain_id, contract_address, decimals, symbol, name)
	    this.token0Contract = new ethers.Contract( contract_address, abis.erc20, this.wallet)	    
	} else {
	    this.token0 = null;
	    this.token0Contract = null;	    
	} 
	//  -- 
	if (token1) {
	    let { contract_address, decimals, symbol, name } = token1 ; 
	    this.token1 = new UNISWAP.Token( chain_id, contract_address, decimals, symbol, name)
	    this.token1Contract = new ethers.Contract( contract_address, abis.erc20, this.wallet)	    	    
	} else {
	    this.token1 = null;
	    this.token1Contract = null;	    	    
	}

	this.tokens = {
	    base_token : ( token0_is_base_asset ? this.token0 : this.token1 ) ,
	    quote_token : ( token0_is_base_asset ? this.token1 : this.token0 ) ,
	    base_token_contract : ( token0_is_base_asset ? this.token0Contract : this.token1Contract ) ,
	    quote_token_contract : ( token0_is_base_asset ? this.token1Contract : this.token0Contract ) ,
	    base_token_decimals : ( token0_is_base_asset ? (this.token0 as UNISWAP.Token).decimals : (this.token1 as UNISWAP.Token).decimals ) ,
	    quote_token_decimals : ( token0_is_base_asset ? (this.token1 as UNISWAP.Token).decimals : (this.token0 as UNISWAP.Token).decimals ) , 	    

	} 
	
	this.log("Initialization complete") 
	
    } 
    
    /*
         - The below functions use the provided
	    - this.token0Contract 
            - this.token1Contract 
	    - this.routerContract 
            - this.poolContract 
	 - Which are all connected to the wallet and the provider. 

	 //Helpful resources: 
	 //(1) ref https://github.com/BlockchainWithLeif/PancakeswapBot/blob/main/newbot.js
	 //(2) https://www.quicknode.com/guides/defi/how-to-swap-tokens-on-uniswap-with-ethers-js
	 
    */

    async get_base_balance(ba:string) : Promise<number> {
	let tokens = (this.tokens as TokensInfo) ;
	let base_token  = (tokens.base_token as UNISWAP.Token) ; 
	let quote_token = (tokens.quote_token as UNISWAP.Token) ; 
	let tmp =  (await ( tokens.base_token_contract as ethers.Contract).balanceOf(this.wallet.address)) ;
	let decimals = base_token.decimals ; 	
	return Number(ethers.utils.formatUnits( tmp.toString() , decimals )) ; 
    }

    async get_quote_balance(qa:string) : Promise<number> {
	let tokens = (this.tokens as TokensInfo) ;
	let base_token  = (tokens.base_token as UNISWAP.Token) ; 
	let quote_token = (tokens.quote_token as UNISWAP.Token) ; 
	let tmp =  (await ( tokens.quote_token_contract as ethers.Contract).balanceOf(this.wallet.address)) ;
	let decimals = quote_token.decimals ; 
	return Number(ethers.utils.formatUnits( tmp.toString() ,  decimals ) ) 
    }
    
    async get_base_price(ba:string,qa:string)  : Promise<number> {
	let { base_reserves, quote_reserves}  = await this.get_pool_reserves() ; 
	return quote_reserves/base_reserves ; 
    }


    /* 
       FYI the router abi has the following functions => 
       'function getAmountsOut(uint amountIn, address[] memory path) public view returns(uint[] memory amounts)',
       'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
    */ 
    async generate_base_to_quote_swap_transaction(amt : number, nonce : number ) {

	let wallet = (this.wallet as ethers.Wallet) ;
	let addr = (wallet.address as string) ;

	let overrides = {
	    nonce  ,
	    gasLimit : ethers.utils.parseUnits("120000",'gwei'), 
	}

	let output_info = await this.estimate_quote_out(amt) ;
	
	let {
	    amounts,
	    amountOutNoSlip,
	    amountIn,
	    amountOut,
	    slippageRatio,
	    slippagePercent,
	    path ,
	    max_slippage_percent ,
	    minAmountOutNum ,
	    minAmountOut, 
	} = output_info ;

	console.log(output_info) 

	/* 
	   TODO : 
	   'gas required exceeds allowance ' is the error I am getting here 
	   /-- will have to fix this somehow -- 
	   i.e google this error :) 
	*/

	await this.ensure_tokens_approved() ; 
	
	let gas_estimate = await (this.routerContract as ethers.Contract)
	    .estimateGas
	    .swapExactTokensForTokens(amountIn, minAmountOut, path, addr , (Date.now() + 1000 * 60*10) , overrides  ) ;

	return gas_estimate ;  // and then remove this line

	// and then incorporate gas estimate into the beloow transaction
	// by update overrides.gasLimit 
	
	let tx = await (this.routerContract as ethers.Contract)
	    .populateTransaction
	    .swapExactTokensForTokens(amountIn, minAmountOut, path, addr , (Date.now() + 1000 * 60*10) , overrides  ) ;
	
	return {tx , output_info,  gas_estimate}
    }

    /* 
       Makes sure that token tokens which need to be traded have each approved 
       The routerContract to spend on their behalf 
     */
    async ensure_tokens_approved() {
	let {
	    base_token,
	    quote_token,
	    base_token_contract,
	    quote_token_contract
	} = (this.tokens as TokensInfo) ;

	this.log("checking base token");
	return await (base_token_contract as ethers.Contract)
	    .allowance(this.wallet.address, (this.routerContract as ethers.Contract).address)


    }

    async get_base_token_approval() {
	let tokens = (this.tokens as TokensInfo)	
	return await this.get_token_approval( tokens.base_token_contract as ethers.Contract , tokens.base_token_decimals as number)
    }

    async get_quote_token_approval() {
	let tokens = (this.tokens as TokensInfo)
	return await this.get_token_approval( tokens.quote_token_contract as ethers.Contract , tokens.quote_token_decimals as number )
    }

    async get_token_approval(c : ethers.Contract, decimals : number) {
	let allowance = await c.allowance(this.wallet.address , (this.routerContract as ethers.Contract).address) ; 
	return allowance 
    }

    async base_token_approved() {
	return ( (await this.get_base_token_approval()).toString() == this.maxNumAsString ) 
    } 

    async quote_token_approved() {
	return ( (await this.get_quote_token_approval()).toString() == this.maxNumAsString ) 
    } 

    async generate_approve_token_tx(base_or_quote : string) {
	let {
	    wallet,addr,overrides,
	    base_token_contract , quote_token_contract, 
	    router_contract, 
	}  = await this.get_base_tx_ops() ;

	let token_contract = (base_or_quote == "BASE") ? base_token_contract : quote_token_contract  ; 

	overrides.gasLimit = ethers.utils.parseUnits("100000",'gwei') ;

	let maxBn = ethers.BigNumber.from(this.maxNumAsString)
	let gas_estimate = await token_contract.estimateGas.approve(router_contract.address, maxBn, overrides) ;

 	let new_gas = Math.ceil(this.gasLimitMultiple*Number(gas_estimate.toString())) ;
	let new_gas_BN  = ethers.BigNumber.from(String(new_gas)) ; 
	
	overrides.gasLimit = new_gas_BN ; 
	let tx = await token_contract.populateTransaction.approve(router_contract.address, maxBn , overrides) ;
	return {tx , gas_estimate , new_gas , new_gas_BN }
    }


    async get_base_tx_ops() {
	let wallet = (this.wallet as ethers.Wallet) ;
	let addr = (wallet.address as string) ;
	let overrides = await this.wallet.get_gas_overrides() 

	let {
	    base_token,
	    quote_token,
	    base_token_contract,
	    quote_token_contract
	} = (this.tokens as TokensInfo) ;
	
	return {
	    wallet,
	    addr,
	    from : addr, 
	    overrides ,
	    base_token : base_token as UNISWAP.Token,
	    quote_token : quote_token as UNISWAP.Token,
	    base_token_contract : base_token_contract as ethers.Contract,
	    quote_token_contract : quote_token_contract as ethers.Contract,
	    router_contract : this.routerContract as ethers.Contract,
	    
	} 
    } 
    
    get_tx_gas_info(tx : any , usd_price : number ) {
	let {gasPrice, gasLimit } = tx ;
	let max_total_gas = Number( ethers.utils.formatEther(gasPrice.mul(gasLimit)))  ;
	let l1_price_usd = usd_price ; 
	let max_total_gas_usd = max_total_gas*l1_price_usd ; 
	return {
	    max_total_gas ,
	    max_total_gas_usd,
	    l1_price_usd ,
	    gasPrice, gasLimit, 
	} 
    } 

    async estimate_quote_out(amt : number) {
	let tokens = this.tokens as TokensInfo ;
	let base_token = tokens.base_token as UNISWAP.Token; 
	let quote_token = tokens.quote_token as UNISWAP.Token ;

	var {
	    base_amt,quote_amt,base_price,portfolio_value,
	    current_ratio, ratio_error, target_achieved,
	    target_base_amt, base_delta , trade_type , base_market_amt  
	} = (await this.get_balance_data() ); 

	let amountIn = ethers.utils.parseUnits(String(amt), base_token.decimals);
	let path = [base_token.address,quote_token.address]  ;	
	let amountOutNoSlip = amt*base_price ;


	this.log(amountIn) ; 
	let amounts = await (this.routerContract as ethers.Contract).getAmountsOut(amountIn, path);
	let amountOut = Number(ethers.utils.formatUnits(amounts[1],quote_token.decimals))

	let slippageRatio = (amountOutNoSlip-amountOut)/amountOutNoSlip ;
	let slippagePercent = slippageRatio*100 ;
	let {max_slippage_percent} = this.params ; 
	let minAmountOutNum = (amountOutNoSlip*(1-max_slippage_percent/100) ).toFixed(quote_token.decimals);
	console.log(minAmountOutNum) ; 

	let minAmountOut = ethers.utils.parseUnits(String(minAmountOutNum), quote_token.decimals);	    
	
	return {
	    amounts,
	    amountOutNoSlip,
	    amountIn, 
	    amountOut,
	    slippageRatio,
	    slippagePercent,
	    max_slippage_percent,
	    minAmountOutNum,
	    minAmountOut, 
	    path 
	} 

    } 
    
    generate_transaction_fn(tx : any) {
	
    } 

    generate_quote_to_base_swap_transaction(amt : number ) {
	
    } 
    
    async get_pool_reserves() {
	let tokens = (this.tokens as TokensInfo) ;
	var tmp = await (this.poolContract as ethers.Contract).getReserves() ;	
	let token0reserves = toEth(tmp[0] , (this.token0 as UNISWAP.Token).decimals )
	let token1reserves = toEth(tmp[1] , (this.token1 as UNISWAP.Token).decimals )
	let base_reserves  = (this.params.token0_is_base_asset ? token0reserves : token1reserves)
	let quote_reserves  = (this.params.token0_is_base_asset ?  token1reserves : token0reserves)
	return {
	    token0reserves,
	    token1reserves,
	    base_reserves,
	    quote_reserves, 
	} 
	   
    } 
    
    async do_market_trade(trade_type : pbl.MarketTradeType, base_amt : number) : Promise<pbl.MarketResult> {
	return {error : false, info : null } 
    }
    
    symbol_generator(ba : string , qa : string )  : string {
	return `${ba}/${qa}`
    } 
    
} 
