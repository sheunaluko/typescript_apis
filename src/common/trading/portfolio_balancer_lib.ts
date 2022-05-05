
/*
  Tue May  3 12:49:15 CDT 2022
  Abstract logic for implementing portfolio balancing trading strategy 

  Todo: 
  - 1) create EVM balancer (extend PortfolioBalancer and BalanceParams) 
  - 2) create Backtest balancer 

*/


import {Logger} from "../util/logger"

export type MarketResult = {
    error : bool,
    info : any 
} 

export type MarketTradeType = "BUY" | "SELL" , 

export type BalanceParams = {
    logger_id : string,
    target_ratio : number, 
    target_precision : number; 
    quote_asset : 'string',
    base_asset : 'string' ,
    symbol_generator : (a:string,b:string)=>string ,
    get_quote_balance : (qa:string) => Promise<number>,
    get_base_balance : (ba:string) => Promise<number>,
    get_base_price : (ba:string,qa:string) => Promise<number> ,
    execute_market_trade : (trade_type : MarketTradeType, base_amt : number) => Promise<MarketResult> 
} 


/**
 * Creates a PortfolioBalancer object using the supplied parameters. 
 * See class methods. 
 */
export class PortfolioBalancer {

    var Params ;
    var Logger ; 
    constructor(params : BalanceParams) {
	this.Params = params ;
	this.Logger = Logger(params.logger_id) 
    }


    /**
     * Executes a portfolio balance using the supplied parameters 
     */
    async  balance_portfolio() {

	this.log("Balancing...") 
	let info = await this.get_balance_data() ; 
	let {
	    base_amt,quote_amt,base_price,portfolio_value,
	    current_ratio, ratio_error, target_achieved,
	    target_base_amt, base_delta , trade_type , base_market_amt 
	}  = info ; 

	this.log(info) ; 
	if (target_achieved) {
	    this.log("Target ratio already achieved. Returning")
	    return { balanced : false , balance_needed : false , info : null } 
	} else { 
	    //allocation ratio is outta whack
	    //need to rebalance the portfolio
	    this.log("Target ratio NOT achieved. Continuing.") 	    
	    this.log(`Processing order to ${trade_type} ${base_market_amt} ${base_asset}`)
	    let result = await this.execute_market_trade(trade_type,base_market_amt); 
	    let {error,info: result_info} = result ;
	    return { balanced : !error, balance_needed : true , info : result_info}
	} 
	
    }

    /**
     * Retrieve data about a potential rebalancing 
     */
    async  get_balance_data() {

	let {
	    target_ratio ,
	    target_precision , 
	    quote_asset ,
	    base_asset ,
	    symbol_generator ,
	    get_quote_balance ,
	    get_base_balance ,
	    get_base_price ,
	    get_quote_price
	    execute_market_trade , 
	}  = this.Params ;

	let base_amt        = await get_base_balance(base_asset) ;
	let quote_amt       = await get_quote_balance(quote_asset) ;     
	let base_price      = await get_base_price(base_asset,quote_asset) ;
	let portfolio_value = base_amt*base_price + quote_amt ; //in units of quote asset (usually USD) 
	let current_ratio   = base_amt*base_price / portfolio_value  ;
	let ratio_error     = target_ratio - current_ratio ;
	let target_achieved = ( Math.abs(ratio_error) < target_precision ) ;
	let target_base_amt = (portfolio_value * target_ratio)/base_price  ; 
	let base_delta      = target_base_amt - base_amt ;
	let trade_type      = (base_delta >= 0 ) ? "BUY" : "SELL" ;
	let base_market_amt = Math.abs(base_delta) ; 
	
	let info = {
	    base_amt,quote_amt,base_price,portfolio_value,
	    current_ratio, ratio_error, target_achieved,
	    target_base_amt, base_delta , trade_type , base_market_amt  
	} ;

	return info 
    }
    



    
    /**
     * Logs data via std method
     */
    log(v : any) { this.Logger(v) } 
    
}
    

export type EVMParams = {
    wallet_address : string, 
}




/**
 * Creates an EVM balancer object 
 */
export class EVMBalancer extends PortfolioBalancer {

    constructor(params : EVMParams ) {

	//build the constructor arguments for the super class

	//and instantiate it :) 
	super(superArgs) ; 
	
	
    } 

    
} 