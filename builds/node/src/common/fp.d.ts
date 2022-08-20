/**
 * Maps a function across a list, where the function receives both index and value as arguments (i,v)
 *
 */
export declare function map_indexed(f: (idx: number, val: any) => any, x: any[]): unknown[];
/**
 * Creates new list by adding indexes to the input list.
 * Specifically, takes a list of items L and returns same length list Y where Y[index] = [ index , L[index] ]
 *
 */
export declare function enumerate(x: any[]): unknown[];
/**
 * Return the last element of a list
 *
 */
export declare function last(x: any[]): any;
/**
 * Return the first element of a list
 *
 */
export declare function first(x: any[]): any;
/**
 * Given a list of objects, extract property 'prop' from each object
 * to create a new list
 * @param prop The property to extract
 * @param list The list to act upon
 */
export declare function map_prop(prop: string, list: any[]): unknown[];
/**
 * Given a list of objects, extract property 'prop' from each object
 * to create a new list, and then reduce this list with the given
 * reducer and initial accumulator
 * @param prop The property to extract
 * @param reducer The reducer to use
 * @param acc The initiall acc value
 * @param list The list to act upon
 */
export declare function map_prop_reduce(prop: string, reducer: any, acc: any, list: any[]): any;
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
export declare function concat_accross_index(arrs: any[]): any[];
