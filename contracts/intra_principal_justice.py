# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
from dataclasses import dataclass
import json


# ============================================================================
# Storage Structures
# ============================================================================

@allow_storage
@dataclass
class Proposal:
    id: u32
    proposer_agent: str
    action_description: str
    reasoning: str
    status: str  # "pending" | "approved" | "locked" | "blocked" | "escalated"
    created_at: str


@allow_storage
@dataclass
class Dispute:
    id: u32
    proposal_id: u32
    objector_agent: str
    objection_reason: str
    verdict_decision: str  # "allow_action" | "block_action" | "escalate_to_human"
    verdict_confidence: u32
    verdict_reasoning: str
    resolved: bool


# ============================================================================
# Intra-Principal Justice Contract
# ============================================================================

class IntraPrincipalJustice(gl.Contract):
    owner: Address
    constitution: str
    agent_ids: DynArray[str]
    agent_roles: TreeMap[str, str]
    proposals: DynArray[Proposal]
    disputes: DynArray[Dispute]
    proposal_count: u32
    dispute_count: u32

    def __init__(self, constitution: str):
        self.owner = gl.message.sender_address
        self.constitution = constitution
        self.proposal_count = u32(0)
        self.dispute_count = u32(0)

    # ========================================================================
    # Owner-Only: Constitution Management
    # ========================================================================

    @gl.public.write
    def update_constitution(self, new_constitution: str) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError("Only the owner can update the constitution")
        if len(new_constitution.strip()) == 0:
            raise gl.vm.UserError("Constitution cannot be empty")
        self.constitution = new_constitution

    # ========================================================================
    # Owner-Only: Agent Registry
    # ========================================================================

    @gl.public.write
    def register_agent(self, agent_id: str, role: str) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError("Only the owner can register agents")
        if len(agent_id.strip()) == 0:
            raise gl.vm.UserError("Agent ID cannot be empty")
        if len(role.strip()) == 0:
            raise gl.vm.UserError("Agent role cannot be empty")
        existing = self.agent_roles.get(agent_id, "")
        if len(existing) > 0:
            raise gl.vm.UserError("Agent already registered")
        self.agent_roles[agent_id] = role
        self.agent_ids.append(agent_id)

    @gl.public.write
    def remove_agent(self, agent_id: str) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError("Only the owner can remove agents")
        existing = self.agent_roles.get(agent_id, "")
        if len(existing) == 0:
            raise gl.vm.UserError("Agent not found")
        self.agent_roles[agent_id] = ""

    # ========================================================================
    # Action Gateway: Propose an Action
    # ========================================================================

    @gl.public.write
    def propose_action(
        self, agent_id: str, action_description: str, reasoning: str
    ) -> None:
        agent_role = self.agent_roles.get(agent_id, "")
        if len(agent_role) == 0:
            raise gl.vm.UserError("Agent is not registered")
        if len(action_description.strip()) == 0:
            raise gl.vm.UserError("Action description cannot be empty")
        if len(reasoning.strip()) == 0:
            raise gl.vm.UserError("Reasoning cannot be empty")

        from datetime import datetime, timezone

        new_id = u32(int(self.proposal_count) + 1)
        self.proposal_count = new_id

        proposal = Proposal(
            id=new_id,
            proposer_agent=agent_id,
            action_description=action_description,
            reasoning=reasoning,
            status="pending",
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self.proposals.append(proposal)

    # ========================================================================
    # Action Gateway: Object to a Proposal → Triggers the Court
    # ========================================================================

    @gl.public.write
    def object_to_proposal(
        self, proposal_id: u32, objector_agent_id: str, objection_reason: str
    ) -> None:
        # Validate objector is a registered agent
        objector_role = self.agent_roles.get(objector_agent_id, "")
        if len(objector_role) == 0:
            raise gl.vm.UserError("Objector agent is not registered")
        if len(objection_reason.strip()) == 0:
            raise gl.vm.UserError("Objection reason cannot be empty")

        # Find the proposal
        prop_idx = -1
        for i in range(len(self.proposals)):
            p = self.proposals[i]
            if int(p.id) == int(proposal_id):
                prop_idx = i
                break

        if prop_idx == -1:
            raise gl.vm.UserError("Proposal not found")

        target_proposal = self.proposals[prop_idx]

        if target_proposal.status != "pending":
            raise gl.vm.UserError("Proposal is not in pending status")

        # An agent cannot object to its own proposal
        if target_proposal.proposer_agent == objector_agent_id:
            raise gl.vm.UserError("An agent cannot object to its own proposal")

        # Lock the proposal
        self.proposals[prop_idx].status = "locked"

        # Copy all needed data to memory for the non-deterministic block
        constitution_text = str(self.constitution)
        proposer_id = str(target_proposal.proposer_agent)
        proposer_role = str(self.agent_roles.get(proposer_id, "Unknown"))
        action_desc = str(target_proposal.action_description)
        action_reasoning = str(target_proposal.reasoning)
        objector_id = str(objector_agent_id)
        obj_role = str(objector_role)
        obj_reason = str(objection_reason)

        # ====================================================================
        # THE COURT: Non-deterministic LLM evaluation
        # ====================================================================

        def leader_fn():
            prompt = (
                "You are an impartial AI judge for an internal agent court. "
                "A human owner has multiple AI agents that share resources. "
                "Two agents are in a dispute. Evaluate the dispute against the "
                "owner's Constitution and return a verdict.\n\n"
                "=== CONSTITUTION (Owner's Rules) ===\n"
                f"{constitution_text}\n\n"
                "=== PROPOSING AGENT ===\n"
                f"Agent ID: {proposer_id}\n"
                f"Role: {proposer_role}\n"
                f"Proposed Action: {action_desc}\n"
                f"Reasoning: {action_reasoning}\n\n"
                "=== OBJECTING AGENT ===\n"
                f"Agent ID: {objector_id}\n"
                f"Role: {obj_role}\n"
                f"Objection: {obj_reason}\n\n"
                "=== INSTRUCTIONS ===\n"
                "Analyze both sides against the Constitution. Return ONLY a JSON "
                "object with exactly these keys:\n"
                '- "decision": one of "allow_action", "block_action", or '
                '"escalate_to_human"\n'
                '- "confidence": integer from 0 to 100 indicating your confidence\n'
                '- "reasoning": a string explaining your verdict (max 500 chars)\n\n'
                "Rules for your judgment:\n"
                "1. If the Constitution clearly supports one side, decide accordingly "
                "with high confidence.\n"
                "2. If the Constitution is ambiguous or silent on the matter, "
                'use "escalate_to_human" with moderate confidence.\n'
                "3. Always ground your reasoning in specific constitutional clauses.\n"
                "4. Be concise but thorough in your reasoning.\n"
            )
            result = gl.nondet.exec_prompt(prompt, response_format="json")

            # Defensive parsing
            if not isinstance(result, dict):
                raise gl.vm.UserError("LLM did not return a valid JSON object")

            decision = result.get("decision", "")
            if decision not in ("allow_action", "block_action", "escalate_to_human"):
                raise gl.vm.UserError(
                    f"Invalid decision value: {decision}"
                )

            confidence = result.get("confidence", -1)
            try:
                confidence = int(confidence)
            except (ValueError, TypeError):
                raise gl.vm.UserError(
                    f"Invalid confidence value: {confidence}"
                )
            if confidence < 0 or confidence > 100:
                raise gl.vm.UserError(
                    f"Confidence out of range: {confidence}"
                )

            reasoning_text = str(result.get("reasoning", ""))
            if len(reasoning_text) == 0:
                reasoning_text = "No reasoning provided"

            return {
                "decision": decision,
                "confidence": confidence,
                "reasoning": reasoning_text,
            }

        def validator_fn(leaders_res) -> bool:
            # If the leader errored, disagree to force rotation
            if not isinstance(leaders_res, gl.vm.Return):
                return False

            leader_data = leaders_res.calldata

            # Validate structure of leader's response
            if not isinstance(leader_data, dict):
                return False
            if "decision" not in leader_data:
                return False
            if "confidence" not in leader_data:
                return False
            if leader_data["decision"] not in (
                "allow_action",
                "block_action",
                "escalate_to_human",
            ):
                return False

            # Validator independently runs the same evaluation
            try:
                validator_data = leader_fn()
            except Exception:
                return False

            # RULE 1: Decision must match EXACTLY
            if leader_data["decision"] != validator_data["decision"]:
                return False

            # RULE 2: Confidence must be within a 15-point delta
            leader_conf = int(leader_data["confidence"])
            validator_conf = int(validator_data["confidence"])
            if abs(leader_conf - validator_conf) > 15:
                return False

            return True

        # Execute the court through GenLayer consensus
        verdict = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

        # ====================================================================
        # DETERMINISTIC: Apply the verdict to contract state
        # ====================================================================

        decision = str(verdict["decision"])
        confidence = u32(int(verdict["confidence"]))
        reasoning = str(verdict["reasoning"])

        # Update proposal status based on verdict
        if decision == "allow_action":
            self.proposals[prop_idx].status = "approved"
        elif decision == "block_action":
            self.proposals[prop_idx].status = "blocked"
        elif decision == "escalate_to_human":
            self.proposals[prop_idx].status = "escalated"

        # Store the dispute record
        new_dispute_id = u32(int(self.dispute_count) + 1)
        self.dispute_count = new_dispute_id

        dispute = Dispute(
            id=new_dispute_id,
            proposal_id=proposal_id,
            objector_agent=objector_agent_id,
            objection_reason=objection_reason,
            verdict_decision=decision,
            verdict_confidence=confidence,
            verdict_reasoning=reasoning,
            resolved=True,
        )
        self.disputes.append(dispute)

    # ========================================================================
    # View Methods
    # ========================================================================

    @gl.public.view
    def get_constitution(self) -> str:
        return self.constitution

    @gl.public.view
    def get_owner(self) -> str:
        return str(self.owner)

    @gl.public.view
    def get_proposal(self, proposal_id: u32) -> dict:
        for i in range(len(self.proposals)):
            p = self.proposals[i]
            if int(p.id) == int(proposal_id):
                return {
                    "id": int(p.id),
                    "proposer_agent": p.proposer_agent,
                    "action_description": p.action_description,
                    "reasoning": p.reasoning,
                    "status": p.status,
                    "created_at": p.created_at,
                }
        raise gl.vm.UserError("Proposal not found")

    @gl.public.view
    def get_all_proposals(self) -> list:
        result = []
        for i in range(len(self.proposals)):
            p = self.proposals[i]
            result.append(
                {
                    "id": int(p.id),
                    "proposer_agent": p.proposer_agent,
                    "action_description": p.action_description,
                    "reasoning": p.reasoning,
                    "status": p.status,
                    "created_at": p.created_at,
                }
            )
        return result

    @gl.public.view
    def get_dispute(self, dispute_id: u32) -> dict:
        for i in range(len(self.disputes)):
            d = self.disputes[i]
            if int(d.id) == int(dispute_id):
                return {
                    "id": int(d.id),
                    "proposal_id": int(d.proposal_id),
                    "objector_agent": d.objector_agent,
                    "objection_reason": d.objection_reason,
                    "verdict_decision": d.verdict_decision,
                    "verdict_confidence": int(d.verdict_confidence),
                    "verdict_reasoning": d.verdict_reasoning,
                    "resolved": d.resolved,
                }
        raise gl.vm.UserError("Dispute not found")

    @gl.public.view
    def get_all_disputes(self) -> list:
        result = []
        for i in range(len(self.disputes)):
            d = self.disputes[i]
            result.append(
                {
                    "id": int(d.id),
                    "proposal_id": int(d.proposal_id),
                    "objector_agent": d.objector_agent,
                    "objection_reason": d.objection_reason,
                    "verdict_decision": d.verdict_decision,
                    "verdict_confidence": int(d.verdict_confidence),
                    "verdict_reasoning": d.verdict_reasoning,
                    "resolved": d.resolved,
                }
            )
        return result

    @gl.public.view
    def get_all_agents(self) -> list:
        result = []
        for i in range(len(self.agent_ids)):
            aid = self.agent_ids[i]
            role = self.agent_roles.get(aid, "")
            if len(role) > 0:
                result.append({"agent_id": aid, "role": role})
        return result

    @gl.public.view
    def get_agent_info(self, agent_id: str) -> dict:
        role = self.agent_roles.get(agent_id, "")
        if len(role) == 0:
            raise gl.vm.UserError("Agent not found")
        return {"agent_id": agent_id, "role": role}

    @gl.public.view
    def get_stats(self) -> dict:
        active_agents = 0
        for i in range(len(self.agent_ids)):
            role = self.agent_roles.get(self.agent_ids[i], "")
            if len(role) > 0:
                active_agents += 1
        return {
            "total_proposals": int(self.proposal_count),
            "total_disputes": int(self.dispute_count),
            "active_agents": active_agents,
        }
