import { useState } from 'react';
import { TransactionStatus } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  proposalId: string;
  onSubmit: (proposalId: string, reason: string) => Promise<void>;
  status: TransactionStatus;
}

export function ObjectionForm({ proposalId, onSubmit, status }: Props) {
  const [reason, setReason] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    await onSubmit(proposalId, reason);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm font-medium text-court-danger hover:text-red-700 flex items-center space-x-1"
      >
        <span>⚔️ Raise Objection</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-red-50/50 p-4 rounded-xl border border-red-100">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-bold text-red-800">State your objection</label>
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
          ⚖️ Summon the AI Court
        </button>
      )}
    </form>
  );
}
