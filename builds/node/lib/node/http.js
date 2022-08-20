"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetch = exports.download_url_to_file = exports.get_json_with_headers = exports.post_with_headers_get_json = exports.post_get_json = exports.get_json = exports.set_debug = exports.debug = void 0;
/*
  Network/HTTP Utilities
*/
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.fetch = node_fetch_1.default;
const fs_1 = __importDefault(require("fs"));
const io = __importStar(require("./io"));
const common = __importStar(require("../common/index"));
let log = common.logger.get_logger({ id: "http" });
exports.debug = false;
/**
 * Enable/Disable logging of http requests
 *
 */
function set_debug(flag) { exports.debug = flag; }
exports.set_debug = set_debug;
/**
 * Takes a url, performs http GET request and converts result to json
 * then returns the json.
 */
function get_json(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let resp = yield (0, node_fetch_1.default)(url);
        return (yield resp.json());
    });
}
exports.get_json = get_json;
/**
 * Takes a url, and data in form of URLSearchParams, performs http POST request and converts result to json
 * then returns the json.
 */
function post_get_json(url, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, node_fetch_1.default)(url, { method: 'POST', body: params });
        const data = yield response.json();
        return data;
    });
}
exports.post_get_json = post_get_json;
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
function post_with_headers_get_json(url, params, headers) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, node_fetch_1.default)(url, { method: 'POST', body: params, headers });
        const data = yield response.json();
        return data;
    });
}
exports.post_with_headers_get_json = post_with_headers_get_json;
/**
 * Same as get_json but sends the specified headers with the request
 */
function get_json_with_headers(url, headers) {
    return __awaiter(this, void 0, void 0, function* () {
        let resp = yield (0, node_fetch_1.default)(url, { "headers": headers,
            "method": "GET" });
        if (exports.debug) {
            log(`Requested url ${url} with headers ${JSON.stringify(headers)}`);
            //console.log(resp) 
        }
        return (yield resp.json());
    });
}
exports.get_json_with_headers = get_json_with_headers;
/**
 * Streams a web asset to local disk (i.e. downloads it)
 * @param url - The url of the resource to download
 * @param fname - The local filepath to download the asset to
 */
function download_url_to_file(url, fname) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield (0, node_fetch_1.default)(url);
        io.ensure_parents(fname);
        const fileStream = fs_1.default.createWriteStream(fname);
        yield new Promise((resolve, reject) => {
            let body = res.body;
            body.pipe(fileStream);
            body.on("error", reject);
            fileStream.on("finish", resolve);
        });
    });
}
exports.download_url_to_file = download_url_to_file;
