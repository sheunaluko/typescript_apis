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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.path = exports.fs = exports.unzip_to_directory = exports.read_nonhidden_subfiles = exports.exists = exports.rm = exports.write_text = exports.write_json = exports.ensure_parents = exports.ensure_dir = exports.ensure_extension = exports.read_dir = exports.read_json = exports.read_text = exports.readable_stream_from_file = exports.read_n_bytes_from_stream = exports.read_buffer_from_file = exports.read_file = exports.write_file = void 0;
const fs_1 = __importDefault(require("fs"));
exports.fs = fs_1.default;
const path_1 = __importDefault(require("path"));
exports.path = path_1.default;
const extract_zip_1 = __importDefault(require("extract-zip"));
const common = __importStar(require("../common/index"));
const log = common.logger.get_logger({ id: "io" });
/**
 * Write string or buffer to disk
 *
 */
function write_file(fname, s) { fs_1.default.writeFileSync(fname, s); }
exports.write_file = write_file;
/**
 * Read a text file from disk
 *
 */
function read_file(fname) { return fs_1.default.readFileSync(fname, 'utf8'); }
exports.read_file = read_file;
/**
 * Read a file from disk and returns a buffer
 *
 */
function read_buffer_from_file(fname) { return fs_1.default.readFileSync(fname); }
exports.read_buffer_from_file = read_buffer_from_file;
/**
 * Blocks the runtime until N bytes are read from a readable stream
 *
 * @param readable - Readable stream to read from
 * @param n - Number of bytes to read
 */
function read_n_bytes_from_stream(readable, n) {
    var chunk;
    while (null !== (chunk = readable.read(n))) {
        return chunk;
    }
}
exports.read_n_bytes_from_stream = read_n_bytes_from_stream;
/**
 * Read a file from disk and returns a readable stream
 *
 */
function readable_stream_from_file(fname) { return fs_1.default.createReadStream(fname); }
exports.readable_stream_from_file = readable_stream_from_file;
/**
 * Read a text file from disk (same as read_file)
 *
 */
function read_text(fname) { return fs_1.default.readFileSync(fname, 'utf8'); }
exports.read_text = read_text;
/**
 * Read a json file from disk and return the json object
 *
 */
function read_json(fname) { return JSON.parse(read_file(fname)); }
exports.read_json = read_json;
/**
 * Reads a directory and returns file names
 *
 */
function read_dir(fname) { return fs_1.default.readdirSync(fname); }
exports.read_dir = read_dir;
/**
 * Appends file extension to fname if not already there.
 *
 */
function ensure_extension(fname, ext) {
    if (fname.match(new RegExp(`.{ext}$`))) {
        return fname;
    }
    else {
        return `${fname}.${ext}`;
    }
}
exports.ensure_extension = ensure_extension;
/**
 * Makes sure a directory exists and if not creates it.
 */
function ensure_dir(dir) { if (!fs_1.default.existsSync(dir)) {
    fs_1.default.mkdirSync(dir, { recursive: true });
} }
exports.ensure_dir = ensure_dir;
/**
 * Ensures parent directories exist
 */
function ensure_parents(fname) {
    let p = path_1.default.dirname(fname);
    ensure_dir(p);
}
exports.ensure_parents = ensure_parents;
/**
 * Write a json file to disk
 *
 */
function write_json(fname, o) {
    return write_file(ensure_extension(fname, "json"), JSON.stringify(o));
}
exports.write_json = write_json;
/**
 * Write a text file to disk
 */
function write_text(ops) {
    let { path: fpath, data, append } = ops;
    ensure_dir(path_1.default.dirname(fpath));
    return (append ? fs_1.default.appendFileSync(fpath, data) : write_file(fpath, data));
}
exports.write_text = write_text;
/**
 * Remove file from filesystem
 * @param fname - file to remove
 */
function rm(fname) {
    fs_1.default.unlinkSync(fname);
}
exports.rm = rm;
/**
 * Check if a file exists
 *
 */
function exists(fname) { return fs_1.default.existsSync(fname); }
exports.exists = exists;
/**
 * Get all (non-hidden) files in the directory as full subpaths
 *
 */
function read_nonhidden_subfiles(dname) {
    return fs_1.default.readdirSync(dname).filter((y) => (y[0] != ".")).map((y) => path_1.default.join(dname, y));
}
exports.read_nonhidden_subfiles = read_nonhidden_subfiles;
/**
 * Extracts a zip file to a directory
 * @param fname - The local filename
 * @param target - Target directory
 */
function unzip_to_directory(fname, target) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, extract_zip_1.default)(fname, { dir: target });
            log(`unzip complete | ${fname}`);
        }
        catch (err) {
            // handle any errors
            log(`unzip error | ${fname}`);
            log(err);
        }
    });
}
exports.unzip_to_directory = unzip_to_directory;
