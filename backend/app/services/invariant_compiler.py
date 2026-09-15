import re
from typing import Dict, Any, List, Optional, Tuple

class InvariantSyntaxError(Exception):
    pass

class InvariantCompiler:
    """
    Safe Declarative Invariant DSL Lexer, Parser, and AST Compiler.
    Does NOT use eval() or exec().
    Supports forms:
      ASSERT <expr> <rel_op> <expr>
      where <expr> can contain identifiers (e.g. output.total_amount, input.row_count, output.null_count(col)),
      numeric constants, and binary arithmetic (+, -, *, /).
    """

    TOKENS = [
        ("ASSERT", r"\bASSERT\b"),
        ("NUMBER", r"\b\d+(\.\d+)?\b"),
        ("REL_OP", r"(==|!=|<=|>=|<|>)"),
        ("ARITH_OP", r"(\+|\-|\*|\/)"),
        ("LPAREN", r"\("),
        ("RPAREN", r"\)"),
        ("IDENTIFIER", r"[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*"),
        ("COMMA", r","),
        ("WS", r"\s+"),
    ]

    @classmethod
    def tokenize(cls, expression: str) -> List[Tuple[str, str]]:
        pos = 0
        tokens = []
        clean_expr = expression.strip()
        while pos < len(clean_expr):
            match = None
            for token_type, pattern in cls.TOKENS:
                regex = re.compile(pattern)
                m = regex.match(clean_expr, pos)
                if m:
                    match = m
                    text = m.group(0)
                    if token_type != "WS":
                        tokens.append((token_type, text))
                    pos = m.end()
                    break
            if not match:
                raise InvariantSyntaxError(f"Unexpected token at position {pos}: '{clean_expr[pos:pos+10]}'")
        return tokens

    @classmethod
    def parse(cls, expression: str) -> Dict[str, Any]:
        """
        Parses an expression string into an AST.
        """
        tokens = cls.tokenize(expression)
        if not tokens:
            raise InvariantSyntaxError("Empty expression")

        # Expect ASSERT at the beginning
        idx = 0
        if tokens[0][0] == "ASSERT":
            idx += 1

        # We now parse: Expr RelOp Expr
        left_ast, idx = cls._parse_arith_expr(tokens, idx)
        if idx >= len(tokens):
            raise InvariantSyntaxError("Expected relational operator (==, <=, >=, !=, <, >), reached end of expression")

        tok_type, rel_op = tokens[idx]
        if tok_type != "REL_OP":
            raise InvariantSyntaxError(f"Expected relational operator, found '{rel_op}'")
        idx += 1

        right_ast, idx = cls._parse_arith_expr(tokens, idx)
        if idx < len(tokens):
            raise InvariantSyntaxError(f"Unexpected trailing tokens: {[t[1] for t in tokens[idx:]]}")

        return {
            "type": "Assertion",
            "operator": rel_op,
            "left": left_ast,
            "right": right_ast,
            "raw_expression": expression.strip()
        }

    @classmethod
    def _parse_arith_expr(cls, tokens: List[Tuple[str, str]], idx: int) -> Tuple[Dict[str, Any], int]:
        left, idx = cls._parse_term(tokens, idx)
        while idx < len(tokens) and tokens[idx][0] == "ARITH_OP" and tokens[idx][1] in ("+", "-"):
            op = tokens[idx][1]
            idx += 1
            right, idx = cls._parse_term(tokens, idx)
            left = {
                "type": "BinaryOp",
                "operator": op,
                "left": left,
                "right": right
            }
        return left, idx

    @classmethod
    def _parse_term(cls, tokens: List[Tuple[str, str]], idx: int) -> Tuple[Dict[str, Any], int]:
        left, idx = cls._parse_factor(tokens, idx)
        while idx < len(tokens) and tokens[idx][0] == "ARITH_OP" and tokens[idx][1] in ("*", "/"):
            op = tokens[idx][1]
            idx += 1
            right, idx = cls._parse_factor(tokens, idx)
            left = {
                "type": "BinaryOp",
                "operator": op,
                "left": left,
                "right": right
            }
        return left, idx

    @classmethod
    def _parse_factor(cls, tokens: List[Tuple[str, str]], idx: int) -> Tuple[Dict[str, Any], int]:
        if idx >= len(tokens):
            raise InvariantSyntaxError("Unexpected end of expression while parsing factor")

        tok_type, val = tokens[idx]

        if tok_type == "NUMBER":
            num_val = float(val) if "." in val else int(val)
            return {"type": "Literal", "value": num_val}, idx + 1

        if tok_type == "LPAREN":
            ast, next_idx = cls._parse_arith_expr(tokens, idx + 1)
            if next_idx >= len(tokens) or tokens[next_idx][0] != "RPAREN":
                raise InvariantSyntaxError("Expected closing parenthesis ')'")
            return ast, next_idx + 1

        if tok_type == "IDENTIFIER":
            # Check if this identifier is a function call e.g. output.null_count(region)
            if idx + 1 < len(tokens) and tokens[idx + 1][0] == "LPAREN":
                fn_name = val
                args = []
                curr = idx + 2
                if curr < len(tokens) and tokens[curr][0] != "RPAREN":
                    while True:
                        if curr >= len(tokens):
                            raise InvariantSyntaxError(f"Unclosed parenthesis in function {fn_name}")
                        if tokens[curr][0] in ("IDENTIFIER", "NUMBER"):
                            args.append(tokens[curr][1])
                            curr += 1
                        else:
                            raise InvariantSyntaxError(f"Invalid argument in {fn_name}: {tokens[curr][1]}")
                        if curr < len(tokens) and tokens[curr][0] == "COMMA":
                            curr += 1
                        else:
                            break
                if curr >= len(tokens) or tokens[curr][0] != "RPAREN":
                    raise InvariantSyntaxError(f"Expected closing parenthesis after {fn_name}")
                return {"type": "FunctionCall", "name": fn_name, "args": args}, curr + 1

            # Simple property reference like output.total_amount or input.row_count
            parts = val.split(".")
            if len(parts) == 1:
                return {"type": "Variable", "name": parts[0]}, idx + 1
            elif len(parts) == 2:
                dataset, metric_or_field = parts[0], parts[1]
                return {
                    "type": "Metric",
                    "dataset": dataset,
                    "property": metric_or_field,
                    "full_name": val
                }, idx + 1
            else:
                return {"type": "NestedMetric", "parts": parts, "full_name": val}, idx + 1

        raise InvariantSyntaxError(f"Unexpected token '{val}' of type {tok_type}")

    @classmethod
    def validate(cls, expression: str) -> Dict[str, Any]:
        try:
            tokens = cls.tokenize(expression)
            ast = cls.parse(expression)
            return {
                "is_valid": True,
                "ast": ast,
                "tokens": [f"{t[0]}:{t[1]}" for t in tokens],
                "error_message": None
            }
        except Exception as e:
            return {
                "is_valid": False,
                "ast": None,
                "tokens": None,
                "error_message": str(e)
            }
