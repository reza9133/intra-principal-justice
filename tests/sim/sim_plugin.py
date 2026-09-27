"""pytest plugin providing direct_vm / direct_deploy / account fixtures on top of
the offline stub SDK.  Run:  PYTHONPATH=tests/sim python -m pytest -p sim_plugin tests/direct"""
import copy
import importlib.util
import itertools
import pytest

import genlayer
from genlayer import VM, Address, UserError, u256

_counter = itertools.count()


class _Deployed:
    def __init__(self, inst):
        object.__setattr__(self, "_inst", inst)

    def __getattr__(self, name):
        fn = getattr(type(self._inst), name, None)
        kind = getattr(fn, "_kind", None)
        if kind is None:
            raise AttributeError(name)
        inst = self._inst

        def call(*args):
            if kind == "view":
                return fn(inst, *args)
            if kind == "write" and VM.value:
                raise UserError("non-payable method received value")
            snap = copy.deepcopy(inst.__dict__)
            bal, nt = VM.balance, len(VM.transfers)
            try:
                if kind == "payable":
                    VM.balance += VM.value
                return fn(inst, *args)
            except BaseException:
                inst.__dict__.clear()
                inst.__dict__.update(snap)
                VM.balance = bal
                del VM.transfers[nt:]
                raise

        return call


def _load(path):
    spec = importlib.util.spec_from_file_location("ipj_%d" % next(_counter), path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _defaults(cls):
    d = {}
    for k, t in getattr(cls, "__annotations__", {}).items():
        if t in (genlayer.u32, genlayer.u64, genlayer.u256):
            d[k] = t(0)
        elif t is str:
            d[k] = ""
        elif t is bool:
            d[k] = False
        elif t is Address:
            d[k] = Address(bytes(20))
        else:
            d[k] = t() if callable(t) else None
    return d


@pytest.fixture
def direct_vm():
    VM.reset()
    return VM


@pytest.fixture
def direct_deploy(direct_vm):
    def deploy(path, *args):
        mod = _load(path)
        cls = [v for v in vars(mod).values()
               if isinstance(v, type) and issubclass(v, genlayer.gl.Contract)
               and v is not genlayer.gl.Contract][0]
        inst = cls.__new__(cls)
        inst.__dict__.update(_defaults(cls))
        inst.__init__(*args)
        return _Deployed(inst)
    return deploy


def _acct(n):
    return bytes([n]) * 20


direct_owner = pytest.fixture(lambda: _acct(0xA0))
direct_alice = pytest.fixture(lambda: _acct(0xA1))
direct_bob = pytest.fixture(lambda: _acct(0xA2))
direct_charlie = pytest.fixture(lambda: _acct(0xA3))
