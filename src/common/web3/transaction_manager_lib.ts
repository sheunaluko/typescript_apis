/* 
   A library for managing EVM Transactions built on top of ethers.js 
*/

import * as asnc from "../async" ; 

export type TryTxResult = {
    timeout : boolean ,
    error : boolean,
    error_info? : any ,
    data : any ,
    tx_ops : TryTxOps , 
} 

export type TransactionFunction = (nonce : number) => Promise<TryTxResult> ; 

export type TryTxOps = {
    tx_fn : TransactionFunction ,
    timeout_ms : number ,
    nonce : number, 
}

export function try_transaction( ops : TryTxOps ) : TryTxResult {
    let { tx_fn , nonce, timeout_ms } = ops ;
    let tmp : any = await Promise.race( [tx_fn(nonce), asnc.wait(timeout)] )  ;
    // either the transaction returned a TryTxResult OR timeout returned status.TIMEOUT
    // - - 
    if (tmp == asnc.status.TIMEOUT ) { 	//timeout occured
	return {
	    timeout : true ,
	    error : false ,
	    data :  null ,
	    tx_ops : ops ; 
	} 
    } else { return tmp } ;  // timeout did not occur 

}

/* 
   steps to get a transaction mined: 
   1) estimateGas(tx_ops) ; 
   2) unsigned_tx = populateTransaction(tx_ops); 
   
   var nonce = X ; 
   3) let results = submit_tx_with_nonce( unsigned_tx, nonce) 
   
*/





