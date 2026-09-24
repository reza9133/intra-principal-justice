import { useState } from 'react';
import { Proposal, Agent, TransactionStatus } from '../types';
import { ObjectionForm } from './ObjectionForm';

interface Props {
  proposals: Proposal[];
  agents: Agent[];
  onObjectToProposal: (proposalId: number, objectorId: string, reason: string) => Promise<void>;
  status: TransactionStatus;
}

export function ProposalList({ proposals, agents, onObjectToProposal, status }: Props) {
  const [activeObjection, setActiveObjection] = useState<number | null>(null);

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-800 border border-green-300 rounded-full text-xs font-bold uppercase tracking-wider">Approved</span>;
      case 'locked':
        return <span className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-300 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></span> Locked (In Court)</span>;
      case 'blocked':
        return <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-xs font-bold uppercase tracking-wider">Blocked</span>;
      case 'escalated':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded-full text-xs font-bold uppercase tracking-wider">Escalated</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-wider">{s}</span>;
    }
  };

  const getStatusBorder = (s: string) => {
    switch (s) {
      case 'pending': return 'border-l-4 border-court-pending';
      case 'approved': return 'border-l-4 border-court-emerald';
      case 'locked': return 'border-l-4 border-orange-500';
      case 'blocked': return 'border-l-4 border-court-danger';
      case 'escalated': return 'border-l-4 border-court-purple';
      default: return 'border-l-4 border-gray-300';
    }
  };

  if (proposals.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
        No proposals have been submitted yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {proposals.map(proposal => {
        const agent = agents.find(a => a.agent_id === proposal.proposer_agent);
        return (
          <div key={proposal.id} className={`glass-card p-6 bg-white ${getStatusBorder(proposal.status)}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-gray-900">{proposal.proposer_agent}</span>
                  {agent && (
                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full border border-gray-200">
                      {agent.role}
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-gray-400">Proposal #{proposal.id}</div>
              </div>
              <div>{getStatusBadge(proposal.status)}</div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-2 text-sm text-gray-800 font-medium">
              {proposal.action_description}
            </div>

            {proposal.reasoning && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-800 italic">
                💡 {proposal.reasoning}
              </div>
            )}
            
            {proposal.status === 'pending' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {activeObjection === proposal.id ? (
                  <div className="space-y-3">
                    <ObjectionForm
                      proposalId={String(proposal.id)}
                      onSubmit={async (pId, reason) => {
                        // The ObjectionForm passes (proposalId, reason)
                        // We need to pick an objector agent
                        const objector = agents.find(a => a.agent_id !== proposal.proposer_agent);
                        if (objector) {
                          await onObjectToProposal(Number(pId), objector.agent_id, reason);
                        }
                        setActiveObjection(null);
                      }}
                      status={status}
                    />
                    <button
                      onClick={() => setActiveObjection(null)}
                      className="text-sm text-gray-400 hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveObjection(proposal.id)}
                    className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center space-x-1"
                  >
                    <span>⚔️</span>
                    <span>File Objection</span>
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
