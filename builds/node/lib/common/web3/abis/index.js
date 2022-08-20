"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.erc20 = exports.uni_v2 = void 0;
const erc20_1 = __importDefault(require("./erc20")); // assert {type : 'json' } ;
exports.erc20 = erc20_1.default;
const uniswap_v2_router_abi_1 = __importDefault(require("./uniswap_v2_router_abi")); // assert { type: 'json' }; 
const uniswap_v2_pool_abi_1 = __importDefault(require("./uniswap_v2_pool_abi")); // assert { type: 'json' }; 
exports.uni_v2 = {
    router: uniswap_v2_router_abi_1.default,
    pool: uniswap_v2_pool_abi_1.default,
};
