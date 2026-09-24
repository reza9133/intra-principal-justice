export interface Proposal {
  id: number;
  proposer_agent: string;
  action_description: string;
  reasoning: string;
  status: 'pending' | 'approved' | 'locked' | 'blocked' | 'escalated';
  created_at: string;
}

export interface Dispute {
  id: number;
  proposal_id: number;
  objector_agent: string;
  objection_reason: string;
  verdict_decision: 'allow_action' | 'block_action' | 'escalate_to_human';
  verdict_confidence: number;
  verdict_reasoning: string;
  resolved: boolean;
}

export interface Agent {
  agent_id: string;
  role: string;
}

export interface ContractStats {
  total_proposals: number;
  total_disputes: number;
  active_agents: number;
}

export type TransactionStatus = 'idle' | 'submitting' | 'deliberating' | 'success' | 'error';
