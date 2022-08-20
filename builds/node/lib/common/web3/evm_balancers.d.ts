import { ethers } from "ethers";
import * as pbl from "../trading/portfolio_balancer_lib";
import UNISWAP from "@uniswap/sdk";
import { SmartWallet, BaseSmartSendOps, TxStatus } from "./smart_wallet";
export declare type GasOps = {
    low: ethers.BigNumber;
    medium: ethers.BigNumber;
    high: ethers.BigNumber;
    usd_price: number;
};
export declare type GasEstimator = () => Promise<GasOps | null>;
export interface EVMParams extends pbl.BalanceParams {
    smartWallet: SmartWallet;
}
/**
 * Creates an EVM balancer object
 */
export declare abstract class EVMBalancer extends pbl.PortfolioBalancer {
    wallet: SmartWallet;
    constructor(params: EVMParams);
}
export declare type Token = {
    contract_address: string;
    decimals: number;
    symbol: string;
    name: string;
};
export interface BaseAMMParams {
    router_address: string;
    pool_address: string;
    chain_id: number;
    token0?: Token;
    token1?: Token;
    token0_is_base_asset: boolean;
    max_slippage_percent: number;
}
export interface AMMParams extends EVMParams, BaseAMMParams {
}
declare type TokensInfo = {
    base_token: UNISWAP.Token | null;
    quote_token: UNISWAP.Token | null;
    base_token_contract: ethers.Contract | null;
    quote_token_contract: ethers.Contract | null;
    base_token_decimals: number | null;
    quote_token_decimals: number | null;
};
export declare class UniV2Balancer extends EVMBalancer {
    params: AMMParams;
    routerContract: ethers.Contract | null;
    poolContract: ethers.Contract | null;
    token0: UNISWAP.Token | null;
    token1: UNISWAP.Token | null;
    token0Contract: ethers.Contract | null;
    token1Contract: ethers.Contract | null;
    tokens: TokensInfo | null;
    gasLimitMultiple: number;
    constructor(ammParams: AMMParams);
    init(): Promise<void>;
    get_base_balance(ba: string): Promise<number>;
    get_quote_balance(qa: string): Promise<number>;
    get_base_price(ba: string, qa: string): Promise<number>;
    generate_swap_transaction(base_or_quote: string, amt: number): Promise<{
        tx: ethers.PopulatedTransaction;
        output_info: any;
        gas_estimate: ethers.BigNumber;
    }>;
    do_swap(base_or_quote: string, amt: number, base_smart_send_ops: BaseSmartSendOps): Promise<{
        status: any;
        tx_gas_info: {
            maxGasPrice: any;
            gasLimit: any;
            maxTxFee: any;
        };
        tx_attempts: any;
        details: any;
        ops: import("./smart_wallet").SmartSendOps;
        receipt?: undefined;
    } | {
        status: TxStatus;
        receipt: any;
        tx_attempts: any;
        ops: import("./smart_wallet").SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
    } | {
        status: TxStatus;
        details: any;
        tx_attempts: any;
        ops: import("./smart_wallet").SmartSendOps;
        tx_gas_info?: undefined;
        receipt?: undefined;
    } | {
        status: TxStatus;
        tx_attempts: any;
        ops: import("./smart_wallet").SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
        receipt?: undefined;
    } | {
        success: boolean;
    }>;
    base_token_approved(): Promise<any>;
    quote_token_approved(): Promise<any>;
    approve_token(token_contract: ethers.Contract, base_smart_send_ops: BaseSmartSendOps): Promise<{
        status: any;
        tx_gas_info: {
            maxGasPrice: any;
            gasLimit: any;
            maxTxFee: any;
        };
        tx_attempts: any;
        details: any;
        ops: import("./smart_wallet").SmartSendOps;
        receipt?: undefined;
    } | {
        status: TxStatus;
        receipt: any;
        tx_attempts: any;
        ops: import("./smart_wallet").SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
    } | {
        status: TxStatus;
        details: any;
        tx_attempts: any;
        ops: import("./smart_wallet").SmartSendOps;
        tx_gas_info?: undefined;
        receipt?: undefined;
    } | {
        status: TxStatus;
        tx_attempts: any;
        ops: import("./smart_wallet").SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
        receipt?: undefined;
    }>;
    approve_quote_token(base_smart_send_ops: BaseSmartSendOps): Promise<{
        status: any;
        tx_gas_info: {
            maxGasPrice: any;
            gasLimit: any;
            maxTxFee: any;
        };
        tx_attempts: any;
        details: any;
        ops: import("./smart_wallet").SmartSendOps;
        receipt?: undefined;
    } | {
        status: TxStatus;
        receipt: any;
        tx_attempts: any;
        ops: import("./smart_wallet").SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
    } | {
        status: TxStatus;
        details: any;
        tx_attempts: any;
        ops: import("./smart_wallet").SmartSendOps;
        tx_gas_info?: undefined;
        receipt?: undefined;
    } | {
        status: TxStatus;
        tx_attempts: any;
        ops: import("./smart_wallet").SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
        receipt?: undefined;
    }>;
    approve_base_token(base_smart_send_ops: BaseSmartSendOps): Promise<{
        status: any;
        tx_gas_info: {
            maxGasPrice: any;
            gasLimit: any;
            maxTxFee: any;
        };
        tx_attempts: any;
        details: any;
        ops: import("./smart_wallet").SmartSendOps;
        receipt?: undefined;
    } | {
        status: TxStatus;
        receipt: any;
        tx_attempts: any;
        ops: import("./smart_wallet").SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
    } | {
        status: TxStatus;
        details: any;
        tx_attempts: any;
        ops: import("./smart_wallet").SmartSendOps;
        tx_gas_info?: undefined;
        receipt?: undefined;
    } | {
        status: TxStatus;
        tx_attempts: any;
        ops: import("./smart_wallet").SmartSendOps;
        tx_gas_info?: undefined;
        details?: undefined;
        receipt?: undefined;
    }>;
    prepare_tokens(base_smart_send_ops: BaseSmartSendOps): Promise<{
        success: boolean;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            base_result: any;
            quote_result: any;
        };
    }>;
    get_base_tx_ops(): Promise<{
        wallet: ethers.Wallet;
        addr: string;
        from: string;
        overrides: any;
        base_token: UNISWAP.Token;
        quote_token: UNISWAP.Token;
        base_token_contract: ethers.Contract;
        quote_token_contract: ethers.Contract;
        router_contract: ethers.Contract;
    }>;
    get_tx_gas_info(tx: any, usd_price: number): {
        max_total_gas: number;
        max_total_gas_usd: number;
        l1_price_usd: number;
        gasPrice: any;
        gasLimit: any;
    };
    estimate_quote_out(amt: number): Promise<{
        amounts: any;
        amountOutNoSlip: number;
        amountIn: ethers.BigNumber;
        amountOut: number;
        slippageRatio: number;
        slippagePercent: number;
        max_slippage_percent: number;
        minAmountOutNum: string;
        minAmountOut: ethers.BigNumber;
        path: string[];
    }>;
    estimate_base_out(amt: number): Promise<{
        amounts: any;
        amountOutNoSlip: number;
        amountIn: ethers.BigNumber;
        amountOut: number;
        slippageRatio: number;
        slippagePercent: number;
        max_slippage_percent: number;
        minAmountOutNum: string;
        minAmountOut: ethers.BigNumber;
        path: string[];
    }>;
    get_pool_reserves(): Promise<{
        token0reserves: number;
        token1reserves: number;
        base_reserves: number;
        quote_reserves: number;
    }>;
    do_market_trade(trade_type: pbl.MarketTradeType, base_amt: number): Promise<pbl.MarketResult>;
    symbol_generator(ba: string, qa: string): string;
}
export {};
