import { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HowItWorks } from './components/HowItWorks';
import { ConstitutionPanel } from './components/ConstitutionPanel';
import { AgentRegistry } from './components/AgentRegistry';
import { ProposalForm } from './components/ProposalForm';
import { ProposalList } from './components/ProposalList';
import { DisputeList } from './components/DisputeList';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';

function App() {
  const [activeTab, setActiveTab] = useState<'agents' | 'proposals' | 'court'>('agents');
  
  const { isConnected } = useWallet();
  
  const {
    constitution,
    agents,
    proposals,
    disputes,
    stats,
    updateConstitution,
    registerAgent,
    proposeAction,
    objectToProposal,
    status
  } = useContract();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-court-bg selection:bg-court-primary selection:text-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-white border-b border-gray-200 py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              AI Agents. <span className="text-gradient">Constitutional Guardrails.</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Empower AI agents to act on behalf of your organization, constrained by natural language rules enforced by GenLayer's decentralized AI validators.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-b-4 border-b-court-primary">
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats?.active_agents || agents.length}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Agents</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-b-4 border-b-court-emerald">
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats?.total_proposals || proposals.length}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Proposals Made</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-b-4 border-b-court-danger">
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats?.total_disputes || disputes.length}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Court Cases</div>
              </div>
            </div>
          </div>
        </section>

        {!isConnected ? (
          <section className="bg-court-bg">
            <HowItWorks />
            <div className="text-center pb-20">
              <button
                onClick={() => window.dispatchEvent(new Event('open-wallet-modal'))}
                className="bg-court-primary hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                Connect Wallet to Enter
              </button>
            </div>
          </section>
        ) : (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <ConstitutionPanel 
              currentText={constitution} 
              onUpdate={updateConstitution}
              status={status}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200 bg-gray-50/50">
                <button
                  className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 ${
                    activeTab === 'agents' 
                      ? 'border-court-primary text-court-primary bg-white' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('agents')}
                >
                  🤖 Agent Registry
                </button>
                <button
                  className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 ${
                    activeTab === 'proposals' 
                      ? 'border-court-primary text-court-primary bg-white' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('proposals')}
                >
                  📝 Proposals
                </button>
                <button
                  className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 ${
                    activeTab === 'court' 
                      ? 'border-court-primary text-court-primary bg-white' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('court')}
                >
                  ⚖️ AI Court
                </button>
              </div>

              <div className="p-6 bg-court-bg min-h-[500px]">
                {activeTab === 'agents' && (
                  <AgentRegistry 
                    agents={agents} 
                    onRegister={registerAgent}
                    status={status}
                  />
                )}
                
                {activeTab === 'proposals' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                      <ProposalForm 
                        agents={agents} 
                        onSubmit={proposeAction}
                        status={status}
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="mr-2">📋</span> Recent Proposals
                      </h3>
                      <ProposalList 
                        proposals={proposals} 
                        agents={agents}
                        onObjectToProposal={objectToProposal}
                        status={status}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'court' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="mr-2">🏛️</span> Supreme AI Court Docket
                    </h3>
                    <DisputeList 
                      disputes={disputes} 
                      proposals={proposals} 
                      agents={agents} 
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
