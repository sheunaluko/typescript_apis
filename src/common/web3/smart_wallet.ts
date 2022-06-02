import { ethers } from 'ethers' ; 
import {get_logger}  from "../logger" ; 
import * as asnc from "../async"; 
import * as R from 'ramda';

const {
    formatEther ,
    parseEther,
    formatUnits,
    parseUnits 
}  = ethers.utils ; 

/*
  Extend the ethers.Wallet class to make a wallet that automatically 
  Resends transactions with higher gasPrice until the transaction is mined 
  OR the number of tries is reached OR a max gasPrice is reached 

  Supports EIP_1559 and legacy transactions for greater EVM coverage 
*/ 

type GasOps = {
    gasPrice : ethers.BigNumber,
    usdPrice : number, 
} 

export enum  MaxGasType {
    GasPrice,
    TxFee, 
} 

export type MaxGasOps = {
    type : MaxGasType ,
    value:  ethers.BigNumber , 
} 

export type SmartSendOps = { 
    tx : ethers.UnsignedTransaction ,
    max_gas_ops : MaxGasOps , 
    timeout_ms : number ; 
    max_retries : number ; 
}

export function scale_big_num(n : ethers.BigNumber, ratio : number ) {
    let x_num = Math.ceil(ratio*Number(n.toString())) ;
    return ethers.BigNumber.from(String(x_num)) ;
} 

export enum TxStatus {
    Error,
    MaxRetriesReached,
    MaxGasReached ,
    GasVerified , 
    Success , 
}

export enum TxType {
    EIP_1559,
    LEGACY , 
}

export type SmartWalletOps = {
    privateKey : string,
    provider : ethers.providers.JsonRpcProvider , 
    tx_type : TxType , 
} 

export class SmartWallet extends ethers.Wallet {

    log : any ;
    params : SmartWalletOps ;
    id : any ; 
    
    constructor(ops : SmartWalletOps)  {

	let {privateKey, provider, tx_type} = ops ; 
	super(privateKey, provider) ;
	this.params = ops;
	
    }

    async init() {
	let {chainId} = await this.params.provider.ready ; 
	this.id = `${this.address.slice(1,6)}@${chainId}` ; 
	this.log = get_logger({id : this.id }) ;
    }

    async get_fee_data() {
	return await this.provider.getFeeData() ; 
    }
    
    async wrap_transactions_with_gas(txs : any[]) {
	let fee_data = await this.get_fee_data() ;
	let {maxFeePerGas,
	     maxPriorityFeePerGas,
	     gasPrice} = fee_data ;
	switch (this.params.tx_type) {
	    case TxType.EIP_1559 :
		txs.map(tx => Object.assign(tx, {maxFeePerGas}))
		return txs ; 
		break;
	    case TxType.LEGACY :
		txs.map(tx => Object.assign(tx, {gasPrice}))
		return txs ; 
		break; 
	} 
    }

    async get_gas_overrides() {
	let tx = {} ;
	return (await this.wrap_transactions_with_gas([tx]))[0]
    }

    multiply_transactions_gas_pricing(txs : any[],multiplier : number) {
	let scaler = ( (x:ethers.BigNumber)=>scale_big_num(x, multiplier) ) 
	switch (this.params.tx_type) {
	    case TxType.EIP_1559 :
		// @ts-ignore
		return txs.map( R.modifyPath(['maxFeePerGas'], scaler ))
	    case TxType.LEGACY :
		// @ts-ignore		
		return txs.map( R.modifyPath(['gasPrice'], scaler )) 
	}
    }

    async smart_eth_transfer(ops : { to: string,
				     amt : string,
				     max_gas_ops? : MaxGasOps , 
				     max_retries? : number,
				     timeout_ms? : number }) {

	var { to, amt, max_gas_ops, max_retries , timeout_ms } = ops ; 

	let default_gas_ops = { type : MaxGasType.TxFee ,
				value : parseEther("0.0001") }
										  
	max_gas_ops       = (max_gas_ops       || default_gas_ops ) ; 
	max_retries       = (max_retries       || 5 ) ;
	timeout_ms        = (timeout_ms        || 1000*30 )  ;

	let tx = await this.generate_l1_transfer_tx(to,amt)  ; 		    
	let smart_ops = {
	    tx, max_gas_ops , max_retries, timeout_ms 
	}
	return (await this.smartSendTransaction(smart_ops)) ; 
    }

    async generate_l1_transfer_tx(to : string, amt : string  ) {
	let tx = {
	    from : this.address , 
	    to ,
	    value : ethers.utils.parseEther(amt) ,
	    gasLimit : ethers.BigNumber.from("25000") , 
	}
	return (await this.wrap_transactions_with_gas([tx]))[0] ; 
    } 


