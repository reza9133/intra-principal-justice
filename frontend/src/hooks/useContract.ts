// =============================================================================
// useContract — Real GenLayer Contract Interaction (v1.x SDK)
// Fetches live data from the deployed Intelligent Contract.
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { readContract, writeContract, CONTRACT_ADDRESS } from '../lib/genlayer';
import {
  Agent,
  Proposal,
  Dispute,
  TransactionStatus,
  ContractStats,
} from '../types';

export function useContract() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [constitution, setConstitution] = useState<string>('');
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [txError, setTxError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const stats: ContractStats = {
    total_proposals: proposals.length,
    total_disputes: disputes.length,
    active_agents: agents.length,
  };

  // -------------------------------------------------------------------------
  // Fetch all contract state from the chain
  // -------------------------------------------------------------------------

  const fetchAll = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return;

    setIsLoading(true);
    try {
      const [constResult, agentsResult, proposalsResult, disputesResult] =
        await Promise.allSettled([
          readContract<string>('get_constitution'),
          readContract<Agent[]>('get_all_agents'),
          readContract<Proposal[]>('get_all_proposals'),
          readContract<Dispute[]>('get_all_disputes'),
        ]);

      if (constResult.status === 'fulfilled' && constResult.value != null) {
        setConstitution(String(constResult.value));
      }
      if (
        agentsResult.status === 'fulfilled' &&
        Array.isArray(agentsResult.value)
      ) {
        setAgents(agentsResult.value);
      }
      if (
        proposalsResult.status === 'fulfilled' &&
        Array.isArray(proposalsResult.value)
      ) {
        setProposals(proposalsResult.value);
      }
      if (
        disputesResult.status === 'fulfilled' &&
        Array.isArray(disputesResult.value)
      ) {
        setDisputes(disputesResult.value);
      }
    } catch (err) {
      console.error('[useContract] Failed to fetch:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // -------------------------------------------------------------------------
  // Write transaction wrapper
  // -------------------------------------------------------------------------

  const executeTx = async (
    functionName: string,
    args: unknown[],
  ): Promise<void> => {
    setStatus('submitting');
    setTxError(null);

    try {
      setStatus('deliberating');
      const result = await writeContract(functionName, args);
      console.info('[useContract] TX finalized:', result);

      setStatus('success');
      await fetchAll();
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Transaction failed';
      console.error('[useContract] TX error:', msg);
      setTxError(msg);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  // -------------------------------------------------------------------------
  // Contract methods
  // -------------------------------------------------------------------------

  const registerAgent = async (agentId: string, role: string) => {
    await executeTx('register_agent', [agentId, role]);
  };

  const updateConstitution = async (newText: string) => {
    await executeTx('update_constitution', [newText]);
  };

  const proposeAction = async (
    agentId: string,
    action: string,
    reasoning: string,
  ) => {
    await executeTx('propose_action', [agentId, action, reasoning]);
  };

  const objectToProposal = async (
    proposalId: number,
    objectorId: string,
    reason: string,
  ) => {
    await executeTx('object_to_proposal', [proposalId, objectorId, reason]);
  };

  return {
    agents,
    proposals,
    disputes,
    constitution,
    stats,
    status,
    txError,
    isLoading,
    fetchAll,
    registerAgent,
    updateConstitution,
    proposeAction,
    objectToProposal,
  };
}
