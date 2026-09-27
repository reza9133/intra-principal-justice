# Intra-Principal Justice v3

**A permissionless, public, AI-judged court on GenLayer.** Any wallet can self-register as an agent, propose actions, file objections, and have disputes resolved by GenLayer's validator consensus against an on-chain Constitution.

Built with [GenLayer](https://genlayer.com) · React + Vite · Tailwind CSS

---

## Deployed contract

| Network | Address |
|---|---|
| studionet | `0x274130C0D9F938fEf34d9e8253803418F6E4a098` |

This address is already set in `frontend/.env` and `frontend/.env.example` as `VITE_CONTRACT_ADDRESS`.

> ⚠️ **The frontend in this repo talks to the OLD (v2) contract ABI** — owner-only agent registration, non-payable `propose_action`/`object_to_proposal`, `escalate_to_human`, no `withdraw`. The `contracts/intra_principal_justice.py` in this delivery is the NEW (v3) permissionless contract, with a different ABI (see below). If the address above is a deployment of the v3 contract, the frontend's `hooks/useContract.ts` and `lib/genlayer.ts` need to be updated to match before it will work end to end. I have not made that update.

---

## What changed from v2 → v3

- **Self-registration:** `register_agent(handle, role)` — any wallet, one step, no owner involved. Identity is always `gl.message.sender_address`.
- **Owner scope:** only `update_constitution`, `transfer_ownership` / `accept_ownership`, `renounce_ownership`. No registration, pausing, or dispute resolution powers.
- **Economic security:** `propose_action` and `object_to_proposal` are `payable` and require an exact GEN deposit. Losing side is slashed 10% to a locked `reserve`; winning side is rewarded from the loser's deposit. Inconclusive verdicts refund minus a 5% fee.
- **Permissionless resolution:** after a fixed objection window, `resolve_proposal` can be called by anyone; validators judge via `gl.vm.run_nondet_unsafe`.
- **Pull payments:** funds are claimed via `withdraw()`, never pushed automatically.
- **Hardening:** sequential IDs, snapshot handles/roles/Constitution-version per proposal, `_clean` sanitization against prompt injection, per-address open-proposal cap, per-proposal objection cap, bounded pagination, sized integers throughout.

Full design notes and the security rationale are in the contract's module docstring at the top of `contracts/intra_principal_justice.py`.

---

## Project structure

```
intra-principal-justice/
├── contracts/
│   └── intra_principal_justice.py      # v3 permissionless GenLayer Intelligent Contract
├── tests/
│   ├── direct/
│   │   ├── conftest.py
│   │   └── test_intra_principal_justice.py   # 32 tests: registration, deposits, slashing,
│   │                                           # prompt-injection, pagination, conservation
│   └── sim/                             # offline stand-in SDK (dev-only, see tests/sim/README.md)
├── frontend/                            # v2 React/Vite/Tailwind app — ABI mismatch, see warning above
├── gltest.config.yaml
├── pyproject.toml
└── README.md
```

---

## Quick start

### 1. Run the contract tests

Against the real SDK:
```bash
pytest tests/direct -v
```

Against the offline stand-in (no GenVM required, for quick logic checks only):
```bash
PYTHONPATH=tests/sim python -m pytest -p sim_plugin tests/direct -v
```

Also run the linter before any deployment:
```bash
genvm-lint check contracts/intra_principal_justice.py
```

### 2. Deploy the contract

In [GenLayer Studio](https://studio.genlayer.com), deploy `contracts/intra_principal_justice.py` with constructor args:

```
constitution:        "1. Security always wins. 2. Under-budget travel is approved."
proposal_deposit:     <wei amount, e.g. 20000000000000000>
objection_deposit:    <wei amount, e.g. 10000000000000000>
objection_window:     <seconds, e.g. 3600>
```

### 3. Configure the frontend

```bash
cd frontend
npm install
```

`frontend/.env` is already set to:
```env
VITE_CONTRACT_ADDRESS=0x274130C0D9F938fEf34d9e8253803418F6E4a098
VITE_GENLAYER_RPC=https://studio.genlayer.com/api
VITE_CHAIN_ID=61999
```

```bash
npm run dev
```

Remember: the frontend code itself still calls the v2 ABI and will need updating for `register_agent`'s new signature, payable calls, `resolve_proposal`, and `withdraw` before it works against the v3 contract.

---

## Verdicts

| Decision | Meaning |
|---|---|
| `allow_action` | Constitution supports the proposer; objections are rejected and slashed. |
| `block_action` | An objection correctly shows the action violates the Constitution; proposer is slashed. |
| `inconclusive` | Constitution is silent/ambiguous, or confidence was below the threshold; everyone refunded minus a small fee. |

`escalate_to_human` no longer exists — there is no human owner in the loop for disputes.
