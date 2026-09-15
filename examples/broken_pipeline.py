#!/usr/bin/env python3
"""
Broken Orders Pipeline Demo Script.
Accidentally drops Order 2, violating the invariant:
ASSERT output.total_amount == input.total_amount - refunded.total_amount
"""
import pandas as pd

def run_broken_pipeline():
    orders = pd.DataFrame([
        {"id": 1, "amount": 500.0, "status": "PAID"},
        {"id": 2, "amount": 300.0, "status": "PAID"},
        {"id": 3, "amount": 200.0, "status": "REFUNDED"},
    ])

    input_total = orders["amount"].sum()
    refunded_total = orders[orders["status"] == "REFUNDED"]["amount"].sum()
    expected_output_total = input_total - refunded_total  # 1000 - 200 = 800

    # Broken Transformation: (orders["status"] == "PAID") & (orders["id"] != 2)
    paid_orders = orders[(orders["status"] == "PAID") & (orders["id"] != 2)]
    actual_output_total = paid_orders["amount"].sum()  # 500

    print(f"--- BROKEN PIPELINE RUN ---")
    print(f"Input Total:           {input_total}")
    print(f"Refunded Total:        {refunded_total}")
    print(f"Expected Output Total: {expected_output_total}")
    print(f"Actual Output Total:   {actual_output_total}")
    print(f"STATUS: {'VERIFIED ✓' if expected_output_total == actual_output_total else 'VIOLATED ✗'}")
    print(f"Difference (Violation Impact): {expected_output_total - actual_output_total}")

if __name__ == "__main__":
    run_broken_pipeline()
