export declare function extract_binance_market_data_links(page: any): Promise<{
    checksum_link: unknown;
    zip_link: unknown;
}[]>;
export declare function link_to_fpath(link: string): string;
/**
 * Main function for downloading a link object.
 * Link object consists of {checksum_link, zip_link}
 * It will download the data to subdirectory of 'dir'
 */
export declare function handle_link_object(dir: string, lo: any): Promise<void>;
export declare var test_page: string;
export declare function get_links_for_page(p: string): Promise<{
    checksum_link: unknown;
    zip_link: unknown;
}[]>;
export declare function download_data_for_page(dir: string, p: string): Promise<void>;
/**
 * Main entry point for downloading historical data.
 * Just enter the top level directory to download data to and the symbol you want to download
 * and this will download the hourly kline data for that symbol.
 * This includes downloading zip files, checking the checksums, and extracting the csvs.
 * The data will be in a nested location within the suppplied top level directory.
 */
export declare function download_hourly_kline_data_for_symbol(dir: string, symbol: string): Promise<void>;
