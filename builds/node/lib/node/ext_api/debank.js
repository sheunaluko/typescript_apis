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
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_tokens = exports.get_protocol_assets = void 0;
/*
   Interface to the debank api for crypto address use cases
*/
const http = __importStar(require("../http"));
const R = __importStar(require("ramda"));
/**
 *  Given a crypto currency address (EVM compatible), returns the users protocol assets across multiple
 *  EVM chains.
 */
function get_protocol_assets(u) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = 'https://openapi.debank.com/v1/user/complex_protocol_list?id=' + u;
        let raw = yield http.get_json(url);
        let parser = R.pipe(R.map(R.prop('portfolio_item_list')), R.flatten, R.map(R.pipe(R.prop('detail'), R.values)), R.flatten, R.map(R.pick(['chain',
            'symbol',
            'amount',
            'price',
            'name',
            'protocol_id'])));
        return parser(raw);
    });
}
exports.get_protocol_assets = get_protocol_assets;
/**
 *  Given a crypto currency address (EVM compatible), returns the users tokens across multiple
 *  EVM chains, sorted by total USD value
 *  @param u The crypto address string
 *  @param thresh The dollar value threshold to filter the returned tokens by
 */
function get_tokens(u, thresh) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = 'https://openapi.debank.com/v1/user/token_list?is_all=true&id=' + u;
        let raw = yield http.get_json(url);
        let parser = R.pipe(R.map((d) => R.assoc('usd_value', d.price * d.amount, d)), R.filter((x) => (x.usd_value > thresh) && x.is_verified), R.map(R.pick(['symbol', 'name', 'chain', 'price', 'amount', 'usd_value'])), R.sortBy((x) => -x.usd_value));
        return parser(raw);
    });
}
exports.get_tokens = get_tokens;
