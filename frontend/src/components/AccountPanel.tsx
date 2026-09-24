import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { WalletPickerList } from '../lib/wallet/WalletPickerList';
import type { EIP6963ProviderDetail } from '../lib/wallet/eip6963';
import { switchToGenLayerNetwork } from '../lib/wallet/client';

// SVG Icons
const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogOutIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export function AccountPanel() {
  const {
    address,
    isConnected,
    isLoading,
    isOnCorrectNetwork,
    availableWallets,
    error,
    connectWallet,
    disconnectWallet,
    switchWalletAccount,
    clearError
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-wallet-modal', handleOpen);
    return () => window.removeEventListener('open-wallet-modal', handleOpen);
  }, []);

  const handleConnect = async (walletDetail?: EIP6963ProviderDetail) => {
    try {
      await connectWallet(walletDetail);
      setIsOpen(false);
    } catch (err) {
      // Error is handled in context
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setIsOpen(false);
  };

  const handleSwitchAccount = async () => {
    setIsSwitching(true);
    try {
      await switchWalletAccount();
    } catch {
      // Error handled
    } finally {
      setIsSwitching(false);
    }
  };

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    try {
      await switchToGenLayerNetwork();
    } catch {
    } finally {
      setIsSwitching(false);
    }
  };

  const renderModal = () => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-gray-100"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {isConnected ? 'Wallet Details' : 'Connect to GenLayer'}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              {isConnected ? 'Your connected Web3 wallet information' : 'Select a wallet to interact with the AI Court'}
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex justify-between items-start shadow-sm">
                <div className="flex space-x-2">
                  <span className="mt-0.5"><AlertIcon /></span>
                  <div>
                    <span className="font-bold block mb-1">Connection Error</span>
                    <span>{error}</span>
                  </div>
                </div>
                <button onClick={clearError} className="text-red-500 hover:text-red-700 font-bold ml-4">✕</button>
              </div>
            )}

            {isConnected && address ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
                  <p className="text-sm text-gray-500">Your Address</p>
                  <code className="text-sm font-mono break-all text-gray-900 block p-2 bg-gray-50 rounded border border-gray-100">
                    {address}
                  </code>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
                  <p className="text-sm text-gray-500">Network Status</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isOnCorrectNetwork ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`} />
                    <span className="text-sm font-medium text-gray-800">
                      {isOnCorrectNetwork ? 'Connected to GenLayer' : 'Wrong Network'}
                    </span>
                  </div>
                </div>

                {!isOnCorrectNetwork && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                    <div className="flex items-start space-x-2 text-yellow-800 text-sm mb-3">
                      <AlertIcon />
                      <p>You're not on the GenLayer network. Please switch to interact with contracts.</p>
                    </div>
                    <button
                      onClick={handleSwitchNetwork}
                      disabled={isSwitching}
                      className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg"
                    >
                      {isSwitching ? 'Switching...' : 'Switch Network'}
                    </button>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                  <button
                    onClick={handleSwitchAccount}
                    disabled={isSwitching}
                    className="w-full py-3 flex items-center justify-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors shadow-sm"
                  >
                    <UserIcon />
                    <span>{isSwitching ? 'Switching...' : 'Switch Account'}</span>
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="w-full py-3 flex items-center justify-center space-x-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-medium rounded-xl transition-colors shadow-sm"
                  >
                    <LogOutIcon />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <WalletPickerList
                  wallets={availableWallets}
                  onSelect={handleConnect}
                  onFallbackConnect={() => handleConnect()}
                  disabled={isLoading}
                />
                
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Connecting a wallet lets you interact with Intelligent Contracts on GenLayer. 
                    If you don't see your wallet, ensure the extension is installed and unlocked.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <>
      {!isConnected ? (
        <button
          onClick={() => setIsOpen(true)}
          disabled={isLoading}
          className="bg-gradient-to-r from-court-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center space-x-2 disabled:opacity-75"
        >
          <UserIcon />
          <span>{isLoading ? 'Loading...' : 'Connect Wallet'}</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-xl font-medium transition-all shadow-sm flex items-center space-x-3 relative"
        >
          {!isOnCorrectNetwork && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-500 animate-pulse border-2 border-white" />
          )}
          <div className="flex items-center space-x-2 text-court-primary">
            <UserIcon />
            <span className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center space-x-1.5">
            <div className={`w-2 h-2 rounded-full ${isOnCorrectNetwork ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]' : 'bg-yellow-500'}`} />
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              {isOnCorrectNetwork ? 'Studionet' : 'Network'}
            </span>
          </div>
        </button>
      )}

      <AnimatePresence>
        {isOpen && renderModal()}
      </AnimatePresence>
    </>
  );
}
