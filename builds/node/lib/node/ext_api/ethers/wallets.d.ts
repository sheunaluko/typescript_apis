import { ethers } from 'ethers';
import { SmartWallet, TxType } from "../../../common/web3/smart_wallet";
/**
 * Generate random wallet. Uses the 'EVM_WALLETS_PASSW' env var to encrypt and stores the
 * Wallet structure into a subdirectory of 'EVM_WALLETS_LOC'. These must be set.
 * The latter is created if it does not exist.
 * @param {object} metadata - Optional metadata (name, num)
 */
declare function generate_random_json_wallet(metadata: any): Promise<ethers.Wallet>;
declare function wallet_subdirectories(): string[];
declare function parse_wallet(dloc: string): Promise<{
    wallet: ethers.Wallet;
    metadata: any;
}>;
declare type ParsedWallet = {
    wallet: ethers.Wallet;
    metadata: any;
};
declare function load_wallets(): Promise<ParsedWallet[]>;
declare var LOADED_WALLETS: ParsedWallet[];
/**
 * Returns an array of all the loaded wallets
 */
declare function get_loaded_wallets(): Promise<ParsedWallet[]>;
/**
 * Generates up to N random wallets on local device and stores n as 'num' in their metadata
 * Skips ones that have already been generated
 * Requires that the env vars EVM_WALLETS_PASSW and EVM_WALLETS_LOC are set.
 * @param {number} n - The number of wallets
 */
declare function generate_numbered_wallets(n: number): Promise<void>;
/**
 * Searches for and parses a local wallet by its public evm address
 * @param {string} s - The address
 */
export declare function get_wallet_by_address(a: string): Promise<ethers.Wallet>;
/**
 * Searches for and parses a local wallet by its public evm address
 * and then creates a SmartWallet instance connected to the specified
 * Provider
 * @param {string} addr - The address
 * @param {ethers.providers.JsonRpcProvider} p - Provider
 */
export declare function get_smart_wallet_by_address(addr: string, p: ethers.providers.JsonRpcProvider, tx_type: TxType): Promise<SmartWallet>;
export { ethers, generate_random_json_wallet, generate_numbered_wallets, load_wallets, get_loaded_wallets, parse_wallet, wallet_subdirectories, LOADED_WALLETS, };
