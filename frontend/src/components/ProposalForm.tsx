import { useState } from 'react';
import { Agent, ContractConfig, TransactionStatus } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { formatGen } from '../lib/format';

interface Props {
  myAgent: Agent | null;
  config: ContractConfig | null;
  onSubmit: (action: string, reasoning: string) => Promise<void>;
  status: TransactionStatus;
}

export function ProposalForm({ myAgent, config, onSubmit, status }: Props) {
  const [action, setAction] = useState('');
  const [reasoning, setReasoning] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action || !reasoning) return;
    await onSubmit(action, reasoning);
    setAction('');
    setReasoning('');
  };

  const blocked = !myAgent || myAgent.banned;
  const atOpenCap = myAgent ? myAgent.open_proposals >= (config?.max_open_per_address ?? 3) : false;

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
        <span className="text-2xl mr-2">📝</span> Submit Proposed Action
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Filed under your own wallet ({myAgent ? myAgent.handle : 'not registered'}). Requires a
        refundable deposit of{' '}
        <strong>{config ? `${formatGen(config.proposal_deposit)} GEN` : '...'}</strong>, returned
        (plus any slashed objector deposits) once the court sides with you.
      </p>

      {!myAgent && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          Register as an agent first, in the Agent Registry tab.
        </div>
      )}
      {myAgent?.banned && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          This wallet is banned and can no longer propose actions.
        </div>
      )}
      {myAgent && !myAgent.banned && atOpenCap && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          You have {myAgent.open_proposals} open proposals already -- the max per wallet is{' '}
          {config?.max_open_per_address ?? 3}. Wait for one to resolve.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Action</label>
          <textarea
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-court-primary focus:border-court-primary outline-none resize-none h-24"
            placeholder="Describe the action the agent intends to take..."
            maxLength={2000}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reasoning</label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-court-primary focus:border-court-primary outline-none resize-none h-20"
            placeholder="Why should this action be allowed? Cite constitution rules..."
            maxLength={2000}
            required
          />
        </div>

        {status !== 'idle' ? (
          <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-center">
            <LoadingSpinner status={status} />
          </div>
        ) : (
          <button
            type="submit"
            disabled={blocked || atOpenCap}
            className="w-full py-3 bg-court-primary hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex justify-center items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Submit Proposal{config ? ` (${formatGen(config.proposal_deposit)} GEN)` : ''}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
}
