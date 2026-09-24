import { useState } from 'react';
import { Agent, TransactionStatus } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  agents: Agent[];
  onSubmit: (agentId: string, action: string, reasoning: string) => Promise<void>;
  status: TransactionStatus;
}

export function ProposalForm({ agents, onSubmit, status }: Props) {
  const [agentId, setAgentId] = useState('');
  const [action, setAction] = useState('');
  const [reasoning, setReasoning] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId || !action || !reasoning) return;
    await onSubmit(agentId, action, reasoning);
    setAction('');
    setReasoning('');
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="text-2xl mr-2">📝</span> Submit Proposed Action
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Agent</label>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-court-primary focus:border-court-primary outline-none bg-white text-gray-900"
            required
          >
            <option value="" disabled>Choose an agent...</option>
            {agents.map(a => (
              <option key={a.agent_id} value={a.agent_id}>{a.agent_id} ({a.role})</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Action</label>
          <textarea
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-court-primary focus:border-court-primary outline-none resize-none h-24"
            placeholder="Describe the action the agent intends to take..."
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
            className="w-full py-3 bg-court-primary hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex justify-center items-center space-x-2"
          >
            <span>Submit Proposal</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
}
