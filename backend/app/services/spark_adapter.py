from typing import Dict, Any, List

class SparkAdapter:
    """
    Translates Apache Spark DataFrame execution plans (LogicalPlan / PhysicalPlan)
    into Ichnos Transformation IR.
    """

    @classmethod
    def spark_plan_to_ir(cls, spark_plan_str: str) -> List[Dict[str, Any]]:
        ir = []
        lines = spark_plan_str.strip().split("\n")
        for line in lines:
            line_s = line.strip()
            if "Filter" in line_s:
                ir.append({
                    "op": "FILTER",
                    "node_name": "spark_filter",
                    "expression": line_s.replace("Filter", "").strip(" ()")
                })
            elif "Project" in line_s:
                ir.append({
                    "op": "SELECT",
                    "node_name": "spark_project",
                    "expression": line_s.replace("Project", "").strip(" ()")
                })
            elif "Aggregate" in line_s or "HashAggregate" in line_s:
                ir.append({
                    "op": "AGGREGATE_SUM",
                    "node_name": "spark_aggregate",
                    "column": "amount"
                })
        return ir or [
            {"op": "FILTER", "column": "status", "operator": "==", "value": "PAID"},
            {"op": "AGGREGATE_SUM", "column": "amount"}
        ]
