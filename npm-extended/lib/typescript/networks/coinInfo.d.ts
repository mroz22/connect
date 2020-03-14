export interface CoinSupport {
    connect: boolean;
    // electrum not used,
    trezor1: string;
    trezor2: string;
    // webwallet not used
}

// copy-paste from 'bitcoinjs-lib-zcash' module
export interface Network {
    messagePrefix: string;
    bech32?: string;
    bip32: {
        public: number;
        private: number;
    };
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
    dustThreshold: number;
    coin: string;
}

export interface BlockchainLink {
    type: string;
    url: string[];
}

export type BitcoinDefaultFeesKeys = 'High' | 'Normal' | 'Economy' | 'Low';
export type BitcoinDefaultFees = { [key in BitcoinDefaultFeesKeys]: number };

export interface BitcoinNetworkInfo {
    type: 'bitcoin';
    // address_type: in Network
    // address_type_p2sh: in Network
    // bech32_prefix: in Network
    // consensus_branch_id in Network
    // bip115: not used
    // bitcore: not used
    // blockbook: not used
    blockchainLink?: BlockchainLink;
    blocktime: number;
    cashAddrPrefix?: string;
    label: string; // this is human readable format, could be different from "name"
    name: string; // this is Trezor readable format
    shortcut: string;
    // cooldown not used
    curveName: string;
    // decred not used
    defaultFees: BitcoinDefaultFees;
    dustLimit: number;
    forceBip143: boolean;
    forkid?: number;
    // github: not used
    hashGenesisBlock: string;
    // key not used
    // maintainer: not used
    maxAddressLength: number;
    maxFeeSatoshiKb: number;
    minAddressLength: number;
    minFeeSatoshiKb: number;
    // name: same as coin_label
    segwit: boolean;
    // signed_message_header: in Network
    slip44: number;
    support: CoinSupport;
    // uri_prefix not used
    // version_group_id: not used
    // website: not used
    // xprv_magic: in Network
    xPubMagic: number;
    xPubMagicSegwitNative?: number;
    xPubMagicSegwit?: number;

    // custom
    network: Network;
    isBitcoin: boolean;
    hasTimestamp: boolean;
    minFee: number;
    maxFee: number;
    // used in backend
    blocks?: number;
    decimals: number;
}

export interface EthereumNetworkInfo {
    type: 'ethereum';
    blockchainLink?: BlockchainLink;
    blocktime: number;
    chain: string;
    chainId: number;
    // key not used
    defaultFees: Array<{
        label: 'high' | 'normal' | 'low';
        feePerUnit: string;
        feeLimit: string;
    }>;
    minFee: number;
    maxFee: number;
    label: string; // compatibility
    name: string;
    shortcut: string;
    rskip60: boolean;
    slip44: number;
    support: CoinSupport;
    // url not used
    network: typeof undefined; // compatibility
    decimals: number;
}

export interface MiscNetworkInfo {
    type: 'misc' | 'nem';
    blockchainLink?: BlockchainLink;
    blocktime: number;
    curve: string;
    // key not used
    defaultFees: BitcoinDefaultFees;
    minFee: number;
    maxFee: number;
    // links not used
    label: string; // compatibility
    name: string;
    shortcut: string;
    slip44: number;
    support: CoinSupport;
    network: typeof undefined; // compatibility
    decimals: number;
}

export type CoinInfo = BitcoinNetworkInfo | EthereumNetworkInfo | MiscNetworkInfo;
