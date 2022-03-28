/*
  HTTP Utilities 
*/
import fetch from 'node-fetch';
import * as tapi from "../index" ; 
const { node, common  } = tapi ;
let log = common.logger.get_logger({id: "http"}) 
    
export var debug = false ;

/**
 * Enable/Disable logging of http requests 
 * 
 */
export function set_debug(flag : boolean) { debug = flag} 

/**
 * Takes a url, performs http GET request and converts result to json
 * then returns the json. 
 */ 
export async function get_json(url : string) {
    let resp = await fetch(url) ;
    return (await resp.json())
}

/**
 * Same as get_json but sends the specified headers with the request 
 */ 
export async function get_json_with_headers(url : string, headers: any) {
    let resp = await fetch(url, {"headers" : headers,
				 "method" : "GET" }) ; 

    if (debug) {
	log(`Requested url ${url} with headers ${JSON.stringify(headers)}`)
	//console.log(resp) 
    }
    return (await resp.json() ) 
}


export {
    fetch 
} 
