

/*
  HTTP Utilities 
*/
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom'; 
import fs from 'fs';
import extract from 'extract-zip';

import * as tapi from "../index" ; 
const { node, common  } = tapi ;

const { io } = node ; 
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
 * Takes a url, and data in form of URLSearchParams, performs http POST request and converts result to json
 * then returns the json. 
 */ 
export async function post_get_json(url : string, params : URLSearchParams) {
    const response = await fetch(url, {method: 'POST', body: params});
    const data = await response.json()    
    return data ; 
}

/**
 * Takes a url, and data in form of URLSearchParams, and header, then performs http POST request and converts result to json
 * then returns the json. 
 * @example 
 * Heres a post example that returns a json object. 
 * ```
 * const params = new URLSearchParams();
 * params.append('a', 1);
 * let headers = {} ; 
 * let url = "" ; 
 * let result = await post_with_headers_get_json(url, params, headers) ; 
 * ```
 */ 
export async function post_with_headers_get_json(url : string, params : URLSearchParams, headers : any) {
    const response = await fetch(url, {method: 'POST', body: params, headers });
    const data = await response.json()    
    return data ; 
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

/**
 * Streams a web asset to local disk (i.e. downloads it) 
 * @param url - The url of the resource to download 
 * @param fname - The local filepath to download the asset to 
 */ 
export async function download_url_to_file(url : string, fname : string) {
    const res = await fetch(url);
    const fileStream = fs.createWriteStream(fname);
    await new Promise((resolve, reject) => {
	let body = (res.body as any) ;
	body.pipe(fileStream);
	body.on("error", reject);
	fileStream.on("finish", resolve);
    });
}


/**
 * Extracts a zip file to a directory 
 * @param fname - The local filename 
 * @param target - Target directory 
 */ 
export async function unzip_to_directory(fname : string,  target : string) {
    try {
	await extract(fname, { dir: target })
	log(`unzip complete | ${fname}`)
    } catch (err) {
	// handle any errors
	log(`unzip error | ${fname}`)	
	log(err) 
    }    
} 




export {
    fetch ,
    JSDOM, 
} 
