/*
  ARPA (Automated Rebalancing Portfolio Allocator)
  Mon Jul  4 13:51:24 CDT 2022
*/


import * as common from "../../common/index"
import * as node from "../../node/index"


import prompt from 'prompt' ;
import colors from  '@colors/colors/safe' ; 
import * as repl from "repl" ;
import { ethers } from 'ethers';  
import * as R from 'ramda' ;
import {PortfolioBalancer} from "../../common/trading/portfolio_balancer_lib" ; 
import { program } from 'commander'  ;

declare var global : any;

/* 
Configure command line arges 
*/ 
program.option('--mode <type>' , 'runtime mode', 'run' ) ; 

program.parse();

const args = program.opts();
// - 


const io = node.io ; 
let log = common.logger.get_logger({id:colors.green("arpa_main")}) ;

prompt.message = colors.rainbow("[ARPA]");
prompt.delimiter = colors.green(" ");

var schema = {
    properties: {
	runtime_password : {
	    hidden : true  , 
            required: true ,
	    description: "Please enter the runtime password" ,
	    replace : "*", 
	},
    }
};

// Start the prompt
prompt.start();
let {runtime_password } = await prompt.get(schema) ; 

log("Reading ./arpa_config.json")
let config = node.io.read_json("arpa_config.json")

log("Processing the configuration file...")
var balancers = (await Promise.all( config.map( process_config_entry ) )) as PortfolioBalancer[]

log("Finished preparing balancers, proceeding with main thread") ;
log(`Running with selected mode: ${args.mode}`) 

// At this point we iterate through the balancers
async function main_thread() {
    var balancer : PortfolioBalancer ; 
    for (var balancer of balancers) {
	log(`Running balancer ${balancer.Params.logger_id}`)
	let x = await balancer.balance_portfolio()
    } 
}

async function check_balance() {
    var balancer : PortfolioBalancer ; 
    for (var balancer of balancers) {
	log(`Running balancer ${balancer.Params.logger_id}`)
	let x = await balancer.get_balance_data()
	log(x) 
    } 
}

async function _repl() {
    // - prep repl 
    Object.assign(global, {
	balancers 
    })
    // - start repl 
    const replServer = repl.start({
	prompt: '@> ',
    });
} 

//
const run_dic : {[s:string] : any} = {
    'run' :  main_thread ,
    'check' : check_balance  ,
    'repl' : _repl , 
} 

// --
await (run_dic[args.mode])()  









// -- helper functions 

async function process_config_entry(entry : any ) {
    switch (entry.type ) {
	case 'binanceus' :
	    return (await handle_binanceus_config_entry(entry)) 
	    break ;
	case 'uniswap_v2' :
	    return (await handle_uniswap_v2_config_entry(entry)) 
	    break ; 
	default :
	    log(`Error: Unknown config entry type : ${entry.type}`) ;
	    process.exit(1) ; 
    } 
} 

async function handle_binanceus_config_entry(entry : any){
    //the main step is to decrypt the keyfile usign the runtime password
    let {parameters , keyfile  } = entry ; 
    log(`Decrypting binanceus keyfile: ${keyfile}`) ;
    let buf = await node.cryptography.aes_192_decrypt_file(runtime_password as string, keyfile)
    let keys = JSON.parse(buf.toString('utf8'))

    let balancer = new node.trading.binanceus_balancer.BinanceUsBalancer({...parameters, keys})
    log("Created binanceus balancer")    
    return balancer  
}



interface Uni_v2_entry {
    network : string,
    ethers_wallet : string,
    balance_parameters : common.trading.portfolio_balancer_lib.BalanceParams ,
    evm_parameters  :  common.web3.evm_balancers.BaseAMMParams , 
} 

async function handle_uniswap_v2_config_entry(entry : Uni_v2_entry ) {

    let {network,
	 ethers_wallet,
	 balance_parameters,
	 evm_parameters } = entry ;
    
    const {smart_wallet} = common.web3 ;
    const {TxType} = smart_wallet;
    
    //first we decrypt the wallet file
    log(`Decrypting ${ethers_wallet}`)
    let wallet =  await ethers.Wallet.fromEncryptedJson( io.read_text(ethers_wallet) , runtime_password as string )
    
    //configure the provider and tx_type 
    let dic : {[k:string]:any}  = {
	'fantom'   : [ smart_wallet.fantom_provider()   , TxType.LEGACY   ] ,
	'ethereum' : [ smart_wallet.ethereum_provider() , TxType.EIP_1559 ] ,
	'polygon'  : [ smart_wallet.polygon_provider()  , TxType.LEGACY   ] , 
    } 

    if (! dic[network]) {
	log(`Error: Unkown network in config file : ${network} `)
	process.exit(1) ;
    } 
    
    let [provider, tx_type ]  = dic[network]  ; 

    //and create a smart wallet
    let ops = { privateKey : wallet.privateKey , provider , tx_type}  ; 
    let sw = new smart_wallet.SmartWallet(ops) ;
    await sw.init() ;

    //now the smart wallet is created and we use the parameters to create a balancer object
    let uni_ops  = R.mergeAll( [balance_parameters, evm_parameters , {smartWallet : sw} ] ) as common.web3.evm_balancers.AMMParams  ;

    log(`Initializing UNI_V2 Balancer (${balance_parameters.logger_id})`) ; 
    var w = new common.web3.evm_balancers.UniV2Balancer( uni_ops ) ; await w.init()  ;

    //and return it 
    return w ; 
    
} 
