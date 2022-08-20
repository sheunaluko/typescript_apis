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
exports.get_resolved_user_transfers = exports.get_user_transfers = exports.get_account_id_mapping = exports.get_user_balances = exports.get_coinbase_balances = exports.get_coinbase_user_accounts = exports.get_coinbase_pro_user_balances = exports.get_coinbase_pro_user_accounts = exports.coinbase_query = void 0;
const common = __importStar(require("../../common/index"));
const node = __importStar(require("../../node/index"));
const cryptography_1 = require("../cryptography");
const { R } = common;
/**
 * Base function for making coinbase queries
 * @param params Dictionary containing the api key and api secret and passphrase
 */
function coinbase_query(params, api_url, requestPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let { api_key, secret_key, passphrase } = params;
        let timestamp = (Date.now() / 1000);
        let sig_data = timestamp + "GET" + requestPath;
        let sig = (0, cryptography_1.hmac)({ algorithm: 'sha256', secret: Buffer.from(secret_key, 'base64'), data: sig_data, digest: 'base64' });
        let headers = { "Accept": "application/json",
            "CB-ACCESS-KEY": api_key,
            "CB-ACCESS-SIGN": sig,
            "CB-ACCESS-PASSPHRASE": passphrase,
            "CB-ACCESS-TIMESTAMP": timestamp };
        return yield node.http.get_json_with_headers(api_url, headers);
    });
}
exports.coinbase_query = coinbase_query;
/**
 * Returns user accounts on pro.coinbase.com
 * @param params Dictionary containing the api key and api secret and passphrase
 */
function get_coinbase_pro_user_accounts(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let api_url = `https://api.exchange.coinbase.com/accounts`;
        let requestPath = "/accounts";
        return yield coinbase_query(params, api_url, requestPath);
    });
}
exports.get_coinbase_pro_user_accounts = get_coinbase_pro_user_accounts;
/**
 * Returns user balances on pro.coinbase.com
 * @param params Dictionary containing the api key and api secret and passphrase
 */
function get_coinbase_pro_user_balances(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let non_zero = ((x) => Number(x.balance) > 0);
        let parser = R.pipe(R.filter(non_zero), R.map((x) => ({ symbol: x.currency,
            amount: (Number(x.hold) + Number(x.available)) })), R.sortBy((x) => -x.amount));
        let accounts = yield get_coinbase_pro_user_accounts(params);
        return parser(accounts);
    });
}
exports.get_coinbase_pro_user_balances = get_coinbase_pro_user_balances;
/**
 * Returns user accounts on coinbase.com
 * @param params Dictionary containing the api key and api secret and passphrase
 */
function get_coinbase_user_accounts(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let api_url = `https://api.exchange.coinbase.com/coinbase-accounts`;
        let requestPath = "/coinbase-accounts";
        return yield coinbase_query(params, api_url, requestPath);
    });
}
exports.get_coinbase_user_accounts = get_coinbase_user_accounts;
/**
 * Returns user balances on coinbase.com
 * @param params Dictionary containing the api key and api secret and passphrase
 */
function get_coinbase_balances(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let accounts = yield get_coinbase_user_accounts(params);
        let non_zero = ((x) => Number(x.balance) > 0);
        let parser = R.pipe(R.filter(non_zero), R.map((x) => ({ symbol: x.currency,
            amount: (Number(x.hold_balance) + Number(x.balance)) })), R.sortBy((x) => -x.amount));
        return parser(accounts);
    });
}
exports.get_coinbase_balances = get_coinbase_balances;
/**
 * Returns all user balances on both coinbase.com and pro.coinbase.com
 * @param params Dictionary containing the api key and api secret and passphrase
 */
function get_user_balances(params) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            coinbase: yield get_coinbase_balances(params),
            coinbase_pro: yield get_coinbase_pro_user_balances(params)
        };
    });
}
exports.get_user_balances = get_user_balances;
/**
 * Generates the account_id to currency mapping, which allows looking up the currency
 * which correpsonds to a given account id
 * @param params Dictionary containing the api key and api secret and passphrase
 */
function get_account_id_mapping(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let accounts = yield get_coinbase_pro_user_accounts(params);
        let dic = {};
        accounts.map((acc) => dic[acc.id] = acc.currency);
        return dic;
    });
}
exports.get_account_id_mapping = get_account_id_mapping;
/**
 * Returns all user transfers on pro.coinbase.com
 * For now this is limited to 300 transfers.
 * @param params Dictionary containing the api key and api secret and passphrase
 */
function get_user_transfers(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let { api_key, secret_key, passphrase } = params;
        let api_url = `https://api.exchange.coinbase.com/transfers?limit=300`;
        let requestPath = "/transfers?limit=300";
        let transfers = yield coinbase_query(params, api_url, requestPath);
        return transfers;
    });
}
exports.get_user_transfers = get_user_transfers;
/**
 * Returns all user transfers (with the currencies resolved) on pro.coinbase.com
 * For now this is limited to 300 transfers.
 * @param params Dictionary containing the api key and api secret and passphrase
 */
function get_resolved_user_transfers(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let transfers = yield get_user_transfers(params);
        let account_mapping = yield get_account_id_mapping(params);
        transfers.map((t) => t.resolved_currency = account_mapping[t.account_id]);
        return transfers;
    });
}
exports.get_resolved_user_transfers = get_resolved_user_transfers;
