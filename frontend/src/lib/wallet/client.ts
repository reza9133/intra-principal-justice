import { studionet } from "genlayer-js/chains";
import type { EIP1193Provider } from "./eip6963";

export const GENLAYER_CHAIN = studionet;
export const GENLAYER_CHAIN_ID = studionet.id;
export const GENLAYER_CHAIN_ID_HEX = `0x${studionet.id.toString(16)}`;

let selectedProvider: EIP1193Provider | null = null;

export function setSelectedProvider(provider: EIP1193Provider | null): void {
  selectedProvider = provider;
}

export function getEthereumProvider(): EIP1193Provider | null {
  if (selectedProvider) return selectedProvider;
  if (typeof window === "undefined") return null;
  return (window as any).ethereum || null;
}

export async function requestAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("No wallet is connected");
  
  try {
    return await provider.request({ method: "eth_requestAccounts" });
  } catch (error: any) {
    throw new Error(`Failed to connect wallet: ${error.message}`);
  }
}

export async function getAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) return [];
  
  try {
    return await provider.request({ method: "eth_accounts" });
  } catch {
    return [];
  }
}

export async function getCurrentChainId(): Promise<string | null> {
  const provider = getEthereumProvider();
  if (!provider) return null;
  
  try {
    return await provider.request({ method: "eth_chainId" });
  } catch {
    return null;
  }
}

export async function addGenLayerNetwork(): Promise<void> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("No wallet is connected");
  
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [{
      chainId: GENLAYER_CHAIN_ID_HEX,
      chainName: studionet.name,
      rpcUrls: [...studionet.rpcUrls.default.http],
      nativeCurrency: studionet.nativeCurrency,
    }],
  });
}

export async function switchToGenLayerNetwork(): Promise<void> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("No wallet is connected");
  
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: GENLAYER_CHAIN_ID_HEX }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      await addGenLayerNetwork();
    } else {
      throw error;
    }
  }
}

export async function isOnGenLayerNetwork(): Promise<boolean> {
  const chainId = await getCurrentChainId();
  if (!chainId) return false;
  return parseInt(chainId, 16) === GENLAYER_CHAIN_ID;
}

export async function connectMetaMask(): Promise<string> {
  if (!getEthereumProvider()) {
    throw new Error("No wallet is available to connect");
  }

  const accounts = await requestAccounts();
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found");
  }

  const onCorrectNetwork = await isOnGenLayerNetwork();
  if (!onCorrectNetwork) {
    await switchToGenLayerNetwork();
  }

  return accounts[0];
}

export async function switchAccount(): Promise<string> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("No wallet is connected");
  
  await provider.request({
    method: "wallet_requestPermissions",
    params: [{ eth_accounts: {} }],
  });
  
  const accounts = await provider.request({ method: "eth_accounts" });
  if (!accounts || accounts.length === 0) {
    throw new Error("No account selected");
  }
  
  return accounts[0];
}

export async function revokePermissions(): Promise<void> {
  const provider = getEthereumProvider();
  if (!provider) return;
  try {
    await provider.request({
      method: "wallet_revokePermissions",
      params: [{ eth_accounts: {} }],
    });
  } catch {}
}
