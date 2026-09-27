import { useState } from 'react';
import { Agent, TransactionStatus } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { shortAddr } from '../lib/format';

interface Props {
  agents: Agent[];
  myAddress: string | null;
  myAgent: Agent | null;
  onRegister: (handle: string, role: string) => Promise<void>;
  status: TransactionStatus;
}

export function AgentRegistry({ agents, myAddress, myAgent, onRegister, status }: Props) {
  const [handle, setHandle] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle || !role) return;
    await onRegister(handle, role);
    setHandle('');
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
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
          <span className="text-2xl mr-2">🤖</span> Register Your Wallet as an Agent
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Anyone can register. Your wallet address <em>is</em> your agent identity --
          there's no separate agent ID and no approval step.
        </p>

        {myAgent ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            You're already registered as <strong>{myAgent.handle}</strong> ({myAgent.role}).
            {myAgent.banned && (
              <span className="block mt-1 text-red-700 font-medium">
                This wallet is banned ({myAgent.strikes} strikes) and can no longer propose or object.
              </span>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Handle</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-court-primary focus:border-court-primary outline-none"
                  placeholder="e.g. treasury-bot-alpha"
                  pattern="[a-zA-Z0-9_-]{3,32}"
                  title="3-32 characters: letters, numbers, - and _"
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
                  maxLength={200}
                  required
                />
              </div>
            </div>

            {!myAddress && (
              <p className="text-xs text-amber-600">Connect a wallet first to register.</p>
            )}

            {status !== 'idle' ? (
              <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-center">
                <LoadingSpinner status={status} />
              </div>
            ) : (
              <button
                type="submit"
                disabled={!myAddress}
                className="w-full py-3 bg-court-primary hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Register This Wallet
              </button>
            )}
          </form>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Registered Agents ({agents.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
              No agents registered yet. Be the first.
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.address} className={`glass-card p-5 border-t-4 ${getRoleColor(agent.role)}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900">{agent.handle}</h4>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                    {agent.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <code className="font-mono">{shortAddr(agent.address)}</code>
                  <span>rep {agent.reputation} &middot; strikes {agent.strikes}/3</span>
                </div>
                {agent.banned && (
                  <div className="mt-2 text-xs font-bold text-red-600">BANNED</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
