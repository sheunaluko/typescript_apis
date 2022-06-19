
/* 
   File for running backtests usings a portfolio balancer 
*/

import * as pbl from "./portfolio_balancer_lib"  ;


export type Portfolio = {
    base_balance : number,
    quote_balance : number, 
} 

export type BacktestData  = {t:Date , p : number}[]

    
export interface BacktestBalancerParams extends  pbl.BalanceParams {
    data : BacktestData ,
    initial_portfolio : Portfolio ,
    slippage : number,
    fee : number, 

} 

export class BacktestBalancer extends pbl.PortfolioBalancer {
    
    data : BacktestData ; 
    current_index : number  ;
    rebalances : any[] ; 
    portfolio : Portfolio ; 
    initial_portfolio  : Portfolio ;
    slippage : number ;
    fee : number ;


    constructor(p : BacktestBalancerParams) {
	super(p);
	this.data = p.data ; 
	this.current_index = -1 ;
	this.portfolio = p.initial_portfolio ;
	this.initial_portfolio = p.initial_portfolio ; 
	this.rebalances = [] ;
	this.slippage = p.slippage;
	this.fee = p.fee; 
    }

    async get_quote_balance(qa:string)  {
	return this.portfolio.quote_balance  ; 
    } 
    async get_base_balance(ba:string)  {
	return this.portfolio.base_balance ; 
    } 
    async get_base_price(ba:string,qa:string) {
	return (this.data[this.current_index]).p
    }
    async do_market_trade(trade_type : pbl.MarketTradeType, base_amt : number) {
	/* 
	   The following assumptions are made: 
	   1) A fee of this.fee is incurred and manifested as a reduction in the amount of the 
	   purchased asset by this.fee. For example, if 1 ETH is market bought, only 0.999 ETH 
	   will be credited (assuming this.fee = 0.001) 

	   2) A slippage of this.slippage is incurred with each trade. Assume that X units of 
	   base asset are being bought. This means Y units of quote asset should be  consumed.
	   Slippage manifests as Y*(1+this.slippage) being consumed for the trade. 
	   This is actually slightly different depending on market sell or buy - so I will need
	   to look more into this and adjust the code. 

	   3) The price at which the trade occurs is given by the 'p' field in the data object. 
	*/


	//first a sanity check 
	let base_price = await this.get_base_price("","") ;
	let current_data = this.data[this.current_index]  ;
	if (base_price != current_data.p) {
	    this.log("Sanity check failed! - there is a problem with price indexing") ;
	    process.exit(1) ; 
	}

	//then the trade mechanics --> 
	let { p , t  } = current_data ; 
	var new_base : number ;
	var new_quote : number ;
	//- 
	switch (trade_type ) {
	    case pbl.MarketTradeType.BUY :
		//market BUY the base token
		new_base = base_amt*(1-this.fee) ;
		new_quote = -(base_amt*p)*(1+this.slippage)
		break
	    case pbl.MarketTradeType.SELL :
		//market SELL the base token		
		new_base = -base_amt ; 
		new_quote = (base_amt*p)*(1-this.fee)*(1-this.slippage)
		break
	}
	//- 
	let new_base_amt  = this.portfolio.base_balance  += new_base  ; 
	let new_quote_amt = this.portfolio.quote_balance += new_quote ; 
	let new_portfolio_value = new_base_amt*p + new_quote_amt ;

	//now we update the rebalances array 
	this.rebalances.push({
	    index : this.current_index ,
	    p, t, 
	    trade_type ,
	    base_amt ,
	    quote_amt : (base_amt*p ),
	    portfolio  : {
		base_balance : new_base_amt ,
		quote_balance : new_quote_amt , 
		value : new_portfolio_value ,
		p, t, 
	    } 
	})

	//and finally the current porftolio object
	this.portfolio = {
	    base_balance : new_base_amt ,
	    quote_balance : new_quote_amt 
	}

	return { error : false, info : null } 
	//fin 
	
    }
    
    symbol_generator(ba:string, qa :string) { return "BACKTESTER"  } 

    async process_data() {
	this.current_index += 1 ;
	await this.balance_portfolio()
	// pretty elegant, huh? 
    }

    async backtest() {
	this.log("Starting backtest...")
	let len  = this.data.length  ; 
	for (var x = 0; x < len; x ++) {
	    await this.process_data()
	    if ( (x % 100) == 0 ) { this.log(`Progress = ${x}/${len}`)  } 
	}
	this.log("Done") 
    } 

} 
