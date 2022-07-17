
import * as tsa from "../index"
const { common, node } =  tsa  ;

const bokeh = node.external_apis.bokeh

import {downloader as dl , parser } from "./ext_api/binance/historical_data/index" ;
import * as btdev from "./arpa/backtesting/dev" 



declare var global : any ;
let log = console.log ; 

const dir  = "/Users/sheunaluko/dev/typescript_apis/local_data/binance_historical_data/zips/" ;
var test_dir = "/Users/sheunaluko/dev/typescript_apis/local_data/binance_historical_data/spot/monthly/klines/ETHUSDT/1h"

let f1 = async function() {
    var d = await dl.get_links_for_page(dl.test_page)
    let x = d[0]
    log("... handling link ")
    await dl.handle_link_object(dir, x)  
} 

let f2 = async function() {
    await dl.download_data_for_page(dir,dl.test_page) 
}


var i = bokeh.api.get_interface() 

Object.assign( global , {
    dl ,
    dir ,
    parser ,
    test_dir ,
    f1,
    f2 ,
    btdev ,
    apis : node.external_apis  ,
    plt : bokeh.plots , 
    i ,
    bapi : bokeh.api ,
    mm : common.module_manager  ,
    tsa, 
})