    async smartSendTransaction( ops : SmartSendOps ) { 
	
        let { 
            tx ,
	    max_gas_ops, 
	    max_retries ,
	    timeout_ms ,
        } = ops  ;

	var nonce = await this.getTransactionCount() ;
	let tx_log = get_logger({id : `${this.id}:${nonce}` }); 

	var tx_attempts : any = [] ;
	
        tx_log("Processing SmartSend Tx Request::");
	tx_log(`Nonce is ${nonce}`)	
    	tx_log(tx) ;

	let overrides = await this.get_gas_overrides() ;
	overrides.nonce = nonce ; 

	for (var i=0 ; i < max_retries ; i ++ ) {
	    tx_log(`Attempt number: ${i+1}`) ;
	    tx_log('overrides:') ; tx_log(overrides) ;
	    Object.assign(tx, overrides) ; 
	    tx_log('tx:') ; tx_log(tx) ; 

	    try {

		//check transaction gas before even submitting 
		let info = await this.check_transaction_gas(tx,max_gas_ops)  ; 
		let {
		    tx_gas_info , 
		    status,
		    details
		}  = info ; 

		if (status != TxStatus.GasVerified) {
		    tx_log("Tx gas failed verification... aborting")
		    return {
			status ,
			tx_gas_info ,
			tx_attempts ,
			details, 
			ops 
		    } 
		} else { 
		    // set up for next iteration
		    tx_log("Tx gas check passed... will send following tx: (see gas info after tx)")
		    tx_log(tx)
		    tx_log(tx_gas_info) 
		}

		
		let tx_response = await this.sendTransaction(tx as any) ;
		let tx_receipt  = tx_response.wait() ;
		tx_attempts.push([tx_response, tx_receipt]) ;
		
		let x : any = await Promise.race( [tx_receipt, asnc.wait(timeout_ms)] )  ;
		// either a status.TIMEUT occurred OR the tx_receipt is returned 
		if (x == asnc.status.TIMEOUT ) {
		    //timeout occured
		    tx_log("Timeout occurred.. tx not yet mined or errored")
		    tx_log("Modifying gas params...")
		    let multiplier = (1 + (i+1)*0.1)  ;
		    tx_log("Multiplier=" + multiplier) ;

		    //request the new gas estimate and populate the overrides 
		    Object.assign(overrides, await this.get_gas_overrides())
		    
		    tx_log("Got gas estimation:")
		    tx_log(overrides) ;

		    //modify the old transaction
		    Object.assign(tx, overrides)

		    tx_log("Looping") ; 
		    
		}  else {
		    //there was no timeout -- so the transaction must have been mined and x is the transaction receipt
		    tx_log("Transaction mined successfully!")
		    tx_log(x) ;
		    return {
			status : TxStatus.Success ,
			receipt : x ,
			tx_attempts ,
			ops , 
		    } 
		    
		} 

	    } catch (e) {
		//some kind of error happened.. the transaction may have been rejected, who knows.
		tx_log("Error occurred :(")
		tx_log(e) 
		return {
		    status : TxStatus.Error,
		    details : e ,
		    tx_attempts,
		    ops , 
		} 
	    }
	}

	//here we have reached the max number of retries
	return {
	    status : TxStatus.MaxRetriesReached ,
	    tx_attempts , 
	    ops,  
	}
    }

    get_gas_price_field() {
	switch( this.params.tx_type) {
	    case TxType.EIP_1559 :
		return 'maxFeePerGas'
	    case TxType.LEGACY :
		return 'gasPrice' 
	} 
    }
    
    calculate_transaction_gas(tx : any ) {
	let maxGasPrice = tx[this.get_gas_price_field()] ;
	let gasLimit    = tx.gasLimit ;
	let maxTxFee    = maxGasPrice.mul(gasLimit) ;
	return {
	    maxGasPrice,
	    gasLimit,
	    maxTxFee
	} 
    } 
    
    check_transaction_gas(tx : any , gas_ops : MaxGasOps ) {
	let tx_gas_info = this.calculate_transaction_gas(tx) ;
	let {
	    maxGasPrice,
	    gasLimit,
	    maxTxFee
	} =  tx_gas_info ; 

	var status ;
	var details ;

	switch ( gas_ops.type  ) {
	    case MaxGasType.TxFee :
		this.log("0"); 
		if ( maxTxFee.gt(gas_ops.value)  ) {
		    status = TxStatus.MaxGasReached ;
		    details = `MaxFee of ${formatEther(gas_ops.value)} was exceeded by planned fee of ${formatEther(maxTxFee)}`
		} else {
		    status = TxStatus.GasVerified
		    details = `MaxFee of ${formatEther(gas_ops.value)} was verified by planned fee of ${formatEther(maxTxFee)}`		    
		} 
		break 
	    case MaxGasType.GasPrice :
		if (maxGasPrice.gt(gas_ops.value) ) {
		    status  = TxStatus.MaxGasReached
		    details = `MaxGasPrice of ${formatUnits(gas_ops.value,'gwei')} (gwei) was exceeded by planned price of ${formatUnits(maxGasPrice,'gwei')} (gwei)`
		} else 	{
		    status = TxStatus.GasVerified
		    details = `MaxGasPrice of ${formatUnits(gas_ops.value,'gwei')} (gwei) was verified by planned price of ${formatUnits(maxGasPrice,'gwei')} (gwei)`		    
		}		 
		break
	    default :
		status = TxStatus.Error
		details = "Unkown MaxGasType"
		break 
	}

	let to_ret =  {
	    tx_gas_info, 
	    status,
	    details, 
	}

	this.log(details) ;
	
	return to_ret ; 
    }


    async balanceAsNumber() {
	return Number(formatEther(await this.getBalance()))
    } 
    
}

