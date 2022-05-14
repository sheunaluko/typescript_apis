import {ethers} from "ethers" ;
import * as pbl from "../trading/portfolio_balancer_lib" ; 
import UNISWAP from "@uniswap/sdk" ; 
import * as abis from  "./abis/index" ;
import * as tmgr from "./transaction_manager_lib" ; 
import {toEth} from "./utils" 

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

export type Token = {
    contract_address : string,
    decimals : number ,
    symbol : string,
    name : string, 

}  ;

export type GasOps = {
    low : ethers.BigNumber,
    medium : ethers.BigNumber,
    high : ethers.BigNumber ,
    usd_price : number, 
} 

export type GasEstimator = () => Promise<GasOps | null> ; 

export interface AMMParams extends EVMParams {
    router_address : string,
    pool_address : string, 
    chain_id : number,
    token0? : Token , 
    token1? : Token ,
    token0_is_base_asset : boolean ,
    gas_estimator : GasEstimator ,
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
    }

    async init() {

	this.log("Initializing")
	let { router_address,
	      pool_address,
	      chain_id,
	      token0 ,
	      token1 ,
	      token0_is_base_asset, 	      
	      provider } = this.params ;
	let v2abi = abis.uni_v2 ;
	// - 
	await this.connect_to_provider() ;

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
	    base_token_decimals : ( token0_is_base_asset ? this.token0.decimals : this.token1.decimals ) ,
	    quote_token_decimals : ( token0_is_base_asset ? this.token1.decimals : this.token0.decimals ) , 	    

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
	let gasInfo = (await this.params.gas_estimator()  as GasOps); 
	let overrides = {
	    gasPrice : gasInfo.medium , 
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
	
	let gas_info = await this.get_tx_gas_info(tx,gasInfo.usd_price) ; 

	return {tx , output_info, gas_info , gas_estimate}
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
	return await this.get_token_approval( tokens.base_token_contract as ethers.Contract , tokens.base_token_decimals)
    }

    async get_quote_token_approval() {
	let tokens = (this.tokens as TokensInfo)
	return await this.get_token_approval( tokens.quote_token_contract as ethers.Contract , tokens.quote_token_decimals)
    }

    async get_token_approval(c : ethers.Contract, decimals : number) {
	return Number(ethers.utils.formatUnits(c.allowance(this.wallet.address , (this.routerContract as ethers.Contract).address), decimals))
    } 

    
    async get_tx_gas_info(tx : any , usd_price : number ) {
	let {gasPrice, gasLimit } = tx ;
	let max_total_gas = gasPrice * gasLimit ;
	let l1_price_usd = usd_price ; 
	let max_total_gas_usd = max_total_gas*l1_price_usd ; 
	return {
	    max_total_gas ,
	    max_total_gas_usd,
	    l1_price_usd , 
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
