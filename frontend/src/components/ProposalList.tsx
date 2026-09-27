import { useState } from 'react';
import { Proposal, Objection, Agent, ContractConfig, TransactionStatus } from '../types';
import { ObjectionForm } from './ObjectionForm';
import { formatGen, formatCountdown, shortAddr } from '../lib/format';

interface Props {
  proposals: Proposal[];
  objectionsByProposal: Record<number, Objection[]>;
  agents: Agent[];
  myAddress: string | null;
  myAgent: Agent | null;
  config: ContractConfig | null;
  onObjectToProposal: (proposalId: number, reason: string) => Promise<void>;
  onResolveProposal: (proposalId: number) => Promise<void>;
  status: TransactionStatus;
}

const STATUS_STYLES: Record<string, { badge: string; border: string; label: string }> = {
  open: { badge: 'bg-yellow-100 text-yellow-800 border-yellow-300', border: 'border-court-pending', label: 'Open' },
  judging: { badge: 'bg-orange-100 text-orange-800 border-orange-300 animate-pulse', border: 'border-orange-500', label: 'In Court' },
  approved: { badge: 'bg-green-100 text-green-800 border-green-300', border: 'border-court-emerald', label: 'Approved' },
  blocked: { badge: 'bg-red-100 text-red-800 border-red-300', border: 'border-court-danger', label: 'Blocked' },
  inconclusive: { badge: 'bg-purple-100 text-purple-800 border-purple-300', border: 'border-court-purple', label: 'Inconclusive' },
};

export function ProposalList({
  proposals,
  objectionsByProposal,
  agents,
  myAddress,
  myAgent,
  config,
  onObjectToProposal,
  onResolveProposal,
  status,
}: Props) {
  const [activeObjection, setActiveObjection] = useState<number | null>(null);
  const now = Math.floor(Date.now() / 1000);

  if (proposals.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
        No proposals have been submitted yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {proposals.map((proposal) => {
        const agent = agents.find(
          (a) => a.address.toLowerCase() === proposal.proposer.toLowerCase(),
        );
        const objections = objectionsByProposal[proposal.id] || [];
        const style = STATUS_STYLES[proposal.status] || {
          badge: 'bg-gray-100 text-gray-800 border-gray-300',
          border: 'border-gray-300',
          label: proposal.status,
        };
        const isMine = myAddress?.toLowerCase() === proposal.proposer.toLowerCase();
        const windowClosed = now >= proposal.deadline;
        const canObject =
          proposal.status === 'open' &&
          !windowClosed &&
          myAgent &&
          !myAgent.banned &&
          !isMine &&
          !objections.some((o) => o.objector.toLowerCase() === myAddress?.toLowerCase()) &&
          objections.length < (config?.max_objections_per_proposal ?? 5);
        const canResolve = proposal.status === 'open' && windowClosed;

        return (
          <div key={proposal.id} className={`glass-card p-6 bg-white border-l-4 ${style.border}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-gray-900">{proposal.proposer_handle}</span>
                  {agent && (
                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full border border-gray-200">
                      {agent.role}
                    </span>
                  )}
                  {isMine && (
                    <span className="text-xs text-court-primary font-semibold">(you)</span>
                  )}
                </div>
                <div className="text-xs font-mono text-gray-400">
                  Proposal #{proposal.id} &middot; {shortAddr(proposal.proposer)} &middot; deposit{' '}
                  {formatGen(proposal.deposit)} GEN
                </div>
              </div>
              <span className={`px-3 py-1 border rounded-full text-xs font-bold uppercase tracking-wider ${style.badge}`}>
                {style.label}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-2 text-sm text-gray-800 font-medium">
              {proposal.action_description}
            </div>

            {proposal.reasoning && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-800 italic">
                💡 {proposal.reasoning}
              </div>
            )}

            {objections.length > 0 && (
              <div className="mb-4 space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Objections ({objections.length})
                </span>
                {objections.map((o) => (
                  <div
                    key={o.id}
                    className="bg-red-50/70 border border-red-100 rounded-lg p-3 text-xs text-red-900"
                  >
                    <span className="font-bold">{o.objector_handle}</span>: {o.reason}
                    {o.outcome !== 'pending' && (
                      <span className="ml-2 uppercase font-bold text-[10px] tracking-wider text-gray-500">
                        [{o.outcome}]
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {proposal.status === 'open' && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-gray-400">
                  Objection window {windowClosed ? 'closed' : formatCountdown(proposal.deadline)}
                </span>

                <div className="flex items-center gap-4">
                  {activeObjection === proposal.id ? (
                    <div className="w-full sm:w-96">
                      <ObjectionForm
                        proposalId={proposal.id}
                        config={config}
                        onSubmit={async (pId, reason) => {
                          await onObjectToProposal(pId, reason);
                          setActiveObjection(null);
                        }}
                        status={status}
                      />
                    </div>
                  ) : (
                    canObject && (
                      <button
                        onClick={() => setActiveObjection(proposal.id)}
                        className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center space-x-1"
                      >
                        <span>⚔️</span>
                        <span>File Objection</span>
                      </button>
                    )
                  )}

                  {canResolve && (
                    <button
                      onClick={() => onResolveProposal(proposal.id)}
                      className="text-sm px-3 py-1.5 bg-court-dark text-white rounded-lg font-medium hover:opacity-90"
                    >
                      {objections.length === 0 ? 'Finalize (no objections)' : 'Resolve in Court'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
