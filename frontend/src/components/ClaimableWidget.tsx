import { TransactionStatus } from '../types';
import { formatGen } from '../lib/format';

interface Props {
  claimable: number;
  onWithdraw: () => Promise<void>;
  status: TransactionStatus;
}

export function ClaimableWidget({ claimable, onWithdraw, status }: Props) {
  if (!claimable) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 bg-white shadow-xl border border-green-200 rounded-2xl p-4 flex items-center space-x-4">
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider">Claimable</div>
        <div className="font-bold text-green-700">{formatGen(claimable)} GEN</div>
      </div>
      <button
        onClick={onWithdraw}
        disabled={status !== 'idle'}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl disabled:opacity-50"
      >
        {status !== 'idle' ? 'Withdrawing...' : 'Withdraw'}
      </button>
    </div>
  );
}
