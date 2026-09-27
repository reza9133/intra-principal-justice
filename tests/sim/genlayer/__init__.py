"""
Minimal OFFLINE stand-in for the GenLayer SDK (dev-only).

It models just enough of GenVM semantics to run the direct-mode tests without
the real SDK: sized ints, TreeMap/DynArray, message context, payable methods,
atomic revert of failed transactions, run_nondet_unsafe leader/validator flow,
mocked LLM, and emit_transfer. It is NOT a substitute for the real GenVM /
`genvm-lint` / Studio runs -- use it only to sanity-check contract logic.
"""
import json
import re


class UserError(Exception):
    pass


class Return:
    def __init__(self, calldata):
        self.calldata = calldata


class Address:
    def __init__(self, v):
        if isinstance(v, Address):
            b = v.raw
        elif isinstance(v, (bytes, bytearray)):
            b = bytes(v)
        elif isinstance(v, str):
            s = v.strip()
            if not (s.startswith("0x") and len(s) == 42):
                raise ValueError("bad address")
            b = bytes.fromhex(s[2:])
        else:
            raise ValueError("bad address")
        if len(b) != 20:
            raise ValueError("bad address length")
        self.raw = b

    @property
    def as_hex(self):
        return "0x" + self.raw.hex()

    def __eq__(self, o):
        return isinstance(o, Address) and o.raw == self.raw

    def __hash__(self):
        return hash(self.raw)

    def __lt__(self, o):
        return self.raw < o.raw

    def __repr__(self):
        return "Address(%s)" % self.as_hex


def _sized(name, bits):
    hi = 2 ** bits

    class _T(int):
        def __new__(cls, v=0):
            v = int(v)
            if v < 0 or v >= hi:
                raise OverflowError(name + " out of range")
            return int.__new__(cls, v)

    _T.__name__ = name
    return _T


u32 = _sized("u32", 32)
u64 = _sized("u64", 64)
u256 = _sized("u256", 256)


class TreeMap(dict):
    class_getitem = None

    def __class_getitem__(cls, item):
        return cls


class DynArray(list):
    def __class_getitem__(cls, item):
        return cls


def allow_storage(cls):
    return cls


# ---------------------------------------------------------------- sim VM state
class SimVM:
    def __init__(self):
        self.reset()

    def reset(self):
        self._sender = Address(b"\x01" * 20)
        self.value = 0
        self.datetime = "2026-01-01T00:00:00Z"
        self.mocks = []
        self.transfers = []
        self.balance = 0
        self.prompts = []

    @property
    def sender(self):
        return self._sender

    @sender.setter
    def sender(self, v):
        self._sender = Address(v)

    def warp(self, iso):
        self.datetime = iso

    def mock_llm(self, pattern, response):
        self.mocks.append((re.compile(pattern, re.S), response))

    def clear_mocks(self):
        self.mocks = []

    def expect_revert(self, text=""):
        import pytest
        return pytest.raises(UserError, match=re.escape(text))


VM = SimVM()


class _Message:
    @property
    def sender_address(self):
        return VM.sender

    @property
    def value(self):
        return u256(VM.value)


class _MessageRaw:
    def __getitem__(self, k):
        if k == "datetime":
            return VM.datetime
        raise KeyError(k)


class _Write:
    def __call__(self, fn):
        fn._kind = "write"
        return fn

    def payable(self, fn):
        fn._kind = "payable"
        return fn


class _Public:
    write = _Write()

    @staticmethod
    def view(fn):
        fn._kind = "view"
        return fn


class _VMNS:
    UserError = UserError
    Return = Return

    @staticmethod
    def run_nondet_unsafe(leader, validator):
        res = leader()
        if not validator(Return(res)):
            raise UserError("Consensus not reached")
        return res


class _Nondet:
    @staticmethod
    def exec_prompt(prompt, response_format=None):
        VM.prompts.append(prompt)
        for rx, resp in VM.mocks:
            if rx.match(prompt):
                return json.loads(resp) if response_format == "json" else resp
        raise RuntimeError("no LLM mock matched the prompt")


class _Proxy:
    def __init__(self, addr):
        self.addr = addr

    def emit_transfer(self, value=0):
        VM.transfers.append((self.addr, int(value)))
        VM.balance -= int(value)


class _Contract:
    pass


class _GL:
    Contract = _Contract
    public = _Public
    message = _Message()
    message_raw = _MessageRaw()
    vm = _VMNS
    nondet = _Nondet

    @staticmethod
    def get_contract_at(addr):
        return _Proxy(addr)


gl = _GL()

__all__ = ["gl", "Address", "u32", "u64", "u256", "TreeMap", "DynArray", "allow_storage"]
