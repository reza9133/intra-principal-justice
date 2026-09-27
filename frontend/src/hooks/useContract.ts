// =============================================================================
// useContract -- Permissionless AI Court (v3) contract interaction
// Deposits are exact GEN amounts read from get_config(); propose_action and
// object_to_proposal are payable and must attach them as tx value.
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { readContract, writeContract, CONTRACT_ADDRESS } from '../lib/genlayer';
import {
  Agent,
  Proposal,
  Objection,
  Dispute,
  ContractConfig,
  ContractStats,
  TransactionStatus,
} from '../types';

const PAGE_SIZE = 50; // matches MAX_PAGE in the contract

export function useContract(myAddress?: string | null) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [objectionsByProposal, setObjectionsByProposal] = useState<
    Record<number, Objection[]>
  >({});
  const [constitution, setConstitution] = useState<string>('');
  const [config, setConfig] = useState<ContractConfig | null>(null);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [owner, setOwner] = useState<string>('');
  const [claimable, setClaimable] = useState<number>(0);
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [txError, setTxError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const myAgent =
    myAddress != null
      ? agents.find((a) => a.address.toLowerCase() === myAddress.toLowerCase()) ??
        null
      : null;

  // -------------------------------------------------------------------------
  // Fetch all contract state from the chain
  // -------------------------------------------------------------------------

  const fetchAll = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return;

    setIsLoading(true);
    try {
      const [
        constResult,
        configResult,
        statsResult,
        ownerResult,
        agentsResult,
        proposalsResult,
      ] = await Promise.allSettled([
        readContract<string>('get_constitution'),
        readContract<ContractConfig>('get_config'),
        readContract<ContractStats>('get_stats'),
        readContract<string>('get_owner'),
        readContract<Agent[]>('get_agents', [0, PAGE_SIZE]),
        readContract<Proposal[]>('get_proposals', [0, PAGE_SIZE]),
      ]);

      if (constResult.status === 'fulfilled' && constResult.value != null) {
        setConstitution(String(constResult.value));
      }
      if (configResult.status === 'fulfilled' && configResult.value) {
        setConfig(configResult.value);
      }
      if (statsResult.status === 'fulfilled' && statsResult.value) {
        setStats(statsResult.value);
      }
      if (ownerResult.status === 'fulfilled' && ownerResult.value != null) {
        setOwner(String(ownerResult.value));
      }
      if (agentsResult.status === 'fulfilled' && Array.isArray(agentsResult.value)) {
        setAgents(agentsResult.value);
      }

      let fetchedProposals: Proposal[] = [];
      if (
        proposalsResult.status === 'fulfilled' &&
        Array.isArray(proposalsResult.value)
      ) {
        fetchedProposals = proposalsResult.value;
        // newest first for display
        setProposals([...fetchedProposals].reverse());
      }

      // Disputes and objections aren't paginated globally by the contract --
      // pull one dispute per resolved proposal, and objections per proposal.
      const disputeIds = Array.from(
        new Set(
          fetchedProposals
            .map((p) => p.dispute_id)
            .filter((id) => id > 0),
        ),
      );
      const [disputeResults, objectionResults] = await Promise.all([
        Promise.allSettled(
          disputeIds.map((id) => readContract<Dispute>('get_dispute', [id])),
        ),
        Promise.allSettled(
          fetchedProposals.map((p) =>
            readContract<Objection[]>('get_objections_for', [p.id]),
          ),
        ),
      ]);

      const resolvedDisputes = disputeResults
        .filter((r): r is PromiseFulfilledResult<Dispute> => r.status === 'fulfilled')
        .map((r) => r.value);
      setDisputes(resolvedDisputes.sort((a, b) => b.id - a.id));

      const objMap: Record<number, Objection[]> = {};
      objectionResults.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          objMap[fetchedProposals[i].id] = r.value;
        }
      });
      setObjectionsByProposal(objMap);

      if (myAddress) {
        try {
          const bal = await readContract<number>('get_claimable', [myAddress]);
          setClaimable(Number(bal) || 0);
        } catch {
          setClaimable(0);
        }
      } else {
        setClaimable(0);
      }
    } catch (err) {
      console.error('[useContract] Failed to fetch:', err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myAddress]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // -------------------------------------------------------------------------
  // Write transaction wrapper
  // -------------------------------------------------------------------------

  const executeTx = async (
    functionName: string,
    args: unknown[],
    value: bigint = 0n,
  ): Promise<void> => {
    setStatus('submitting');
    setTxError(null);

    try {
      setStatus('deliberating');
      const result = await writeContract(functionName, args, value);
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
  // Contract methods (identity is always the connected wallet; no agent_id)
  // -------------------------------------------------------------------------

  const registerAgent = async (handle: string, role: string) => {
    await executeTx('register_agent', [handle, role]);
  };

  const updateConstitution = async (newText: string) => {
    await executeTx('update_constitution', [newText]);
  };

  const proposeAction = async (action: string, reasoning: string) => {
    if (!config) throw new Error('Contract config not loaded yet');
    await executeTx(
      'propose_action',
      [action, reasoning],
      BigInt(config.proposal_deposit),
    );
  };

  const objectToProposal = async (proposalId: number, reason: string) => {
    if (!config) throw new Error('Contract config not loaded yet');
    await executeTx(
      'object_to_proposal',
      [proposalId, reason],
      BigInt(config.objection_deposit),
    );
  };

  const resolveProposal = async (proposalId: number) => {
    await executeTx('resolve_proposal', [proposalId]);
  };

  const withdraw = async () => {
    await executeTx('withdraw', []);
  };

  return {
    agents,
    proposals,
    disputes,
    objectionsByProposal,
    constitution,
    config,
    stats,
    owner,
    claimable,
    myAgent,
    status,
    txError,
    isLoading,
    fetchAll,
    registerAgent,
    updateConstitution,
    proposeAction,
    objectToProposal,
    resolveProposal,
    withdraw,
  };
}
