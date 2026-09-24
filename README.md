# Intra-Principal Justice

**The Internal Court for Your AI Agent Fleet** — An Intelligent Contract on GenLayer that resolves disputes between a user's own staff of AI agents who share resources but have conflicting KPIs.

Built with [GenLayer](https://genlayer.com) · React + Vite · Tailwind CSS

---

## 🧠 Core Concept

When you run multiple AI agents (Budget Agent, Travel Agent, Security Agent, etc.) that share a wallet and resources, they will inevitably conflict. Who decides? **This contract does.**

The owner writes a plain-language **Constitution** (e.g., _"Prefer price over comfort if the gap is >15%"_), registers agents, and when Agent A proposes an action that Agent B objects to, the contract triggers an **AI-powered court** that evaluates the dispute against the Constitution using GenLayer's decentralized validator consensus.

### How It Works

1. **📜 Set Constitution** — Owner writes plain-language governance rules
2. **🤖 Agents Propose** — Any registered agent can propose an action with reasoning
3. **⚔️ Objection Filed** — Another agent objects → the proposal is **locked**
4. **⚖️ AI Court Rules** — GenLayer validators independently evaluate the dispute against the Constitution and reach consensus on a verdict

### Verdicts

| Decision | Meaning |
|----------|---------|
| `allow_action` | The Constitution supports the proposing agent |
| `block_action` | The Constitution supports the objecting agent |
| `escalate_to_human` | The Constitution is ambiguous; human owner must decide |

---

## 📁 Project Structure

```
intra-principal-justice/
├── contracts/
│   └── intra_principal_justice.py    # GenLayer Intelligent Contract
├── frontend/
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── hooks/                     # Custom hooks
│   │   ├── lib/                       # GenLayer client
│   │   ├── types/                     # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A GenLayer Studio account ([studio.genlayer.com](https://studio.genlayer.com))

### 1. Deploy the Smart Contract

1. Open [GenLayer Studio](https://studio.genlayer.com)
2. Create a new contract and paste the contents of `contracts/intra_principal_justice.py`
3. Deploy with a constructor argument for the constitution:
   ```
   constitution: "1. Prefer price over comfort if the gap is >15%. 2. Security concerns always take priority. 3. Travel bookings must be approved if under budget."
   ```
4. Copy the deployed contract address

### 2. Set Up the Frontend

```bash
cd frontend
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your contract address:

```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_GENLAYER_RPC=https://studio.genlayer.com/api
VITE_CHAIN_ID=61999
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Cloudflare Pages Deployment

### Build Configuration

| Setting | Value |
|---------|-------|
| **Framework preset** | None |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `frontend` |
| **Node.js version** | 18 |

### Environment Variables

Set these in **Cloudflare Dashboard → Pages → Settings → Environment Variables**:

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_CONTRACT_ADDRESS` | `0x...` (your deployed contract address) | ✅ Yes |
| `VITE_GENLAYER_RPC` | `https://studio.genlayer.com/api` | ✅ Yes |
| `VITE_CHAIN_ID` | `61999` | ✅ Yes |
| `NODE_VERSION` | `18` | Recommended |

> **Important:** Vite environment variables must be prefixed with `VITE_` to be available in the frontend bundle. They are embedded at **build time**, not runtime.

### Deploy via Cloudflare CLI

```bash
# Install wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build
cd frontend
npm run build

# Deploy
wrangler pages deploy dist --project-name=intra-principal-justice
```

### Deploy via Git Integration

1. Push your repo to GitHub/GitLab
2. In Cloudflare Dashboard → Pages → Create a project
3. Connect your repository
4. Set the build settings as shown above
5. Set environment variables
6. Deploy

---

## 🔧 Smart Contract API

### Write Methods

| Method | Parameters | Description |
|--------|-----------|-------------|
| `update_constitution` | `new_constitution: str` | Update governance rules (owner only) |
| `register_agent` | `agent_id: str, role: str` | Register a new AI agent (owner only) |
| `remove_agent` | `agent_id: str` | Remove an agent (owner only) |
| `propose_action` | `agent_id: str, action_description: str, reasoning: str` | Submit a proposal |
| `object_to_proposal` | `proposal_id: u32, objector_agent_id: str, objection_reason: str` | Object to a proposal (triggers court) |

### View Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `get_constitution` | `str` | Current constitution text |
| `get_all_proposals` | `list[Proposal]` | All proposals with status |
| `get_all_disputes` | `list[Dispute]` | All disputes with verdicts |
| `get_all_agents` | `list[Agent]` | All registered agents |
| `get_stats` | `dict` | Summary statistics |

---

## ⚖️ Consensus Mechanism

The contract uses `gl.vm.run_nondet_unsafe(leader_fn, validator_fn)` for the court:

1. **Leader** evaluates the dispute with an LLM prompt and returns a JSON verdict
2. **Validators** independently run the same evaluation
3. **Agreement requires:**
   - ✅ Exact match on `decision` (allow/block/escalate)
   - ✅ `confidence` scores within **15 points** of each other
4. If consensus fails, the leader is rotated and the process repeats

This ensures no single AI model controls the verdict — multiple independent evaluations must agree.

---

## 📄 License

MIT

---

## 🔗 Links

- [GenLayer Documentation](https://docs.genlayer.com)
- [GenLayer Studio](https://studio.genlayer.com)
- [GenLayer Discord](https://discord.gg/8Jm4v89VAu)
