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
exports.file_checksum = exports.aes_192_decrypt_file = exports.aes_192_encrypt_file = exports.aes_192_decrypt_buffer = exports.aes_192_encrypt_message = exports.async_scrypt = exports.hmac = void 0;
const crypto_1 = require("crypto");
const util_1 = __importDefault(require("util"));
const io = __importStar(require("./io"));
const fs_1 = __importDefault(require("fs"));
/**
 * Computes hmac
 * ```typescript
 * let hex = hmac({algorithm: "sha256", secret : 'my secret', data : 'my data', digest : 'hex'})
 * ```
 */
function hmac(params) {
    let { algorithm, secret, data, digest } = params;
    const hmac = (0, crypto_1.createHmac)(algorithm, secret);
    hmac.update(data);
    return hmac.digest(digest);
}
exports.hmac = hmac;
/**
 * Async scrypt function for computing encryption key.
 * This is a wrapper around the builtin scrypt function using util.promisify
 * @param password - the password
 * @param salt  - the salt
 * @param legnth - the lenght of the encryption key
 */
function async_scrypt(password, salt, length) {
    return __awaiter(this, void 0, void 0, function* () {
        let f = util_1.default.promisify(crypto_1.scrypt);
        return yield f(password, salt, length);
    });
}
exports.async_scrypt = async_scrypt;
/**
 * Performs in memory AES-192 encryption on a message given the supplied password.
 * Generates a random initialization vector (iv) for the encryption, and returns
 * both the cipher text and the iv.
 * @param password - encryption password
 * @param message - Message to encrypt, which is usually a String or a Buffer
 */
function aes_192_encrypt_message(password, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const algorithm = 'aes-192-cbc';
        //Generate key. For aes192 use 24 byte key (192 bits) - see (https://nodejs.org/api/crypto.html#class-cipher) 
        let key = yield async_scrypt(password, "salt", 24);
        //Generate initialization vector
        let iv = yield (0, crypto_1.randomBytes)(16);
        //Create the cipher 
        const cipher = (0, crypto_1.createCipheriv)(algorithm, key, iv);
        //By default, chunks will appear as buffers, which are decoded from the input which is assumed to be utf8 string 
        let chunks = [];
        cipher.on('data', function (chunk) {
            chunks.push(chunk);
        });
        cipher.on('end', () => null);
        cipher.write(message); //because message is a string - it is transformed to Buffer assuming utf8  
        cipher.end();
        //Collect the chunks into a buffer and return everything 
        return {
            iv,
            cipher: Buffer.concat(chunks),
        };
    });
}
exports.aes_192_encrypt_message = aes_192_encrypt_message;
/**
 * Performs in memory AES-192 decryption on a buffer given the supplied password and initialization vector
 * Returns the decrypted buffer.
 */
function aes_192_decrypt_buffer(password, cipher, iv) {
    return __awaiter(this, void 0, void 0, function* () {
        const algorithm = 'aes-192-cbc';
        //Generate key. For aes192 use 24 byte key (192 bits) - see (https://nodejs.org/api/crypto.html#class-cipher) 
        let key = yield async_scrypt(password, "salt", 24);
        //Prep the decipher object 
        const decipher = (0, crypto_1.createDecipheriv)(algorithm, key, iv);
        let decrypted_chunks = [];
        decipher.on('readable', () => {
            var chunk;
            while (null !== (chunk = decipher.read())) {
                decrypted_chunks.push(chunk);
            }
        });
        decipher.on('end', () => null);
        //Write the cipher and trigger the end  
        decipher.write(cipher);
        decipher.end();
        //Return concatted decrypted chunks 
        return Buffer.concat(decrypted_chunks);
    });
}
exports.aes_192_decrypt_buffer = aes_192_decrypt_buffer;
/**
 * Performs in memory AES-192 encryption of a file given the supplied password.
 * The encrypted output cipher is prepended with the randomly generated 16 byte initialization vector (iv) prior to writing to disk.
 * See aes_192_decrypt_file for more information on decryption.
 * @param password - Password to use for encryption
 * @param input_file - File to encrypt
 * @param output_file  - Path (including extension) to write the encrypted file to
 */
function aes_192_encrypt_file(password, input_file, output_file) {
    return __awaiter(this, void 0, void 0, function* () {
        //first read the input file into memory 
        let input_buffer = io.read_buffer_from_file(input_file);
        //next we encrypt the buffer using the password 
        let { iv, cipher } = yield aes_192_encrypt_message(password, input_buffer);
        //then we concat the iv and the cipher and write them to the output_file
        io.write_file(output_file, Buffer.concat([iv, cipher]));
    });
}
exports.aes_192_encrypt_file = aes_192_encrypt_file;
/**
 * Performs in memory AES-192 decryption of a file given the supplied password.
 * Assumes that the first 16 bytes of the file are the plaintext initial vector (see aes_192_encrypt_file).
 * Returns a decrypted buffer (which can then be converted to a string for text files)
 * @param password - Password to use for decryption
 * @param filename - File to decrypt
 */
function aes_192_decrypt_file(password, filename) {
    return __awaiter(this, void 0, void 0, function* () {
        //get fd 
        let fd = yield fs_1.default.promises.open(filename, 'r');
        //allocate 16 bytes for the iv 
        let iv = Buffer.alloc(16);
        // see https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_filehandle_readfile_options
        // to understand the below ops
        // Note that the last option specifies the position in the file to START reading from
        // -- interestingly, if it is an integer (0) then the internal file position is NOT updated
        // -- if it is null then the file position IS updated after the read
        // -- this is important because the later readFile call STARTS at the last file position 
        yield fd.read(iv, 0, 16, null);
        //read the rest of the file
        //https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_filehandle_readfile_options
        let cipher = yield fd.readFile();
        fd.close();
        //decrypt the file
        let decrypted_buffer = yield aes_192_decrypt_buffer(password, cipher, iv);
        return decrypted_buffer;
    });
}
exports.aes_192_decrypt_file = aes_192_decrypt_file;
/**
 * Computes the hash (checksum) of a file
 * @param fname - Name of the file
 * @param hash_type  - Type of hash to compute
 */
function file_checksum(fname, hash_type) {
    let hash = (0, crypto_1.createHash)(hash_type);
    const input = fs_1.default.readFileSync(fname);
    hash.update(input);
    let result = hash.digest("hex");
    return result;
}
exports.file_checksum = file_checksum;
