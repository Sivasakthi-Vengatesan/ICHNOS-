# TraceLake-V

## SMT-Powered Data Lineage, Invariant Verification & Counterexample Engine

```
TRACELAKE-V // SMT DATA LINEAGE & INVARIANT PROOF ENGINE
========================================================
[FORM FOLLOWS DATA. MOTION FOLLOWS EXECUTION.]
```

TraceLake-V is a developer-grade data pipeline verification and debugging platform that combines **data lineage**, **pipeline execution traces**, **schema tracking**, **declarative business invariants**, and **formal verification using the Z3 SMT solver**.

Traditional data observability tools detect post-facto symptoms (e.g. "row count dropped 10%"). TraceLake-V answers:

> **"Does this transformation logically preserve the invariant we declared?"**
> **"If not, what concrete input state demonstrates the violation?"**

---

## Architecture

```text
                   TraceLake-V
                       │
              ┌────────▼────────┐
              │ Pipeline Source │ (Kafka / CSV / Spark)
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ Execution Trace │ (Real row counts & wall time)
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ Lineage Engine  │ (Table & Column DAG)
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ Invariant DSL   │ (ASSERT output.total == input.total - refunded.total)
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ SMT Compiler    │ (QF_LIRA symbolic encoder)
              └────────┬────────┘
                       ↓
                  ┌─────────┐
                  │   Z3    │
                  └────┬────┘
                       │
              ┌────────┴────────┐
              ↓                 ↓
           UNSAT               SAT
              ↓                 ↓
      FORMALLY VERIFIED   COUNTEREXAMPLE REPORT
                                ↓
                         Root Cause Analysis
                                ↓
                         Version Time-Travel Diff
```

---

## Core Demo Pipeline Scenario

### Ground Truth Input (`sample_orders.csv`):
```text
id | amount | status
1  | 500    | PAID
2  | 300    | PAID
3  | 200    | REFUNDED
```

### Invariant:
```text
ASSERT output.total_amount == input.total_amount - refunded.total_amount
```
- $\text{input\_total} = 1000$
- $\text{refunded\_total} = 200$
- $\text{expected\_output} = 800$

### Version 1 (Correct):
```python
paid_orders = orders[orders["status"] == "PAID"]
# Result: output_total = 800 -> Z3: UNSAT -> FORMALLY VERIFIED ✓
```

### Version 3 (Deliberately Broken):
```python
paid_orders = orders[(orders["status"] == "PAID") & (orders["id"] != 2)]
# Result: output_total = 500 -> Z3: SAT -> FORMALLY VIOLATED ✗
# Counterexample extracted: Order ID 2 ($300, PAID) was dropped by clean_orders
```

---

## CLI Usage

The `tracelake` CLI tool provides full terminal verification:

```bash
# Verify a pipeline JSON definition with Z3
python backend/cli.py verify examples/orders_pipeline_v1.json
# Result: [PASS] FORMALLY VERIFIED (UNSAT in 68 ms)

# Verify broken pipeline
python backend/cli.py verify examples/orders_pipeline_v3_broken.json
# Result: [FAIL] FORMALLY VIOLATED (SAT in 28 ms)
# Extracts concrete counterexample with root cause

# Inspect lineage graph
python backend/cli.py lineage orders_pipeline --version v3

# Compare versions with Git-like diff and regression alert
python backend/cli.py compare orders_pipeline v2 v3

# Execute pipeline against real dataset
python backend/cli.py execute orders_pipeline --version v1
```

---

## Running the Web Application (Bauhaus × Kinetic Instrument UI)

The web dashboard is built according to the **Bauhaus × Kinetic Technical Instrument** design specification:
- Background `#F4F1E8` (warm technical paper)
- Structural Black `#111111` borders (0px sharp corners)
- Semantic state colors (Verified `#168A52`, Violated `#D02020`, Unknown `#D49A00`, Lineage `#2457C5`, Kinetic Acid Yellow `#DDE51A`)
- Numbered navigation screens `01` to `07`.

### 1. Start Backend:
```bash
cd backend
python -m uvicorn app.main:app --port 8000
```

### 2. Start Frontend:
```bash
cd frontend
npm install
npm run dev
```

### 3. Or with Docker Compose:
```bash
docker compose up
```

---

## Numbered Screens

- `01 / OVERVIEW`: System statistics, live telemetry marquee, active pipeline status.
- `02 / PIPELINES`: Catalogue of registered pipelines, versions, and transformation IR.
- `03 / EXECUTIONS`: Measured traces, step-by-step row count changes, and timings.
- `04 / LINEAGE`: Multi-level DAG (Table & Column level), with root-cause highlighting.
- `05 / VERIFICATION`: The centerpiece: Z3 UNSAT/SAT status, Invariant formula, Incident Counterexample Report, and Interactive SMT Sandbox.
- `06 / INVARIANTS`: Declarative Invariant DSL editor, AST visualizer, and syntax validation.
- `07 / TIME TRAVEL`: Version timeline (V1 -> V2 -> V3 -> V4), side-by-side Git diff, schema diff, and regression detector.

---

## Automated Tests

Run the full pytest suite:
```bash
pytest backend/tests -v
```
- `test_invariant_compiler.py`: DSL lexing, parsing, AST generation, syntax error handling.
- `test_verification_engine.py`: Z3 UNSAT proofs, SAT counterexample extractions, UNKNOWN unsupported ops.
- `test_api.py`: FastAPI end-to-end integration endpoints.

---

## License

MIT License.
