import type { EIP6963ProviderDetail } from "./eip6963";

interface WalletPickerListProps {
  wallets: EIP6963ProviderDetail[];
  onSelect: (wallet: EIP6963ProviderDetail) => void;
  onFallbackConnect: () => void;
  disabled?: boolean;
}

export function WalletPickerList({ wallets, onSelect, onFallbackConnect, disabled }: WalletPickerListProps) {
  return (
    <div className="space-y-3">
      {wallets.length > 0 ? (
        wallets.map((w) => (
          <button
            key={w.info.uuid}
            disabled={disabled}
            onClick={() => onSelect(w)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-court-primary rounded-xl transition-all disabled:opacity-50 group"
          >
            <div className="flex items-center space-x-3">
              <img src={w.info.icon} alt={w.info.name} className="w-8 h-8 rounded-md" />
              <span className="font-semibold text-gray-800 group-hover:text-court-primary">{w.info.name}</span>
            </div>
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-court-primary flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-court-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))
      ) : (
        <button
          disabled={disabled}
          onClick={onFallbackConnect}
          className="w-full flex items-center p-4 bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-court-primary rounded-xl transition-all disabled:opacity-50 group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 group-hover:text-court-primary">Connect Fallback Wallet</span>
          </div>
        </button>
      )}
    </div>
  );
}
