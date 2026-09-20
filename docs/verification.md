# Formal Verification & SMT Soundness

## 1. Mathematical Guarantee

Ichnos uses the **Z3 Theorem Prover** developed by Microsoft Research.

When Ichnos returns:

### `FORMALLY VERIFIED (UNSAT)`
The solver has formally proved that within the symbolic domain constraints and supported transformation semantics, **no input state exists** that can produce an invariant violation.

### `FORMALLY VIOLATED (SAT)`
The solver has discovered a concrete valuation of inputs $M$ (a counterexample model) that satisfies all precondition domain constraints while violating the invariant assertion.

### `UNKNOWN`
The transformation contains blackbox or unsupported operations outside the symbolic model (e.g. unconstrained UDFs, non-deterministic RNG, external API calls). Ichnos will **never fake a verification result**.

## 2. Limitations

- **Bounded Symbolic Model**: Guarantees apply to transformations expressed in the Ichnos IR. Arbitrary Python bytecodes or external library binaries are not verified unless transpiled to IR.
- **Floating Point Semantics**: Real arithmetic is verified using Quantifier-Free Linear Real Arithmetic (QF_LRA). Non-linear multiplications are evaluated with bound constraints.
