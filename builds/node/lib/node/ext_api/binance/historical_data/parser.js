"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.read_kline_csv = exports.parse_kline_csv_files = exports.get_csvs = void 0;
const index_1 = require("../../../../index");
//get array of fullpaths to sorted csv files in directory dir 
function get_csvs(dir) {
    let csvs = index_1.node.io.read_dir(dir).filter((x) => x.match(".csv")).sort().map((x) => index_1.node.io.path.join(dir, x));
    return csvs;
}
exports.get_csvs = get_csvs;
/**
 * Given a directory 'dir' that containes kline csv files,
 * this function sorts and parses those csv files and returns
 * a concatenated array of all the data, in the form of dictionary
 * objects (k,v pairs). The data can then ben analyzed or parsed.
 */
function parse_kline_csv_files(dir) {
    let csvs = get_csvs(dir);
    return csvs.map(read_kline_csv).flat();
}
exports.parse_kline_csv_files = parse_kline_csv_files;
const kline_columns = [
    //see https://github.com/binance/binance-public-data
    "open_time",
    "open",
    "high",
    "low",
    "close",
    "volume",
    "close_time",
    "quote_asset_volume",
    "number_of_trades",
    "taker_buy_base_asset_volume",
    "taker_buy_quote_asset_volume",
    "ignore"
];
function read_kline_csv(fp) {
    //read single csv file
    let raw_string = index_1.node.io.read_file(fp).trim();
    let parsed = raw_string.split("\n").map((t) => {
        let tokens = t.split(",").map(Number);
        let kv_pairs = index_1.common.fp.concat_accross_index([kline_columns, tokens]);
        return Object.fromEntries(kv_pairs);
    });
    return parsed;
}
exports.read_kline_csv = read_kline_csv;
