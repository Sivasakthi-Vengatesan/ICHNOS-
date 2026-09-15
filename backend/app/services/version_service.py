from typing import Dict, Any, List, Optional
from app.services.schema_tracker import SchemaTracker

class VersionService:
    """
    Manages pipeline version comparisons, Git-like transformation diffs,
    and formal verification regression tracking.
    """

    @classmethod
    def compare_versions(
        cls,
        pipeline_id: str,
        from_version_data: Dict[str, Any],
        to_version_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        from_ver = from_version_data.get("version", "v1")
        to_ver = to_version_data.get("version", "v2")
        from_status = from_version_data.get("verification_status", "VERIFIED")
        to_status = to_version_data.get("verification_status", "VERIFIED")

        from_ir = from_version_data.get("transformation_ir", [])
        to_ir = to_version_data.get("transformation_ir", [])

        # Build transformation diff list
        diff_lines = []
        max_len = max(len(from_ir), len(to_ir))
        for i in range(max_len):
            old_step = from_ir[i] if i < len(from_ir) else None
            new_step = to_ir[i] if i < len(to_ir) else None

            if old_step == new_step:
                expr = old_step.get("expression") or f"{old_step.get('op')}({old_step.get('column', '')})"
                diff_lines.append({
                    "type": "unchanged",
                    "step_number": i + 1,
                    "content": f"  {old_step.get('op')} {expr}"
                })
            elif old_step and not new_step:
                expr = old_step.get("expression") or f"{old_step.get('op')}({old_step.get('column', '')})"
                diff_lines.append({
                    "type": "removed",
                    "step_number": i + 1,
                    "content": f"- {old_step.get('op')} {expr}"
                })
            elif new_step and not old_step:
                expr = new_step.get("expression") or f"{new_step.get('op')}({new_step.get('column', '')})"
                diff_lines.append({
                    "type": "added",
                    "step_number": i + 1,
                    "content": f"+ {new_step.get('op')} {expr}"
                })
            else:
                old_expr = old_step.get("expression") or f"{old_step.get('op')}({old_step.get('column', '')})"
                new_expr = new_step.get("expression") or f"{new_step.get('op')}({new_step.get('column', '')})"
                diff_lines.append({
                    "type": "removed",
                    "step_number": i + 1,
                    "content": f"- {old_step.get('op')} {old_expr}"
                })
                diff_lines.append({
                    "type": "added",
                    "step_number": i + 1,
                    "content": f"+ {new_step.get('op')} {new_expr}"
                })

        schema_diff = SchemaTracker.diff_schemas(
            from_version_data.get("schema_def", {}),
            to_version_data.get("schema_def", {})
        )

        regression_detected = (from_status == "VERIFIED" and to_status == "VIOLATED")

        invariant_changes = [
            {
                "invariant_name": "PAYMENT_COMPLETENESS",
                "expression": "output.total_amount == input.total_amount - refunded.total_amount",
                "from_status": from_status,
                "to_status": to_status,
                "regression": regression_detected
            }
        ]

        counterexample = to_version_data.get("counterexample") if to_status == "VIOLATED" else None

        return {
            "pipeline_id": pipeline_id,
            "from_version": from_ver,
            "to_version": to_ver,
            "from_status": from_status,
            "to_status": to_status,
            "transformation_diff": diff_lines,
            "schema_diff": schema_diff,
            "invariant_changes": invariant_changes,
            "regression_detected": regression_detected,
            "counterexample": counterexample
        }
