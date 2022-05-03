
import * as R from 'ramda' ; 

const mapIndexed_ = R.addIndex(R.map);

/**
 * Maps a function across a list, where the function receives both index and value as arguments (i,v) 
 * 
 */
export function map_indexed(f : (idx: number, val : any) => any , x : any[]) {
    return mapIndexed_( (value:any,i:number)=> f(i,value)  as any, x as any) 
} 


/**
 * Creates new list by adding indexes to the input list. 
 * Specifically, takes a list of items L and returns same length list Y where Y[index] = [ index , L[index] ] 
 * 
 */
export function enumerate(x : any[]) {
    return map_indexed( (idx : number, val :any) => [idx, val] , x) 
} 

/**
 * Return the last element of a list 
 * 
 */
export function last(x : any[]) { return x.slice(-1)[0] }

/**
 * Return the first element of a list 
 * 
 */
export function first(x : any[]) { return x[0] } 


/**
 * Given a list of objects, extract property 'prop' from each object 
 * to create a new list
 * @param prop The property to extract
 * @param list The list to act upon 
 */
export function map_prop(prop : string, list : any[]) { return R.map(R.prop(prop))(list) }

/**
 * Given a list of objects, extract property 'prop' from each object 
 * to create a new list, and then reduce this list with the given 
 * reducer and initial accumulator 
 * @param prop The property to extract
 * @param reducer The reducer to use 
 * @param acc The initiall acc value 
 * @param list The list to act upon 
 */
export function map_prop_reduce(prop : string, reducer : any, acc : any, list : any[]) {
    return R.reduce( reducer , acc , map_prop(prop, list) ) 
} 
