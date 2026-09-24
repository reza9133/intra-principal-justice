import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  connectMetaMask,
  switchAccount,
  getAccounts,
  getCurrentChainId,
  isOnGenLayerNetwork,
  getEthereumProvider,
  setSelectedProvider,
  revokePermissions,
  GENLAYER_CHAIN_ID,
} from "../lib/wallet/client";
import { discoverWallets, subscribeToWallets, type EIP6963ProviderDetail } from "../lib/wallet/eip6963";
import { refreshClient } from "../lib/genlayer";

const DISCONNECT_FLAG = "wallet_disconnected";
const SELECTED_WALLET_KEY = "wallet_selected_rdns";

export interface WalletState {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  isOnCorrectNetwork: boolean;
  availableWallets: EIP6963ProviderDetail[];
  selectedWalletRdns: string | null;
  error: string | null;
}

interface WalletContextValue extends WalletState {
  connectWallet: (walletDetail?: EIP6963ProviderDetail) => Promise<string>;
  disconnectWallet: () => Promise<void>;
  switchWalletAccount: () => Promise<string>;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

function applySelection(detail: EIP6963ProviderDetail | null) {
  setSelectedProvider(detail?.provider ?? null);
  if (typeof window === "undefined") return;
  if (detail) {
    localStorage.setItem(SELECTED_WALLET_KEY, detail.info.rdns);
  } else {
    localStorage.removeItem(SELECTED_WALLET_KEY);
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isLoading: true,
    isOnCorrectNetwork: false,
    availableWallets: [],
    selectedWalletRdns: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    discoverWallets().then((wallets) => {
      if (!cancelled) setState((prev) => ({ ...prev, availableWallets: wallets }));
    });
    const unsubscribe = subscribeToWallets((wallets) => {
      if (!cancelled) setState((prev) => ({ ...prev, availableWallets: wallets }));
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const initWallet = async () => {
      if (typeof window !== "undefined") {
        if (localStorage.getItem(DISCONNECT_FLAG) === "true") {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }
      }

      let selectedRdns = typeof window !== "undefined" ? localStorage.getItem(SELECTED_WALLET_KEY) : null;
      if (selectedRdns) {
        const wallets = await discoverWallets();
        const match = wallets.find((w) => w.info.rdns === selectedRdns);
        if (match) setSelectedProvider(match.provider);
        else selectedRdns = null;
      }

      const installed = !!getEthereumProvider();
      if (!installed) {
        setState((prev) => ({ ...prev, isLoading: false, selectedWalletRdns: selectedRdns }));
        return;
      }

      try {
        const accounts = await getAccounts();
        const chainId = await getCurrentChainId();
        const correctNetwork = await isOnGenLayerNetwork();
        
        setState((prev) => ({
          ...prev,
          address: accounts[0] || null,
          chainId,
          isConnected: accounts.length > 0,
          isLoading: false,
          isOnCorrectNetwork: correctNetwork,
          selectedWalletRdns: selectedRdns,
        }));
        
        if (accounts.length > 0) refreshClient();
      } catch (err) {
        setState((prev) => ({ ...prev, isLoading: false, selectedWalletRdns: selectedRdns }));
      }
    };
    initWallet();
  }, [state.availableWallets.length]);

  useEffect(() => {
    const provider = getEthereumProvider();
    if (!provider) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      const chainId = await getCurrentChainId();
      const correctNetwork = await isOnGenLayerNetwork();
      if (accounts.length > 0 && typeof window !== "undefined") {
        localStorage.removeItem(DISCONNECT_FLAG);
      }
      setState((prev) => ({
        ...prev,
        address: accounts[0] || null,
        chainId,
        isConnected: accounts.length > 0,
        isOnCorrectNetwork: correctNetwork,
      }));
      refreshClient();
    };

    const handleChainChanged = async (chainId: string) => {
      const correctNetwork = parseInt(chainId, 16) === GENLAYER_CHAIN_ID;
      const accounts = await getAccounts();
      setState((prev) => ({
        ...prev,
        chainId,
        address: accounts[0] || null,
        isConnected: accounts.length > 0,
        isOnCorrectNetwork: correctNetwork,
      }));
      refreshClient();
    };

    const handleDisconnect = () => {
      setState((prev) => ({ ...prev, address: null, isConnected: false }));
      refreshClient();
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);
    provider.on("disconnect", handleDisconnect);

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
      provider.removeListener("disconnect", handleDisconnect);
    };
  }, [state.selectedWalletRdns]);

  const connectWallet = useCallback(async (walletDetail?: EIP6963ProviderDetail) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      if (walletDetail) applySelection(walletDetail);
      
      const address = await connectMetaMask();
      const chainId = await getCurrentChainId();
      const correctNetwork = await isOnGenLayerNetwork();

      if (typeof window !== "undefined") {
        localStorage.removeItem(DISCONNECT_FLAG);
      }

      setState((prev) => ({
        ...prev,
        address,
        chainId,
        isConnected: true,
        isLoading: false,
        isOnCorrectNetwork: correctNetwork,
        selectedWalletRdns: walletDetail?.info.rdns ?? prev.selectedWalletRdns,
      }));
      
      refreshClient();
      return address;
    } catch (err: any) {
      setState((prev) => ({ ...prev, isLoading: false, error: err.message || "Failed to connect" }));
      throw err;
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try { await revokePermissions(); } catch {}
    applySelection(null);
    if (typeof window !== "undefined") {
      localStorage.setItem(DISCONNECT_FLAG, "true");
    }
    setState((prev) => ({ ...prev, address: null, isConnected: false, selectedWalletRdns: null }));
    refreshClient();
  }, []);

  const switchWalletAccount = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const newAddress = await switchAccount();
      const chainId = await getCurrentChainId();
      const correctNetwork = await isOnGenLayerNetwork();
      
      if (typeof window !== "undefined") {
        localStorage.removeItem(DISCONNECT_FLAG);
      }
      setState((prev) => ({
        ...prev,
        address: newAddress,
        chainId,
        isConnected: true,
        isLoading: false,
        isOnCorrectNetwork: correctNetwork,
      }));
      refreshClient();
      return newAddress;
    } catch (err: any) {
      setState((prev) => ({ ...prev, isLoading: false, error: err.message || "Failed to switch account" }));
      throw err;
    }
  }, []);

  const clearError = useCallback(() => setState((prev) => ({ ...prev, error: null })), []);

  return (
    <WalletContext.Provider value={{ ...state, connectWallet, disconnectWallet, switchWalletAccount, clearError }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
