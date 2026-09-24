import { useState } from 'react';
import { Agent, TransactionStatus } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  agents: Agent[];
  onRegister: (agentId: string, role: string) => Promise<void>;
  status: TransactionStatus;
}

export function AgentRegistry({ agents, onRegister, status }: Props) {
  const [agentId, setAgentId] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId || !role) return;
    await onRegister(agentId, role);
    setAgentId('');
    setRole('');
  };

  const getRoleColor = (roleStr: string) => {
    const r = roleStr.toLowerCase();
    if (r.includes('treasury') || r.includes('finance')) return 'border-court-emerald';
    if (r.includes('legal') || r.includes('compliance')) return 'border-court-primary';
    if (r.includes('hr') || r.includes('people')) return 'border-court-purple';
    return 'border-court-gold';
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-2">🤖</span> Register New Agent
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent ID</label>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-court-primary focus:border-court-primary outline-none"
                placeholder="e.g. TreasuryBot-alpha"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-court-primary focus:border-court-primary outline-none"
                placeholder="e.g. Treasury Management"
                required
              />
            </div>
          </div>
          
          {status !== 'idle' ? (
            <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-center">
              <LoadingSpinner status={status} />
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-3 bg-court-primary hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Register Agent
            </button>
          )}
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Active Agents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
              No agents registered yet.
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.agent_id} className={`glass-card p-5 border-t-4 ${getRoleColor(agent.role)}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900">{agent.agent_id}</h4>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                    {agent.role}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
