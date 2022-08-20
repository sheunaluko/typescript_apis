import * as pbl from "../../common/trading/portfolio_balancer_lib"
import {binanceus} from "../ext_api/index" 

export interface BinanceUsBalanceParams extends pbl.BalanceParams {
    keys : binanceus.UserDataParams 
}


export class BinanceUsBalancer extends pbl.PortfolioBalancer {

    params : BinanceUsBalanceParams ; 
    
    constructor(p : BinanceUsBalanceParams ) {
	super(p) ; 
	this.params = p ; 
    }

    async get_base_balance(ba:string) : Promise<number> {
	let balances = await binanceus.get_user_balances(this.params.keys)
	return (balances.filter( (x:any)=> (x.symbol.trim() == this.params.base_asset.trim())) )[0].amount
    }

    async get_quote_balance(qa:string) : Promise<number> {
	let balances = await binanceus.get_user_balances(this.params.keys)
	return (balances.filter( (x:any)=> (x.symbol.trim() == this.params.quote_asset.trim())) )[0].amount
    }

    async get_base_price(ba:string,qa:string)  : Promise<number> {
	let symbol = this.symbol_generator(ba, qa) ; 
	let price = (await binanceus.get_price(symbol)) ;
	this.log(`Got price ${price} for sym ${symbol}`) ;
	return (price as number)  ; 
    }

    async do_market_trade(trade_type : pbl.MarketTradeType, base_amt : number)  {

	this.log(`Truncating ${base_amt} to 4 decimals fyi`) ;
	base_amt = Number(base_amt.toFixed(4)) ;//note that only 4 decimals are included

	
	let symbol = this.symbol_generator("","") ;
	var result : any ; 
	try {
	    var ops : any ; 
	    switch (trade_type ) {
		case pbl.MarketTradeType.BUY :
		    ops = {
			symbol ,
			side : "BUY" ,
			quantity : base_amt
		    } 
		    result = await binanceus.market_order(ops, this.params.keys)
		    break
		case pbl.MarketTradeType.SELL :
		    ops = {
			symbol ,
			side : "SELL" ,
			quantity : base_amt
		    } 
		    result = await binanceus.market_order(ops, this.params.keys)
		    break
		default :
		    let info =  `Unrecognized trade type: ${trade_type}` ; 
		    this.log(info) 
		    return { error : true, info  } 
	    }
	} catch (e) {
	    this.log("Error doing market trade...")
	    this.log(e)
	    return { error : true , info : e } 
	} 

	this.log("Market trade successful!") 
	return {error : false, info : result } ;
    }
    
    symbol_generator(ba : string , qa : string )  {
	return `${this.params.base_asset}${this.params.quote_asset}`
    } 
    
	
} 
