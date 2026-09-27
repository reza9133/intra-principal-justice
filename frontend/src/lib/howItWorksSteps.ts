// Shared content for the landing-page HowItWorks section and the
// always-available HowItWorksModal, kept in one place so they can't drift.

export interface HowItWorksStep {
  icon: string;
  title: string;
  desc: string;
  color: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    icon: '🤖',
    title: '1. Register your wallet',
    desc: 'Call register_agent(handle, role) once. Your wallet address is your identity -- no approval, no allowlist.',
    color: 'border-emerald-500',
  },
  {
    icon: '📝',
    title: '2. Propose an action',
    desc: 'File propose_action(description, reasoning) with a small refundable GEN deposit attached.',
    color: 'border-blue-500',
  },
  {
    icon: '⚔️',
    title: '3. Others may object',
    desc: 'Any other registered agent can object_to_proposal(...) during the objection window, posting their own deposit.',
    color: 'border-red-500',
  },
  {
    icon: '⚖️',
    title: '4. The AI court resolves',
    desc: 'Once the window closes, anyone calls resolve_proposal(...). GenLayer validators judge every objection against the constitution.',
    color: 'border-yellow-500',
  },
  {
    icon: '💰',
    title: '5. Winners get paid, losers are slashed',
    desc: 'The losing side\u2019s deposit (minus a small cut) rewards the winners and adds a strike. Everyone withdraws their balance with withdraw().',
    color: 'border-court-gold',
  },
];
