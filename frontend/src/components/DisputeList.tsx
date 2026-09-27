import { Dispute, Proposal, Objection, Agent } from '../types';
import { VerdictCard } from './VerdictCard';

interface Props {
  disputes: Dispute[];
  proposals: Proposal[];
  objectionsByProposal: Record<number, Objection[]>;
  agents: Agent[];
}

export function DisputeList({ disputes, proposals, objectionsByProposal, agents }: Props) {
  if (disputes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
        No disputes have been resolved yet. A proposal only reaches the court once it gets an
        objection and its objection window closes.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {disputes.map((dispute) => {
        const proposal = proposals.find((p) => p.id === dispute.proposal_id);
        const agent = proposal
          ? agents.find((a) => a.address.toLowerCase() === proposal.proposer.toLowerCase())
          : null;
        const objections = objectionsByProposal[dispute.proposal_id] || [];

        return (
          <div key={dispute.id} className="glass-card overflow-hidden bg-white">
            <div className="bg-court-dark text-white px-6 py-3 flex justify-between items-center">
              <span className="font-bold flex items-center space-x-2">
                <span>⚖️</span>
                <span>Case #{dispute.id}</span>
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Proposal #{dispute.proposal_id} &middot; constitution v{dispute.constitution_version}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              <div className="p-6 bg-slate-50/50">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">The Case</h4>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Proposer</span>
                    <div className="bg-white p-3 border border-gray-200 rounded-lg flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {proposal?.proposer_handle || 'Unknown'}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 border border-gray-200">
                        {agent?.role || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Proposed Action</span>
                    <div className="bg-white p-3 border border-gray-200 rounded-lg text-sm text-gray-800">
                      {proposal?.action_description || 'Unknown action'}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      {objections.length} Objection{objections.length === 1 ? '' : 's'}
                    </span>
                    <div className="space-y-2">
                      {objections.map((o) => (
                        <div
                          key={o.id}
                          className="bg-red-50 p-3 border border-red-100 rounded-lg text-sm text-red-900 border-l-4 border-l-red-500"
                        >
                          <span className="font-bold">{o.objector_handle}</span>: {o.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">The Verdict</h4>
                <VerdictCard dispute={dispute} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
