/// <reference types="node" />
/// <reference types="node" />
import fs from 'fs';
import path from 'path';
/**
 * Write string or buffer to disk
 *
 */
export declare function write_file(fname: string, s: (string | Buffer)): void;
/**
 * Read a text file from disk
 *
 */
export declare function read_file(fname: string): string;
/**
 * Read a file from disk and returns a buffer
 *
 */
export declare function read_buffer_from_file(fname: string): Buffer;
/**
 * Blocks the runtime until N bytes are read from a readable stream
 *
 * @param readable - Readable stream to read from
 * @param n - Number of bytes to read
 */
export declare function read_n_bytes_from_stream(readable: any, n: number): any;
/**
 * Read a file from disk and returns a readable stream
 *
 */
export declare function readable_stream_from_file(fname: string): fs.ReadStream;
/**
 * Read a text file from disk (same as read_file)
 *
 */
export declare function read_text(fname: string): string;
/**
 * Read a json file from disk and return the json object
 *
 */
export declare function read_json(fname: string): any;
/**
 * Reads a directory and returns file names
 *
 */
export declare function read_dir(fname: string): string[];
/**
 * Appends file extension to fname if not already there.
 *
 */
export declare function ensure_extension(fname: string, ext: string): string;
/**
 * Makes sure a directory exists and if not creates it.
 */
export declare function ensure_dir(dir: string): void;
/**
 * Ensures parent directories exist
 */
export declare function ensure_parents(fname: string): void;
/**
 * Write a json file to disk
 *
 */
export declare function write_json(fname: string, o: any): void;
export declare type WriteFileOps = {
    path: string;
    data: string;
    append: boolean;
};
/**
 * Write a text file to disk
 */
export declare function write_text(ops: WriteFileOps): void;
/**
 * Remove file from filesystem
 * @param fname - file to remove
 */
export declare function rm(fname: string): void;
/**
 * Check if a file exists
 *
 */
export declare function exists(fname: string): boolean;
/**
 * Get all (non-hidden) files in the directory as full subpaths
 *
 */
export declare function read_nonhidden_subfiles(dname: string): string[];
/**
 * Extracts a zip file to a directory
 * @param fname - The local filename
 * @param target - Target directory
 */
export declare function unzip_to_directory(fname: string, target: string): Promise<void>;
export { fs, path };
