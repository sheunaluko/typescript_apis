/*
  HTTP Utilities 
*/
import fetch from 'node-fetch';

/**
 * Takes a url, performs http GET request and converts result to json
 * then returns the json. 
 */ 
export async function http_get_json(url : string) {
    let resp = await fetch(url) ;
    return (await resp.json())
} 


