from typing import Dict, Any, List

class SchemaTracker:
    """
    Tracks column names, types, and schema evolutions across pipeline versions.
    Detects type changes, dropped columns, and added fields.
    """

    @classmethod
    def diff_schemas(cls, old_schema: Dict[str, str], new_schema: Dict[str, str]) -> Dict[str, Any]:
        added = {k: v for k, v in new_schema.items() if k not in old_schema}
        removed = {k: v for k, v in old_schema.items() if k not in new_schema}
        modified = {}
        for k in old_schema:
            if k in new_schema and old_schema[k] != new_schema[k]:
                modified[k] = {"from": old_schema[k], "to": new_schema[k]}

        has_change = bool(added or removed or modified)
        return {
            "has_change": has_change,
            "added_columns": added,
            "removed_columns": removed,
            "modified_columns": modified,
            "summary": "Schema identical" if not has_change else f"{len(added)} added, {len(removed)} removed, {len(modified)} type changes"
        }
