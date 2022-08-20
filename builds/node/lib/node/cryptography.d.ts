/// <reference types="node" />
export declare type HmacParams = {
    'algorithm': string;
    'secret': any;
    'data': string;
    'digest': string;
};
/**
 * Computes hmac
 * ```typescript
 * let hex = hmac({algorithm: "sha256", secret : 'my secret', data : 'my data', digest : 'hex'})
 * ```
 */
export declare function hmac(params: HmacParams): string;
/**
 * Async scrypt function for computing encryption key.
 * This is a wrapper around the builtin scrypt function using util.promisify
 * @param password - the password
 * @param salt  - the salt
 * @param legnth - the lenght of the encryption key
 */
export declare function async_scrypt(password: string, salt: string, length: number): Promise<unknown>;
/**
 * Performs in memory AES-192 encryption on a message given the supplied password.
 * Generates a random initialization vector (iv) for the encryption, and returns
 * both the cipher text and the iv.
 * @param password - encryption password
 * @param message - Message to encrypt, which is usually a String or a Buffer
 */
export declare function aes_192_encrypt_message(password: string, message: (string | Buffer)): Promise<{
    iv: Buffer;
    cipher: Buffer;
}>;
/**
 * Performs in memory AES-192 decryption on a buffer given the supplied password and initialization vector
 * Returns the decrypted buffer.
 */
export declare function aes_192_decrypt_buffer(password: string, cipher: Buffer, iv: Buffer): Promise<Buffer>;
/**
 * Performs in memory AES-192 encryption of a file given the supplied password.
 * The encrypted output cipher is prepended with the randomly generated 16 byte initialization vector (iv) prior to writing to disk.
 * See aes_192_decrypt_file for more information on decryption.
 * @param password - Password to use for encryption
 * @param input_file - File to encrypt
 * @param output_file  - Path (including extension) to write the encrypted file to
 */
export declare function aes_192_encrypt_file(password: string, input_file: string, output_file: string): Promise<void>;
/**
 * Performs in memory AES-192 decryption of a file given the supplied password.
 * Assumes that the first 16 bytes of the file are the plaintext initial vector (see aes_192_encrypt_file).
 * Returns a decrypted buffer (which can then be converted to a string for text files)
 * @param password - Password to use for decryption
 * @param filename - File to decrypt
 */
export declare function aes_192_decrypt_file(password: string, filename: string): Promise<Buffer>;
/**
 * Computes the hash (checksum) of a file
 * @param fname - Name of the file
 * @param hash_type  - Type of hash to compute
 */
export declare function file_checksum(fname: string, hash_type: string): string;
