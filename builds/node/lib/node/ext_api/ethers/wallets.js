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
exports.LOADED_WALLETS = exports.wallet_subdirectories = exports.parse_wallet = exports.get_loaded_wallets = exports.load_wallets = exports.generate_numbered_wallets = exports.generate_random_json_wallet = exports.ethers = exports.get_smart_wallet_by_address = exports.get_wallet_by_address = void 0;
const ethers_1 = require("ethers"); // https://docs.ethers.io/v4/getting-started.html
Object.defineProperty(exports, "ethers", { enumerable: true, get: function () { return ethers_1.ethers; } });
const io = __importStar(require("../../io"));
const logger_1 = require("../../../common/logger");
const smart_wallet_1 = require("../../../common/web3/smart_wallet");
let dpw = process.env["EVM_WALLETS_PASSW"];
let wloc = process.env["EVM_WALLETS_LOC"];
let log = (0, logger_1.get_logger)({ id: 'evmw' });
function check_reqs() {
    if (!(dpw && wloc)) {
        log("ENV vars EVM_WALLETS_(PASSW/LOC) are required to proceed. Please set these and run the process again.");
        process.exit(1);
    }
    log("ENV vars EVM_WALLETS_(PASSW/LOC) are set; proceeding.");
}
/**
 * Generate random wallet. Uses the 'EVM_WALLETS_PASSW' env var to encrypt and stores the
 * Wallet structure into a subdirectory of 'EVM_WALLETS_LOC'. These must be set.
 * The latter is created if it does not exist.
 * @param {object} metadata - Optional metadata (name, num)
 */
function generate_random_json_wallet(metadata) {
    return __awaiter(this, void 0, void 0, function* () {
        check_reqs();
        let { num } = metadata;
        let wallet = ethers_1.ethers.Wallet.createRandom();
        let wid = wallet.address;
        log(`Generating wallet...${wid}`);
        log(`[${wid}] Encrypting wallet...`);
        let options = {
            scrypt: {
                N: (1 << 16)
            }
        };
        //https://github.com/ethers-io/ethers.js/issues/390
        let json = yield wallet.encrypt(dpw, options);
        let wallet_base = io.path.join(wloc, wid);
        //write the json file 
        let json_fname = io.path.join(wallet_base, "wallet.json");
        log(`[${wid}] Writing wallet json`);
        yield io.write_text({ path: json_fname, data: json, append: false });
        //write a metadata file
        if (num == undefined) {
            num = -1;
        }
        let _metadata = { address: wid, number: num };
        let meta_fname = io.path.join(wallet_base, "metadata.json");
        log(`[${wid}] Writing wallet metadata`);
        yield io.write_text({ path: meta_fname, data: JSON.stringify(_metadata), append: false });
        log(`[${wid}] Done`);
        return wallet;
    });
}
exports.generate_random_json_wallet = generate_random_json_wallet;
function wallet_subdirectories() {
    check_reqs();
    return Array.from(io.read_dir(wloc)).map((x) => io.path.join(wloc, x));
}
exports.wallet_subdirectories = wallet_subdirectories;
function parse_wallet(dloc) {
    return __awaiter(this, void 0, void 0, function* () {
        let jsonf = io.path.join(dloc, "wallet.json");
        let metadata = JSON.parse(io.read_text(io.path.join(dloc, "metadata.json")));
        log(`Decrypting wallet ${dloc}`);
        /*
           create the wallet
         */
        let wallet = yield ethers_1.ethers.Wallet.fromEncryptedJson(io.read_text(jsonf), dpw);
        log(`Done Decrypting wallet ${dloc}`);
        return { wallet, metadata };
    });
}
exports.parse_wallet = parse_wallet;
function load_wallets() {
    return __awaiter(this, void 0, void 0, function* () {
        check_reqs();
        let subds = wallet_subdirectories();
        let wallets = [];
        for (var s of subds) {
            wallets.push(parse_wallet(s));
        }
        exports.LOADED_WALLETS = LOADED_WALLETS = yield Promise.all(wallets);
        return LOADED_WALLETS;
    });
}
exports.load_wallets = load_wallets;
var LOADED_WALLETS = [];
exports.LOADED_WALLETS = LOADED_WALLETS;
/**
 * Returns an array of all the loaded wallets
 */
function get_loaded_wallets() {
    return __awaiter(this, void 0, void 0, function* () {
        check_reqs();
        if (LOADED_WALLETS.length > 0) {
            return LOADED_WALLETS;
        }
        else {
            exports.LOADED_WALLETS = LOADED_WALLETS = yield load_wallets();
            return LOADED_WALLETS;
        }
    });
}
exports.get_loaded_wallets = get_loaded_wallets;
/**
 * Generates up to N random wallets on local device and stores n as 'num' in their metadata
 * Skips ones that have already been generated
 * Requires that the env vars EVM_WALLETS_PASSW and EVM_WALLETS_LOC are set.
 * @param {number} n - The number of wallets
 */
function generate_numbered_wallets(n) {
    return __awaiter(this, void 0, void 0, function* () {
        check_reqs();
        let wallets = yield get_loaded_wallets();
        let used_numbers = wallets.map((w) => w.metadata.number);
        let new_wallets = [];
        for (var i = 0; i < n; i++) {
            if (used_numbers.indexOf(i) > -1) {
                log(`Skipping number: ${i}`);
            }
            else {
                let metadata = { num: i };
                let wallet = yield generate_random_json_wallet(metadata);
                new_wallets.push(wallet);
            }
        }
        let resolved_new_wallets = yield Promise.all(new_wallets);
        log("Finished generating new wallets.. adding to loaded.");
        resolved_new_wallets.map((w) => LOADED_WALLETS.push(w));
        log("Done");
    });
}
exports.generate_numbered_wallets = generate_numbered_wallets;
/**
 * Searches for and parses a local wallet by its public evm address
 * @param {string} s - The address
 */
function get_wallet_by_address(a) {
    return __awaiter(this, void 0, void 0, function* () {
        check_reqs();
        let w_dir = io.path.join(wloc, a);
        return (yield parse_wallet(w_dir)).wallet;
    });
}
exports.get_wallet_by_address = get_wallet_by_address;
var wallet_cache = {};
/**
 * Searches for and parses a local wallet by its public evm address
 * and then creates a SmartWallet instance connected to the specified
 * Provider
 * @param {string} addr - The address
 * @param {ethers.providers.JsonRpcProvider} p - Provider
 */
function get_smart_wallet_by_address(addr, p, tx_type) {
    return __awaiter(this, void 0, void 0, function* () {
        check_reqs();
        let w = (wallet_cache[addr] || (yield get_wallet_by_address(addr)));
        wallet_cache[addr] = w;
        let ops = { privateKey: w.privateKey, provider: p, tx_type };
        let sw = new smart_wallet_1.SmartWallet(ops);
        yield sw.init();
        return sw;
    });
}
exports.get_smart_wallet_by_address = get_smart_wallet_by_address;
