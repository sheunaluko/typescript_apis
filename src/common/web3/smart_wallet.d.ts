import { ethers } from 'ethers';
export declare enum MaxGasType {
    GasPrice = 0,
    TxFee = 1
}
export declare type MaxGasOps = {
    type: MaxGasType;
    value: ethers.BigNumber;
};
export interface BaseSmartSendOps {
    max_gas_ops: MaxGasOps;
    timeout_ms: number;
    max_retries: number;
}
export interface SmartSendOps extends BaseSmartSendOps {
    tx: ethers.UnsignedTransaction;
}
export declare function scale_big_num(n: ethers.BigNumber, ratio: number): ethers.BigNumber;
export declare enum TxStatus {
    Error = 0,
    MaxRetriesReached = 1,
    MaxGasReached = 2,
    GasVerified = 3,
    Success = 4
}
export declare enum TxType {
    EIP_1559 = 0,
    LEGACY = 1
}
export interface TokenApprovalOps {
    token_contract: ethers.Contract;
    allowee_addr: string;
    base_smart_send_ops: BaseSmartSendOps;
}
export declare type SmartWalletOps = {
    privateKey: string;
    provider: ethers.providers.JsonRpcProvider;
    tx_type: TxType;
};
export declare class SmartWallet extends ethers.Wallet {
    log: any;
    params: SmartWalletOps;
    id: any;
    constructor(ops: SmartWalletOps);
    init(): Promise<void>;
    get_fee_data(): Promise<ethers.providers.FeeData>;
    wrap_transactions_with_gas(txs: any[]): Promise<any[]>;
    get_gas_overrides(): Promise<any>;
    multiply_transactions_gas_pricing(txs: any[], multiplier: number): unknown[];
    smart_eth_transfer(ops: {
        to: string;
        amt: string;
        max_gas_ops?: MaxGasOps;
        max_retries?: number;
        timeout_ms?: number;
    }): Promise<{
        status: any;
        tx_gas_info: {
            maxGasPrice: any;
            gasLimit: any;
            maxTxFee: any;
        };
        tx_attempts: any;
        details: any;
        ops: SmartSendOps;
        receipt?: undefined;
    } | {
        status: TxStatus;
        receipt: any;
        tx_attempts: any;
        ops: SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
    } | {
        status: TxStatus;
        details: any;
        tx_attempts: any;
        ops: SmartSendOps;
        tx_gas_info?: undefined;
        receipt?: undefined;
    } | {
        status: TxStatus;
        tx_attempts: any;
        ops: SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
        receipt?: undefined;
    }>;
    generate_l1_transfer_tx(to: string, amt: string): Promise<any>;
    get_token_allowance(token_contract: ethers.Contract, allowee_addr: string): Promise<any>;
    token_allowance_is_maxed(token_contract: ethers.Contract, allowee_addr: string): Promise<any>;
    generate_approve_token_tx(token_contract: ethers.Contract, allowee_addr: string): Promise<ethers.PopulatedTransaction>;
    fully_approve_token(ops: TokenApprovalOps): Promise<{
        status: any;
        tx_gas_info: {
            maxGasPrice: any;
            gasLimit: any;
            maxTxFee: any;
        };
        tx_attempts: any;
        details: any;
        ops: SmartSendOps;
        receipt?: undefined;
    } | {
        status: TxStatus;
        receipt: any;
        tx_attempts: any;
        ops: SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
    } | {
        status: TxStatus;
        details: any;
        tx_attempts: any;
        ops: SmartSendOps;
        tx_gas_info?: undefined;
        receipt?: undefined;
    } | {
        status: TxStatus;
        tx_attempts: any;
        ops: SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
        receipt?: undefined;
    }>;
    max_fee_ops(value: ethers.BigNumber): {
        type: MaxGasType;
        value: ethers.BigNumber;
    };
    max_price_ops(value: ethers.BigNumber): {
        type: MaxGasType;
        value: ethers.BigNumber;
    };
    default_smart_send_base(ethFee: number): {
        max_gas_ops: {
            type: MaxGasType;
            value: ethers.BigNumber;
        };
        max_retries: number;
        timeout_ms: number;
    };
    smartSendTransaction(ops: SmartSendOps): Promise<{
        status: any;
        tx_gas_info: {
            maxGasPrice: any;
            gasLimit: any;
            maxTxFee: any;
        };
        tx_attempts: any;
        details: any;
        ops: SmartSendOps;
        receipt?: undefined;
    } | {
        status: TxStatus;
        receipt: any;
        tx_attempts: any;
        ops: SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
    } | {
        status: TxStatus;
        details: any;
        tx_attempts: any;
        ops: SmartSendOps;
        tx_gas_info?: undefined;
        receipt?: undefined;
    } | {
        status: TxStatus;
        tx_attempts: any;
        ops: SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
        receipt?: undefined;
    }>;
    get_gas_price_field(): "maxFeePerGas" | "gasPrice";
    calculate_transaction_gas(tx: any): {
        maxGasPrice: any;
        gasLimit: any;
        maxTxFee: any;
    };
    check_transaction_gas(tx: any, gas_ops: MaxGasOps): {
        tx_gas_info: {
            maxGasPrice: any;
            gasLimit: any;
            maxTxFee: any;
        };
        status: any;
        details: any;
    };
    balanceAsNumber(): Promise<number>;
}
export declare enum ProviderType {
    Ethereum = 0,
    Fantom = 1,
    Arbitrum = 2,
    Polygon = 3
}
export declare function get_provider(p: ProviderType): ethers.providers.JsonRpcProvider;
export declare function fantom_provider(): ethers.providers.JsonRpcProvider;
export declare function ethereum_provider(): ethers.providers.JsonRpcProvider;
export declare function arbitrum_provider(): ethers.providers.JsonRpcProvider;
export declare function polygon_provider(): ethers.providers.JsonRpcProvider;
