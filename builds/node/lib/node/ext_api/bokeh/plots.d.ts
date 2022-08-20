/**
 * Creates a time series plot given x values and y values
 *
 */
export declare function time_series(x: any, y: any): void;
/**
 * Creates a bar chart from specified data.
 * Data is an array of arrays, of the format shown below:
 * ```
 * var test_bar_data = [
 *   ["Fruit" , "Value" ] ,
 *   ["Apple" , 1 ] ,
 *   ["Banana" , 2] ,
 *   ["Pear" , 1 ] ,
 * ]
 * ```
 */
export declare function bar_chart(data: any): void;
export declare var test_bar_data: (string | number)[][];
