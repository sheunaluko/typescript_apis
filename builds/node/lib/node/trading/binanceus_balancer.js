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
exports.BinanceUsBalancer = void 0;
const pbl = __importStar(require("../../common/trading/portfolio_balancer_lib"));
const index_1 = require("../ext_api/index");
class BinanceUsBalancer extends pbl.PortfolioBalancer {
    constructor(p) {
        super(p);
        this.params = p;
    }
    get_base_balance(ba) {
        return __awaiter(this, void 0, void 0, function* () {
            let balances = yield index_1.binanceus.get_user_balances(this.params.keys);
            return (balances.filter((x) => (x.symbol.trim() == this.params.base_asset.trim())))[0].amount;
        });
    }
    get_quote_balance(qa) {
        return __awaiter(this, void 0, void 0, function* () {
            let balances = yield index_1.binanceus.get_user_balances(this.params.keys);
            return (balances.filter((x) => (x.symbol.trim() == this.params.quote_asset.trim())))[0].amount;
        });
    }
    get_base_price(ba, qa) {
        return __awaiter(this, void 0, void 0, function* () {
            let symbol = this.symbol_generator(ba, qa);
            let price = (yield index_1.binanceus.get_price(symbol));
            this.log(`Got price ${price} for sym ${symbol}`);
            return price;
        });
    }
    do_market_trade(trade_type, base_amt) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`Truncating ${base_amt} to 4 decimals fyi`);
            base_amt = Number(base_amt.toFixed(4)); //note that only 4 decimals are included
            let symbol = this.symbol_generator("", "");
            var result;
            try {
                var ops;
                switch (trade_type) {
                    case pbl.MarketTradeType.BUY:
                        ops = {
                            symbol,
                            side: "BUY",
                            quantity: base_amt
                        };
                        result = yield index_1.binanceus.market_order(ops, this.params.keys);
                        break;
                    case pbl.MarketTradeType.SELL:
                        ops = {
                            symbol,
                            side: "SELL",
                            quantity: base_amt
                        };
                        result = yield index_1.binanceus.market_order(ops, this.params.keys);
                        break;
                    default:
                        let info = `Unrecognized trade type: ${trade_type}`;
                        this.log(info);
                        return { error: true, info };
                }
            }
            catch (e) {
                this.log("Error doing market trade...");
                this.log(e);
                return { error: true, info: e };
            }
            this.log("Market trade successful!");
            return { error: false, info: result };
        });
    }
    symbol_generator(ba, qa) {
        return `${this.params.base_asset}${this.params.quote_asset}`;
    }
}
exports.BinanceUsBalancer = BinanceUsBalancer;
