import { studionet } from "genlayer-js/chains";

export interface GenLayerChain {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: {
      http: readonly string[];
    };
    [key: string]: any;
  };
  blockExplorers?: {
    default: {
      name: string;
      url: string;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

export interface GenLayerNetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const GENLAYER_CHAIN: GenLayerChain = studionet;
export const GENLAYER_CHAIN_ID: number = studionet.id;
export const GENLAYER_CHAIN_ID_HEX: string = `0x${studionet.id.toString(16)}`;

export const GENLAYER_NETWORK: GenLayerNetworkConfig = {
  chainId: GENLAYER_CHAIN_ID_HEX,
  chainName: studionet.name,
  nativeCurrency: studionet.nativeCurrency,
  rpcUrls: [...studionet.rpcUrls.default.http],
  blockExplorerUrls: studionet.blockExplorers ? [studionet.blockExplorers.default.url] : [],
};
