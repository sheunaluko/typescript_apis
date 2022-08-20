export declare function get_csvs(dir: string): string[];
/**
 * Given a directory 'dir' that containes kline csv files,
 * this function sorts and parses those csv files and returns
 * a concatenated array of all the data, in the form of dictionary
 * objects (k,v pairs). The data can then ben analyzed or parsed.
 */
export declare function parse_kline_csv_files(dir: string): {
    [k: string]: any;
}[];
export declare function read_kline_csv(fp: string): {
    [k: string]: any;
}[];
