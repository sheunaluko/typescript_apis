interface Csv_parser {
    [k: string]: (x: any) => any;
}
/**
 * Reads csv files
 *
 */
export declare function read_csv_file(has_header: boolean, cols: string[], parser: Csv_parser, fname: string): any[];
export declare function parse_row(row: string[], cols: string[], parser: Csv_parser): any;
export {};
