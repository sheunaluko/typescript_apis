
import { ethers } from 'ethers'; // https://docs.ethers.io/v4/getting-started.html
import { v4 as uuidv4 } from 'uuid';
import * as io from "../../io"
import {get_logger}  from "../../../common/logger"


let dpw  = (process.env["EVM_WALLETS_PASSW"] as string) 
let wloc = (process.env["EVM_WALLETS_LOC"] as string)

let log = get_logger({id :'evmw'})

function check_reqs() { 
    if ( ! ( dpw && wloc ) ) {
	log("ENV vars EVM_WALLETS_(PASSW/LOC) are required to proceed. Please set these and run the process again.")
	process.exit(1) ; 
    }
    log("ENV vars EVM_WALLETS_(PASSW/LOC) are set; proceeding.") 
} 

/**
 * Generate random wallet. Uses the 'EVM_WALLETS_PASSW' env var to encrypt and stores the 
 * Wallet structure into a subdirectory of 'EVM_WALLETS_LOC'. These must be set. 
 * The latter is created if it does not exist. 
 * @param {object} metadata - Optional metadata (name, num) 
 */
async function generate_random_json_wallet(metadata :  any) : Promise<WALLET | undefined> {

    check_reqs() ;
    
    let { name , num }  = metadata ; 

    let wid = uuidv4() ;
    
    log(`[${wid}] Generating wallet...`)
    let wallet = ethers.Wallet.createRandom() ;
    if (! dpw ) { log("Please set EVM_WALLETS_PASSW in the env, unable to encrypt wallet!") ; return }

    if (!wloc)  { log("Please set EVM_WALLETS_LOC in the env, unable to encrypt wallet!") ; return }


    log(`[${wid}] Encrypting wallet...`)
    let options = {
	scrypt: {
	    N: (1 << 16)
	}
    };
    //https://github.com/ethers-io/ethers.js/issues/390
    let json   = await wallet.encrypt(dpw, options) 
    let wallet_base = io.path.join(wloc,wid)

    //write the json file 
    let json_fname = io.path.join(wallet_base, "wallet.json")

    log(`[${wid}] Writing wallet json`)            
    await io.write_text( { path : json_fname, data : json , append :false })

    //write a metadata file
    if ( num == undefined ) { num = -1 } 
    let _metadata = { name : ( name || wid ) , number : num } 
    let meta_fname = io.path.join(wallet_base, "metadata.json")
    log(`[${wid}] Writing wallet metadata`)                
    await io.write_text( { path : meta_fname, data : JSON.stringify(_metadata) , append :false })
    log(`[${wid}] Done`)

    return {
	wallet , metadata : _metadata, dloc : wallet_base 
    } 
}

function wallet_subdirectories() {
    check_reqs() ;    
    return Array.from(io.read_dir(wloc)).map( (x:any) => io.path.join(wloc,x) )
} 

async function parse_wallet(dloc : string) {
    let jsonf = io.path.join(dloc, "wallet.json") ; 
    let metadata = JSON.parse( io.read_text( io.path.join(dloc, "metadata.json") ) )
    log(`Decrypting wallet ${dloc}`)
    let wallet =  await ethers.Wallet.fromEncryptedJson( io.read_text(jsonf) , dpw )
    log(`Done Decrypting wallet ${dloc}`)    
    return {
	wallet , metadata , dloc 
    } 
} 

async function load_wallets() {
    check_reqs() ;    
    let subds = wallet_subdirectories()
    let wallets = [] 
    for (var s of subds ){
	wallets.push( parse_wallet(s)) 
    }
    
    LOADED_WALLETS  = await Promise.all(wallets)
    return LOADED_WALLETS 
}

export type WALLET = {
    wallet : ethers.Wallet ,
    metadata :{ name : string, number : number } ,
    dloc : string, 
} 

var LOADED_WALLETS : (WALLET|undefined)[]  = [] ;

/**
 * Returns an array of all the loaded wallets 
 */
async function get_loaded_wallets() {
    check_reqs() ;    
    if (LOADED_WALLETS.length > 0 ) {
	return LOADED_WALLETS
    } else {
	LOADED_WALLETS = await load_wallets() 
	return LOADED_WALLETS 
    } 
}


/**
 * Generates up to N random wallets on local device and stores n as 'num' in their metadata
 * Skips ones that have already been generated 
 * Requires that the env vars EVM_WALLETS_PASSW and EVM_WALLETS_LOC are set. 
 * @param {number} n - The number of wallets 
 */
async function generate_numbered_wallets(n : number) {
    check_reqs() ;    
    let wallets = await get_loaded_wallets() ;
    let used_numbers = wallets.map( (w:any)=> w.metadata.number ) ;

    let new_wallets : WALLET[] = [] 
    for (var i=0; i< n; i++) {
	if (used_numbers.indexOf(i) > -1 ) {
	    log(`Skipping number: ${i}`)
	} else {
	    let metadata = { name : null , num : i } 
	    let wallet_info = await generate_random_json_wallet(metadata)
	    new_wallets.push(wallet_info as WALLET) 
	} 
    }

    let resolved_new_wallets = await Promise.all(new_wallets)
    log("Finished generating new wallets.. adding to loaded.")
    resolved_new_wallets.map( (w:any) => LOADED_WALLETS.push(w) )
    log("Done")     
} 


/**
 * Searches for a local wallet by its public evm address
 * @param {address} s - The address
 */
export async function get_wallet_by_address(a : string) {
    check_reqs() ;    
    let wallets = await get_loaded_wallets() ;
    return wallets.filter( (w:(WALLET|undefined)) => {
	let resolved_wallet = w as WALLET ;
	return (resolved_wallet.wallet.address == a ) 
    })[0]
} 


export {
    ethers ,
    generate_random_json_wallet ,
    generate_numbered_wallets , 
    load_wallets ,
    get_loaded_wallets, 
    parse_wallet,
    wallet_subdirectories,
    LOADED_WALLETS , 
} 
