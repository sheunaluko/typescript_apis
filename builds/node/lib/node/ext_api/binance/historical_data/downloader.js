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
exports.download_hourly_kline_data_for_symbol = exports.download_data_for_page = exports.get_links_for_page = exports.test_page = exports.handle_link_object = exports.link_to_fpath = exports.extract_binance_market_data_links = void 0;
const node = __importStar(require("../../../../node/index"));
const common = __importStar(require("../../../../common/index"));
var { io, puppeteer, cryptography, http } = node;
var { R } = common;
;
const log = common.logger.get_logger({ id: "binancedld" });
const dl_selector = "tr:not(:first-child) td:first-child a";
function extract_binance_market_data_links(page) {
    return __awaiter(this, void 0, void 0, function* () {
        let tmp = yield page.evaluate((dl_selector) => { return Array.from(document.querySelectorAll(dl_selector)).map((x) => x.href); }, dl_selector);
        let tmp2 = R.splitEvery(2, tmp);
        let result = tmp2.map(y => ({ checksum_link: y[0], zip_link: y[1] }));
        return result;
    });
}
exports.extract_binance_market_data_links = extract_binance_market_data_links;
function link_to_fpath(link) {
    return link.split("vision/data/")[1];
}
exports.link_to_fpath = link_to_fpath;
/**
 * Main function for downloading a link object.
 * Link object consists of {checksum_link, zip_link}
 * It will download the data to subdirectory of 'dir'
 */
function handle_link_object(dir, lo) {
    return __awaiter(this, void 0, void 0, function* () {
        let { checksum_link, zip_link } = lo;
        let cpath = node.io.path.join(dir, link_to_fpath(checksum_link));
        let zpath = node.io.path.join(dir, link_to_fpath(zip_link));
        //download both links
        if (node.io.exists(cpath) && node.io.exists(zpath)) {
            log(`ALREADY EXISTS: ${cpath}`);
            log(`ALREADY EXISTS: ${zpath}`);
        }
        else {
            let result = yield Promise.all([
                http.download_url_to_file(checksum_link, cpath),
                http.download_url_to_file(zip_link, zpath)
            ]);
            log(`Downloaded ${cpath}`);
            log(`Downloaded ${zpath}`);
        }
        log("Validating checksum...");
        let ccs = cryptography.file_checksum(zpath, 'sha256').trim();
        let rcs = node.io.read_text(cpath).split(/\s/)[0].trim();
        if (ccs == rcs) {
            log("Checksums match!");
        }
        else {
            log("ERROR: checksums do not match!");
            log(`computed=${ccs}`);
            log(`realchec=${rcs}`);
            log("Deleting files...");
            node.io.rm(cpath);
            node.io.rm(zpath);
            log("Trying again...");
            yield handle_link_object(dir, lo);
        }
        //now that checksums match we can unzip the files
        log(`Unzipping ${zpath}`);
        yield node.io.unzip_to_directory(zpath, node.io.path.dirname(zpath));
        log(`Done`);
    });
}
exports.handle_link_object = handle_link_object;
exports.test_page = "https://data.binance.vision/?prefix=data/spot/monthly/klines/ETHUSDT/1h/";
function get_links_for_page(p) {
    return __awaiter(this, void 0, void 0, function* () {
        let page = yield puppeteer.new_page({});
        log("created new new page");
        yield Promise.all([
            page.goto(p),
            page.waitForSelector(dl_selector)
        ]);
        log("data available");
        // -- 
        let data = yield extract_binance_market_data_links(page);
        log("data retrieved");
        return data;
    });
}
exports.get_links_for_page = get_links_for_page;
function download_data_for_page(dir, p) {
    return __awaiter(this, void 0, void 0, function* () {
        log(`I N I T - ${p}`);
        let d = yield get_links_for_page(p);
        for (var lo of d) {
            yield handle_link_object(dir, lo);
        }
        log(`D O N E - ${p}`);
    });
}
exports.download_data_for_page = download_data_for_page;
/**
 * Main entry point for downloading historical data.
 * Just enter the top level directory to download data to and the symbol you want to download
 * and this will download the hourly kline data for that symbol.
 * This includes downloading zip files, checking the checksums, and extracting the csvs.
 * The data will be in a nested location within the suppplied top level directory.
 */
function download_hourly_kline_data_for_symbol(dir, symbol) {
    return __awaiter(this, void 0, void 0, function* () {
        let page = `https://data.binance.vision/?prefix=data/spot/monthly/klines/${symbol}/1h/`;
        yield download_data_for_page(dir, page);
    });
}
exports.download_hourly_kline_data_for_symbol = download_hourly_kline_data_for_symbol;
