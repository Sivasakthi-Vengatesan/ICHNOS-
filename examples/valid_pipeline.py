#!/usr/bin/env python3
"""
Valid Orders Pipeline Demo Script.
Preserves all PAID orders and satisfies the invariant:
ASSERT output.total_amount == input.total_amount - refunded.total_amount
"""
import pandas as pd

def run_valid_pipeline():
    orders = pd.DataFrame([
        {"id": 1, "amount": 500.0, "status": "PAID"},
        {"id": 2, "amount": 300.0, "status": "PAID"},
        {"id": 3, "amount": 200.0, "status": "REFUNDED"},
    ])

    input_total = orders["amount"].sum()
    refunded_total = orders[orders["status"] == "REFUNDED"]["amount"].sum()
    expected_output_total = input_total - refunded_total  # 1000 - 200 = 800

    # Correct Transformation
    paid_orders = orders[orders["status"] == "PAID"]
    actual_output_total = paid_orders["amount"].sum()

    print(f"--- VALID PIPELINE RUN ---")
    print(f"Input Total:           {input_total}")
    print(f"Refunded Total:        {refunded_total}")
    print(f"Expected Output Total: {expected_output_total}")
    print(f"Actual Output Total:   {actual_output_total}")
    print(f"STATUS: {'VERIFIED ✓' if expected_output_total == actual_output_total else 'VIOLATED ✗'}")

if __name__ == "__main__":
    run_valid_pipeline()
