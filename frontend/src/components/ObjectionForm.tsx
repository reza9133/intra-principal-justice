import { useState } from 'react';
import { ContractConfig, TransactionStatus } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { formatGen } from '../lib/format';

interface Props {
  proposalId: number;
  config: ContractConfig | null;
  onSubmit: (proposalId: number, reason: string) => Promise<void>;
  status: TransactionStatus;
}

export function ObjectionForm({ proposalId, config, onSubmit, status }: Props) {
  const [reason, setReason] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    await onSubmit(proposalId, reason);
    setReason('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm font-medium text-court-danger hover:text-red-700 flex items-center space-x-1"
      >
        <span>⚔️ Raise Objection {config ? `(${formatGen(config.objection_deposit)} GEN)` : ''}</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-red-50/50 p-4 rounded-xl border border-red-100">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-bold text-red-800">
          State your objection -- this is filed under your own wallet
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-24 bg-white text-gray-900"
        placeholder="Why does this violate the constitution?"
        maxLength={2000}
        required
      />

      {status !== 'idle' ? (
        <div className="flex justify-center p-2">
          <LoadingSpinner status={status} />
        </div>
      ) : (
        <button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-court-gold to-court-danger text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center shadow-md"
        >
          ⚖️ Post {config ? `${formatGen(config.objection_deposit)} GEN` : ''} & Object
        </button>
      )}
    </form>
  );
}
