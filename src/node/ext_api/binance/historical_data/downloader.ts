import {common, node} from "../../../../index"
var { io, puppeteer } = node ;
var {R} = common ; ; 


const log = common.logger.get_logger({id: "binancedld"}) ;

const dl_selector = "tr:not(:first-child) td:first-child a"; 

export async function extract_binance_market_data_links(page  : any) { 
    let tmp  =  await page.evaluate( (dl_selector : string)=>{ return Array.from(document.querySelectorAll(dl_selector) ).map((x:any)=> x.href)} , dl_selector)
    let tmp2 = R.splitEvery(2, tmp) 
    let result = tmp2.map(y=> ({checksum_link : y[0], zip_link : y[1]})) 
    return result
} 



export async function main() {
    let page = await puppeteer.new_page({});
    log("created new new page")
    await Promise.all([
	page.goto("https://data.binance.vision/?prefix=data/spot/monthly/klines/ETHUSDT/1h/"), 
	page.waitForSelector(dl_selector) 
    ])
    log("data available") 
    
    
    // -- 
    let data = await extract_binance_market_data_links(page) ;
    log("data retrieved") 
    return data

    // --
    // todo -- create tools for populating local data cache. 
} 

