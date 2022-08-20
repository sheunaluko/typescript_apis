export declare var ethereum: {
    uniswap: {
        contracts: {
            eth_usdc: string;
        };
    };
};
export declare var arbitrum: {
    uniswap: {
        contracts: {
            eth_usdc: string;
        };
    };
};
export declare var fantom: {
    mainnet: {
        chain_id: number;
        spookyswap: {
            router: {
                address: string;
            };
            pools: {
                usdc_ftm: {
                    address: string;
                };
            };
        };
        tokens: {
            usdc: {
                contract_address: string;
                decimals: number;
                name: string;
                symbol: string;
            };
            wftm: {
                contract_address: string;
                decimals: number;
                name: string;
                symbol: string;
            };
        };
    };
};
