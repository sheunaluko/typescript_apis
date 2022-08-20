"use strict";
/*
  Binance us apis
*/
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.market_order = exports.get_price = exports.get_user_balances = exports.get_user_data = void 0;
const common = __importStar(require("../../common/index"));
const node = __importStar(require("../../node/index"));
const cryptography_1 = require("../cryptography");
const log = common.logger.get_logger({ id: "binanceus" });
/**
 * Returns user information (including balances)
 * @param params Dictionary containing the api key and api secret
 */
function get_user_data(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let { api_key, secret_key } = params;
        let timestamp = Number(new Date());
        let api_url = "https://api.binance.us";
        let sig = (0, cryptography_1.hmac)({ algorithm: 'sha256', secret: secret_key, data: `timestamp=${timestamp}`, digest: 'hex' });
        let url = `${api_url}/api/v3/account?timestamp=${timestamp}&signature=${sig}`;
        let headers = { 'X-MBX-APIKEY': api_key };
        return yield node.http.get_json_with_headers(url, headers);
    });
}
exports.get_user_data = get_user_data;
/**
 * Returns user balances
 * @param params Dictionary containing the api key and api secret
 */
function get_user_balances(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let balances = (yield get_user_data(params)).balances;
        let non_zero = ((x) => Number(x.free) > 0);
        return balances.filter(non_zero).map((x) => ({ symbol: x.asset,
            amount: (Number(x.free) + Number(x.locked))
        }));
    });
}
exports.get_user_balances = get_user_balances;
/**
 * Retrieves the current price of a given symbol
 * @param symbol - The symbol
 */
function get_price(symbol) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `https://api.binance.us/api/v3/ticker/price?symbol=${symbol}`;
        return Number((yield node.http.get_json(url)).price);
    });
}
exports.get_price = get_price;
/**
 * Execute a market order
 * @param params - Market order parameters
 */
function market_order(marketParams, userParams) {
    return __awaiter(this, void 0, void 0, function* () {
        let { side, symbol, quantity } = marketParams;
        let { secret_key, api_key, } = userParams;
        let timestamp = Number(new Date());
        let api_url = "https://api.binance.us";
        let url_data = `symbol=${symbol}&side=${side}&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;
        log(`Using url_data: ${url_data}`);
        let sig = (0, cryptography_1.hmac)({ algorithm: 'sha256', secret: secret_key, data: url_data, digest: 'hex' });
        let url = `${api_url}/api/v3/order`;
        let params = new URLSearchParams();
        let args = [
            ['symbol', symbol],
            ['side', side],
            ['type', 'MARKET'],
            ['quantity', String(quantity)],
            ['timestamp', String(timestamp)],
            ['signature', sig]
        ];
        for (var [k, v] of args) {
            params.append(k, v);
        }
        let headers = { 'X-MBX-APIKEY': api_key };
        return yield node.http.post_with_headers_get_json(url, params, headers);
    });
}
exports.market_order = market_order;
