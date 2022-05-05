
/*
  Configure the repl environment for development purposes. 
*/

import * as apis from "./ext_api/index" ;
import {get_logger} from "../common/logger"

declare var global : any ; 

let {
    ethers , 
} =  apis ; 

const log = get_logger({id:"ndev"})

/**
 * Main function that runs after initialization of the repl. 
 * Use this to configure the nrepl environment prior to your use. 
 */
function main() { 
    //add directly to the global object 
    global.w = ethers.wallets ;  let w = global.w ; 
    log("Generating 10 evm wallets") ;
    global.ws = w.generate_numbered_wallets(10) ; 
}

main() ; 

