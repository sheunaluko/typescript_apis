
import * as common from "../../../common/index"
import * as node from "../../../node/index"


import {backtest_balancer } from "../../../common/trading/index" ;
import * as viz from "./viz" 

const parser = node.external_apis.binance.historical_data.parser ;


let dir ="/Users/sheunaluko/dev/typescript_apis/local_data/binance_historical_data/spot/monthly/klines/ETHUSDT/1h"


export async function main() {

    //get the data
    let data = parser.parse_kline_csv_files(dir)
    //update the p and t fields for the backtester
    data.map( (x:any) => {
	x['p'] = x.open ;
	x['t'] = x.open_time ;
    })

    //create the backtester options 
    let ops = {
	base_asset : "ETH",
	quote_asset : "USDT",
	data, 
	initial_portfolio : { 
	    base_balance : 20 , 
	    quote_balance : 0 , 
	} , 
	logger_id : "ETHUSDT" , 
	fee : 0.001 , 
	slippage : 0.01,
	target_precision  : 0.05,
	target_ratio : 0.6,	
    }

    //create the backtester
    let backtester = new backtest_balancer.BacktestBalancer(ops) ;
    backtester.set_log_mode("quiet") ; //suppresses lots of logs 

    //Then run the backtest 
    await backtester.backtest() ;

    //and then...
    return backtester 

}

// plot




