import fetch from 'node-fetch';
export declare var debug: boolean;
/**
 * Enable/Disable logging of http requests
 *
 */
export declare function set_debug(flag: boolean): void;
/**
 * Takes a url, performs http GET request and converts result to json
 * then returns the json.
 */
export declare function get_json(url: string): Promise<any>;
/**
 * Takes a url, and data in form of URLSearchParams, performs http POST request and converts result to json
 * then returns the json.
 */
export declare function post_get_json(url: string, params: URLSearchParams): Promise<any>;
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
export declare function post_with_headers_get_json(url: string, params: URLSearchParams, headers: any): Promise<any>;
/**
 * Same as get_json but sends the specified headers with the request
 */
export declare function get_json_with_headers(url: string, headers: any): Promise<any>;
/**
 * Streams a web asset to local disk (i.e. downloads it)
 * @param url - The url of the resource to download
 * @param fname - The local filepath to download the asset to
 */
export declare function download_url_to_file(url: string, fname: string): Promise<void>;
export { fetch, };
