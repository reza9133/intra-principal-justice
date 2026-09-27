# Intra-Principal Justice

A permissionless, public, AI-judged court built as a GenLayer Intelligent
Contract. Any wallet can self-register as an agent, propose actions, file
objections against them, and have disputes resolved by GenLayer's validator
consensus against an on-chain constitution — no admin, no allowlist, no
approval step.

**Stack:** GenLayer Intelligent Contract (Python) · React + Vite + TypeScript
· Tailwind CSS

---

## Table of contents

- [Deployment](#deployment)
- [Architecture](#architecture)
- [How a case works](#how-a-case-works)
- [Verdicts and settlement](#verdicts-and-settlement)
- [Security model](#security-model)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Testing](#testing)
- [Contract reference](#contract-reference)
- [Known limitations](#known-limitations)

---

## Deployment

| Network | Contract address |
|---|---|
| GenLayer Studionet | `0x274130C0D9F938fEf34d9e8253803418F6E4a098` |

The address is preconfigured in `frontend/.env` and `frontend/.env.example`
as `VITE_CONTRACT_ADDRESS`. The frontend's ABI usage
(`hooks/useContract.ts`, `lib/genlayer.ts`, and all components) is written
against the contract in this repository, `contracts/intra_principal_justice.py`.
If you redeploy the contract yourself, update the address in `frontend/.env`
to match.

---

## Architecture

### Self-registration

`register_agent(handle, role)` is open to any wallet. There is no separate
agent ID: identity is always `gl.message.sender_address`, and the call binds
the handle and role to that address in a single transaction. There is no
owner-side registration, approval, or removal.

### Owner scope

The owner's authority is limited to the constitution text:

- `update_constitution(new_text)` — publishes a new version. Proposals
  already filed are judged under the version in force when they were filed,
  so rules can never change retroactively.
- `transfer_ownership` / `accept_ownership` — two-step handover.
- `renounce_ownership` — freezes the constitution permanently.

The owner cannot register or remove agents, pause the contract, resolve
disputes, or touch any balance.

### Economic security

`propose_action` and `object_to_proposal` are `payable` and require an exact
GEN deposit (`get_config()` returns the current amounts). Objections are
collected for a fixed window; once it closes, anyone may call
`resolve_proposal`, and all objections on that proposal are judged together
by GenLayer's validator consensus (`gl.vm.run_nondet_unsafe`). Judging
everything at once — rather than resolving objections as they arrive —
removes any advantage from objection ordering.

All payouts are pull payments: a settled case credits an internal
`claimable` balance, and the party withdraws it with `withdraw()`. Nothing
is pushed automatically.

---

## How a case works

1. Register once: `register_agent(handle, role)`.
2. File a proposal: `propose_action(action_description, reasoning)` with the
   proposal deposit attached.
3. During the objection window, other registered agents may
   `object_to_proposal(proposal_id, objection_reason)` with the objection
   deposit attached. An agent cannot object to its own proposal, and each
   address may object once per proposal.
4. Once the window closes, anyone calls `resolve_proposal(proposal_id)`:
   - No objections → approved automatically, full refund, no court.
   - One or more objections → the constitution, the proposal, and every
     objection are sent to the validator court, which returns a decision,
     a confidence score, and reasoning.
5. Deposits are settled per the outcome (see below) and each party
   withdraws their claimable balance with `withdraw()`.

---

## Verdicts and settlement

| Decision | Trigger | Settlement |
|---|---|---|
| **Approved** | No objections, or the court rules `allow_action` | Proposer receives their deposit back plus the objectors' deposits, minus a slash cut to the reserve. Each objector takes a strike. |
| **Blocked** | The court rules `block_action` | Objectors receive their deposit back plus an equal share of the proposer's deposit, minus a slash cut. The proposer takes a strike. |
| **Inconclusive** | The court rules `inconclusive`, or confidence falls below the minimum threshold | Everyone is refunded minus a small fee. No strikes. |

Slash cuts and fees accumulate in a `reserve` balance that is permanently
locked — no owner or address can withdraw it. An address accumulating three
strikes is banned from proposing or objecting again.

---

## Security model

The contract is written defensively against the standard set of on-chain
and AI-specific attack vectors:

- **Reentrancy / state ordering** — checks-effects-interactions throughout;
  the only outbound transfer is in `withdraw()`, after the claimable balance
  is zeroed. Settlement includes a conservation check (payouts + reserve
  must equal deposits released) that reverts on any mismatch.
- **Front-running** — proposal and objection IDs are sequential and never
  chosen by the caller. Handles, roles, and the constitution version are
  snapshotted into each proposal at filing time, so nothing can be edited
  underneath an open case.
- **Griefing / spam** — deposits are exact and floor-checked at deploy
  time, with a per-address cap on open proposals and a per-proposal cap on
  objections.
- **Prompt injection** — all free-text input passes through `_clean`
  (strips control, zero-width, and bidi-override characters; neutralizes
  angle brackets so user text can never forge an XML-style fence) before
  it is stored or shown to the judge. Oversized input is rejected outright,
  not silently truncated, so what the judge reads is exactly what was
  stored. Validators re-run the same verdict-normalization function as the
  leader rather than trusting its output.
- **Integer safety / DoS** — sized integers (`u32`/`u64`/`u256`) throughout,
  and every paginated view enforces an explicit offset/limit bound.

Full design notes live in the module docstring at the top of
`contracts/intra_principal_justice.py`.

---

## Project structure

```
intra-principal-justice/
├── contracts/
│   └── intra_principal_justice.py     # the Intelligent Contract
├── tests/
│   ├── direct/
│   │   ├── conftest.py
│   │   └── test_intra_principal_justice.py   # 32 tests
│   └── sim/                            # offline stand-in SDK (dev-only)
├── frontend/
│   ├── src/
│   │   ├── components/                 # AgentRegistry, ProposalForm,
│   │   │                                # ObjectionForm, ProposalList,
│   │   │                                # DisputeList, VerdictCard,
│   │   │                                # ConstitutionPanel, ClaimableWidget, ...
│   │   ├── hooks/                      # useWallet, useContract
│   │   ├── lib/
│   │   │   ├── genlayer.ts             # client + read/write helpers
│   │   │   ├── format.ts               # GEN/address/countdown formatting
│   │   │   └── wallet/                 # EIP-6963 wallet discovery
│   │   └── types/                      # types mirroring the contract's views
│   ├── .env                            # VITE_CONTRACT_ADDRESS, RPC, chain ID
│   └── package.json
├── gltest.config.yaml
├── pyproject.toml
└── README.md
```

---

## Getting started

### Prerequisites

- Python 3.11+ and the GenLayer toolchain (`gltest`, `genvm-lint`) for the
  contract.
- Node.js 18+ and npm for the frontend.
- A Web3 wallet (e.g. MetaMask) configured for GenLayer Studionet.

### 1. Deploy or point at the contract

The address above is already wired into the frontend. To deploy your own
instance instead, use GenLayer Studio with these constructor arguments:

```
constitution:       "1. Security always wins. 2. Under-budget travel is approved."
proposal_deposit:   20000000000000000   # 0.02 GEN, in wei
objection_deposit:  10000000000000000   # 0.01 GEN, in wei
objection_window:   3600                # seconds
```

Then update `VITE_CONTRACT_ADDRESS` in `frontend/.env` to your deployment.

### 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Connect a wallet on Studionet, register, and the app is ready to use.

### 3. Build for production

```bash
npm run build
```

---

## Testing

Run the full suite against the real GenLayer SDK:

```bash
pytest tests/direct -v
```

Run against the offline stand-in SDK (no GenVM required — useful for a
quick logic check, not a substitute for the real suite):

```bash
PYTHONPATH=tests/sim python -m pytest -p sim_plugin tests/direct -v
```

Lint before any deployment:

```bash
genvm-lint check contracts/intra_principal_justice.py
```

The 32 tests cover self-registration, exact-deposit enforcement, open-
proposal and objection caps, window boundaries, all three verdict paths
(including rounding/dust handling), slashing and strike accumulation,
malformed and adversarial LLM output, prompt-injection containment, and an
end-to-end conservation check across a mixed multi-case scenario.

---

## Contract reference

| Method | Type | Description |
|---|---|---|
| `register_agent(handle, role)` | write | Self-register the calling wallet as an agent. |
| `propose_action(action_description, reasoning)` | payable | File a proposal; requires the exact proposal deposit. |
| `object_to_proposal(proposal_id, objection_reason)` | payable | File an objection; requires the exact objection deposit. |
| `resolve_proposal(proposal_id)` | write | Callable by anyone once the objection window has closed. |
| `withdraw()` | write | Claim your settled balance. |
| `update_constitution(new_text)` | write | Owner only. |
| `transfer_ownership` / `accept_ownership` / `renounce_ownership` | write | Owner-handover controls. |
| `get_config()` / `get_stats()` | view | Current deposits, window, and contract-wide totals. |
| `get_agent(address)` / `get_agent_by_handle(handle)` / `get_agents(offset, limit)` | view | Agent lookups, paginated. |
| `get_proposal(id)` / `get_proposals(offset, limit)` | view | Proposal lookups, paginated. |
| `get_objections_for(proposal_id)` | view | Objections filed against a proposal. |
| `get_dispute(id)` / `get_disputes(offset, limit)` | view | Resolved-case lookups, paginated. |
| `get_constitution()` / `get_constitution_at(version)` / `get_constitution_version()` | view | Constitution text and version history. |
| `get_claimable(address)` | view | Withdrawable balance for an address. |

---

## Known limitations

- **Sybil evasion** — a banned wallet can register again from a fresh
  address; the deposit requirement makes this costly but doesn't prevent it.
- **Objection-slot saturation** — an attacker controlling several wallets
  could fill a proposal's objection slots with weak objections, at the cost
  of the slash cut on each one.
- **Borderline confidence** — validators disagreeing by more than the
  configured tolerance fail consensus, and the call can simply be retried;
  verdicts near the confidence threshold can be flaky in principle.
- **Uncooperative recipients** — a `withdraw()` to a contract wallet that
  rejects incoming transfers would strand those funds.
- **Fixed economics** — deposits and the objection window are set at
  deployment and are immutable afterward; choose them deliberately.
