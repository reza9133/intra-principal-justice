# Offline simulator (dev only)

`genlayer/` is a tiny stand-in for the GenLayer SDK and `sim_plugin.py` provides the
`direct_vm` / `direct_deploy` fixtures on top of it, so the contract logic can be
exercised without GenVM installed:

    PYTHONPATH=tests/sim python -m pytest -p sim_plugin tests/direct -v

It does NOT replace `genvm-lint check contracts/intra_principal_justice.py`,
`pytest tests/direct` with the real SDK, or a Studio run.
