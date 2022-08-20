"use strict";
/*
   Utils for parsing csvs
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_row = exports.read_csv_file = void 0;
const index_1 = require("../index");
/**
 * Reads csv files
 *
 */
function read_csv_file(has_header, cols, parser, fname) {
    let raw_string = index_1.node.io.read_file(fname).trim();
    let rows = raw_string.split("\n").map(function (r) {
        return r.split(",").map((t) => t.trim());
    });
    if (has_header) {
        //get cols from the first
        cols = rows[0];
        rows = rows.splice(1);
    }
    return rows.map((r) => parse_row(r, cols, parser));
}
exports.read_csv_file = read_csv_file;
function parse_row(row, cols, parser) {
    var data = {};
    for (var i = 0; i < cols.length; i++) {
        data[cols[i]] = parser[cols[i]](row[i]);
    }
    return data;
}
exports.parse_row = parse_row;
