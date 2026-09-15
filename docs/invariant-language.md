# Declarative Invariant DSL Language Specification

## 1. Syntax & Grammar

The TraceLake-V Invariant DSL allows data engineers to declare formal properties about pipeline inputs and outputs in a human-readable mathematical notation.

```text
Assertion       ::= "ASSERT" RelationalExpr
RelationalExpr  ::= ArithExpr RelOp ArithExpr
RelOp           ::= "==" | "!=" | "<=" | ">=" | "<" | ">"
ArithExpr       ::= Term ( ("+" | "-") Term )*
Term            ::= Factor ( ("*" | "/") Factor )*
Factor          ::= Number | Identifier | FunctionCall | "(" ArithExpr ")"
Identifier      ::= DatasetName "." PropertyName
FunctionCall    ::= DatasetName "." FunctionName "(" Identifier* ")"
```

## 2. Examples of Supported Invariants

### Payment Completeness (Conservation of Net Revenue)
```text
ASSERT output.total_amount == input.total_amount - refunded.total_amount
```

### Row Conservation
```text
ASSERT output.row_count + rejected.row_count == input.row_count
```

### Non-Negative Balance
```text
ASSERT output.total_amount >= 0
```

### Partition Null Check
```text
ASSERT output.null_count(region) == 0
```

### Inventory Conservation
```text
ASSERT output.stock_remaining == input.stock_initial - output.shipped_units
```

## 3. Safe Compilation Safety Guarantees
- No `eval()` or `exec()` execution.
- Strict tokenization and LL(1) recursive descent parser.
- Structured AST output compiled directly into First-Order Z3 expressions.
