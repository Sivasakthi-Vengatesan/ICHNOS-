#!/usr/bin/env python3
import random
import pandas as pd
from pathlib import Path

EXAMPLES_DIR = Path(__file__).resolve().parent

def generate_datasets(num_orders: int = 1000):
    random.seed(42)
    regions = ["US-EAST", "US-WEST", "EU-CENTRAL", "AP-SOUTH", "LATAM-NORTH"]
    statuses = ["PAID", "PAID", "PAID", "REFUNDED", "PENDING"]
    payment_methods = ["CREDIT_CARD", "STRIPE", "PAYPAL", "APPLE_PAY", "WIRE"]

    orders = []
    payments = []
    refunds = []

    # Canonical demo records
    orders.append({"id": 1, "customer_id": "CUST-101", "amount": 500.0, "status": "PAID", "region": "US-EAST"})
    orders.append({"id": 2, "customer_id": "CUST-104", "amount": 300.0, "status": "PAID", "region": "US-WEST"})
    orders.append({"id": 3, "customer_id": "CUST-109", "amount": 200.0, "status": "REFUNDED", "region": "EU-CENTRAL"})

    for i in range(4, num_orders + 1):
        st = random.choice(statuses)
        amt = round(random.uniform(20.0, 1200.0), 2)
        reg = random.choice(regions)
        cust = f"CUST-{random.randint(100, 999)}"

        orders.append({
            "id": i,
            "customer_id": cust,
            "amount": amt,
            "status": st,
            "region": reg
        })

        if st == "PAID":
            payments.append({
                "payment_id": f"PAY-{i}",
                "order_id": i,
                "amount": amt,
                "method": random.choice(payment_methods),
                "gateway_fee": round(amt * 0.029 + 0.30, 2),
                "status": "SETTLED"
            })
        elif st == "REFUNDED":
            refunds.append({
                "refund_id": f"REF-{i}",
                "order_id": i,
                "amount": amt,
                "reason": "CUSTOMER_RETURN",
                "processed_at": "2026-09-15T12:00:00Z"
            })

    customers = [
        {"customer_id": f"CUST-{c}", "tier": random.choice(["PLATINUM", "GOLD", "STANDARD"]), "country": random.choice(["US", "DE", "IN", "JP", "BR"])}
        for c in range(100, 1000)
    ]

    df_orders = pd.DataFrame(orders)
    df_customers = pd.DataFrame(customers)
    df_payments = pd.DataFrame(payments)
    df_refunds = pd.DataFrame(refunds)

    df_orders.to_csv(EXAMPLES_DIR / "sample_orders.csv", index=False)
    df_customers.to_csv(EXAMPLES_DIR / "sample_customers.csv", index=False)
    df_payments.to_csv(EXAMPLES_DIR / "sample_payments.csv", index=False)
    df_refunds.to_csv(EXAMPLES_DIR / "sample_refunds.csv", index=False)

    print(f"[OK] Generated {len(df_orders)} orders in {EXAMPLES_DIR / 'sample_orders.csv'}")
    print(f"[OK] Generated {len(df_customers)} customers in {EXAMPLES_DIR / 'sample_customers.csv'}")
    print(f"[OK] Generated {len(df_payments)} payments in {EXAMPLES_DIR / 'sample_payments.csv'}")
    print(f"[OK] Generated {len(df_refunds)} refunds in {EXAMPLES_DIR / 'sample_refunds.csv'}")

if __name__ == "__main__":
    generate_datasets(1000)
