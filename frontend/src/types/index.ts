// Mirrors the dicts returned by contracts/intra_principal_justice.py views.
// The agent's identity IS its wallet address -- there is no separate agent_id.

export type ProposalStatus =
  | 'open'
  | 'judging'
  | 'approved'
  | 'blocked'
  | 'inconclusive';

export type Decision = 'allow_action' | 'block_action' | 'inconclusive';

export type ObjectionOutcome = 'pending' | 'rejected' | 'upheld' | 'refunded';

export interface Agent {
  address: string;
  handle: string;
  role: string;
  registered_at: number;
  strikes: number;
  banned: boolean;
  open_proposals: number;
  reputation: number;
}

export interface Proposal {
  id: number;
  proposer: string;
  proposer_handle: string;
  action_description: string;
  reasoning: string;
  deposit: number;
  status: ProposalStatus;
  created_at: number;
  deadline: number; // unix seconds; objections close / resolve_proposal opens
  constitution_version: number;
  objection_count: number;
  dispute_id: number; // 0 = never judged
}

export interface Objection {
  id: number;
  proposal_id: number;
  objector: string;
  objector_handle: string;
  reason: string;
  deposit: number;
  outcome: ObjectionOutcome;
}

export interface Dispute {
  id: number;
  proposal_id: number;
  decision: Decision;
  confidence: number;
  reasoning: string;
  constitution_version: number;
  objection_count: number;
  resolved_at: number;
}

export interface ContractConfig {
  proposal_deposit: number; // wei of GEN, exact amount required by propose_action
  objection_deposit: number; // wei of GEN, exact amount required by object_to_proposal
  objection_window: number; // seconds
  constitution_version: number;
  max_open_per_address: number;
  max_objections_per_proposal: number;
  max_strikes: number;
  min_confidence: number;
  slash_cut_bps: number;
  inconclusive_fee_bps: number;
}

export interface ContractStats {
  agents: number;
  proposals: number;
  objections: number;
  disputes: number;
  total_bonded: number;
  total_claimable: number;
  reserve: number;
}

export type TransactionStatus =
  | 'idle'
  | 'submitting'
  | 'deliberating'
  | 'success'
  | 'error';
