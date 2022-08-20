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
Object.defineProperty(exports, "__esModule", { value: true });
exports.concat_accross_index = exports.map_prop_reduce = exports.map_prop = exports.first = exports.last = exports.enumerate = exports.map_indexed = void 0;
const R = __importStar(require("ramda"));
const mapIndexed_ = R.addIndex(R.map);
/**
 * Maps a function across a list, where the function receives both index and value as arguments (i,v)
 *
 */
function map_indexed(f, x) {
    return mapIndexed_((value, i) => f(i, value), x);
}
exports.map_indexed = map_indexed;
/**
 * Creates new list by adding indexes to the input list.
 * Specifically, takes a list of items L and returns same length list Y where Y[index] = [ index , L[index] ]
 *
 */
function enumerate(x) {
    return map_indexed((idx, val) => [idx, val], x);
}
exports.enumerate = enumerate;
/**
 * Return the last element of a list
 *
 */
function last(x) { return x.slice(-1)[0]; }
exports.last = last;
/**
 * Return the first element of a list
 *
 */
function first(x) { return x[0]; }
exports.first = first;
/**
 * Given a list of objects, extract property 'prop' from each object
 * to create a new list
 * @param prop The property to extract
 * @param list The list to act upon
 */
function map_prop(prop, list) { return R.map(R.prop(prop))(list); }
exports.map_prop = map_prop;
/**
 * Given a list of objects, extract property 'prop' from each object
 * to create a new list, and then reduce this list with the given
 * reducer and initial accumulator
 * @param prop The property to extract
 * @param reducer The reducer to use
 * @param acc The initiall acc value
 * @param list The list to act upon
 */
function map_prop_reduce(prop, reducer, acc, list) {
    return R.reduce(reducer, acc, map_prop(prop, list));
}
exports.map_prop_reduce = map_prop_reduce;
/**
 *  Takes an array of X arrays with Y values each, and produces an array of Y arrays with
 *  X values each. The first array is the concatenation of the first elemenent of each subarray.
 * The second returned array is the concatenation of the second element of each subarray.
 * And so forth.
 *
 * ```
 * //create a dictionary from separate key/value arrays
 * let keys = ['a', 'b', 'c'] ; let values = ['v1', 'v2' ,'v3]
 * let pairs = concat_accross_index( [keys,values]  )
 * //  > [ ['a', 'v1'] , ['b', 'v2'] ... ]
 * let dic  = Object.fromEntries( ) )
 * ```
 */
function concat_accross_index(arrs) {
    let result = [];
    let res_len = arrs[0].length;
    let arr_len = arrs.length;
    for (var i = 0; i < res_len; i++) {
        var tmp = new Array();
        for (var x = 0; x < arr_len; x++) {
            tmp.push(arrs[x][i]);
        }
        result.push(tmp);
    }
    return result;
}
exports.concat_accross_index = concat_accross_index;
