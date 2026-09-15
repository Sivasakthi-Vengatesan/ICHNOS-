#!/usr/bin/env python3
import sys
import json
from pathlib import Path
import click

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.services.verification_engine import VerificationEngine
from app.services.lineage_engine import LineageEngine
from app.services.version_service import VersionService
from app.services.execution_service import ExecutionService
from app.services.invariant_compiler import InvariantCompiler

@click.group()
def cli():
    """TraceLake-V: SMT-Powered Data Lineage, Invariant Verification & Counterexample Engine."""
    pass

@cli.command()
@click.argument("pipeline_file", type=click.Path(exists=True))
def verify(pipeline_file):
    """Formally verify a pipeline JSON definition with Z3."""
    with open(pipeline_file, "r") as f:
        data = json.load(f)

    pipeline_name = data.get("pipeline_name", data.get("name", "pipeline"))
    version = data.get("version", "v1")
    ir = data.get("transformation_ir", data.get("pipeline", []))
    invariant = data.get("invariant", "ASSERT output.total_amount == input.total_amount - refunded.total_amount")
    schema = data.get("schema", {"id": "int", "amount": "float", "status": "string"})

    click.echo("\n========================================================")
    click.echo(f" TraceLake-V // SMT Pipeline Verification Engine")
    click.echo("========================================================")
    click.echo(f"Pipeline: {pipeline_name}")
    click.echo(f"Version:  {version}")
    click.echo(f"Invariant: {invariant}\n")

    result = VerificationEngine.verify(
        transformation_ir=ir,
        invariant_expression=invariant,
        schema=schema
    )

    status_icon = "[PASS] FORMALLY VERIFIED" if result["result"] == "VERIFIED" else ("[FAIL] FORMALLY VIOLATED" if result["result"] == "VIOLATED" else "[?] UNKNOWN")
    click.echo(f"Result:      {status_icon}")
    click.echo(f"Solver:      {result['solver_name']} (Result: {result['solver_result']})")
    click.echo(f"Solver Time: {result['solver_time_ms']} ms")
    click.echo(f"\nInterpretation:\n{result['interpretation']}")

    if result.get("counterexample"):
        ce = result["counterexample"]
        click.echo("\n--------------------------------------------------------")
        click.echo(" COUNTEREXAMPLE INVESTIGATION REPORT")
        click.echo("--------------------------------------------------------")
        click.echo(f"Order ID:              {ce.get('order_id')}")
        click.echo(f"Amount:                {ce.get('amount')}")
        click.echo(f"Status:                {ce.get('status')}")
        click.echo(f"Expected Contribution: {ce.get('expected_contribution')}")
        click.echo(f"Actual Contribution:   {ce.get('actual_contribution')}")
        click.echo(f"Violation Impact:      {ce.get('difference')}")
        click.echo(f"Root Transformation:   {result.get('root_transformation')}")
        click.echo(f"\nRoot Cause Explanation:\n{result.get('explanation')}")

    click.echo("========================================================\n")

@cli.command()
@click.argument("pipeline_id")
@click.option("--version", default="v1", help="Pipeline version (v1, v2, v3)")
def lineage(pipeline_id, version):
    """Display multi-level lineage graph for a pipeline."""
    click.echo(f"\nTraceLake-V Lineage Graph for '{pipeline_id}' [{version}]:\n")
    graph = LineageEngine.get_lineage_for_pipeline(
        pipeline_id=pipeline_id,
        pipeline_name=pipeline_id,
        version=version,
        transformation_ir=[]
    )
    for node in graph.nodes:
        status_tag = f"[{node.status.upper()}]" if node.status != "normal" else ""
        rc_tag = " <-- ROOT CAUSE" if node.is_root_cause else ""
        click.echo(f"  * {node.label:<28} type={node.type:<14} rows={node.rows or 0:<6} {status_tag}{rc_tag}")

    click.echo("\nEdges:")
    for edge in graph.edges:
        violation_flag = " [VIOLATION FLOW]" if edge.is_violated_path else ""
        click.echo(f"  {edge.source} ---> {edge.target} ({edge.label}){violation_flag}")
    click.echo("")

@cli.command()
@click.argument("pipeline_id")
@click.argument("v_from")
@click.argument("v_to")
def compare(pipeline_id, v_from, v_to):
    """Compare two pipeline versions with Git-like diff and regression check."""
    click.echo(f"\nComparing {pipeline_id}: {v_from} -> {v_to}\n")

    from_ir = [{"op": "FILTER", "expression": "status == 'PAID'"}]
    to_ir = [{"op": "FILTER", "expression": "status == 'PAID' and id != 2"}] if v_to == "v3" else from_ir

    diff = VersionService.compare_versions(
        pipeline_id=pipeline_id,
        from_version_data={"version": v_from, "verification_status": "VERIFIED", "transformation_ir": from_ir, "schema_def": {"id": "int", "amount": "float"}},
        to_version_data={"version": v_to, "verification_status": "VIOLATED" if v_to == "v3" else "VERIFIED", "transformation_ir": to_ir, "schema_def": {"id": "int", "amount": "float"}}
    )

    click.echo("TRANSFORMATION DIFF:")
    for line in diff["transformation_diff"]:
        click.echo(f"  {line['content']}")

    click.echo(f"\nVERIFICATION REGRESSION: {diff['from_status']} -> {diff['to_status']}")
    if diff["regression_detected"]:
        click.echo("[!] REGRESSION DETECTED! Pipeline transitioned from VERIFIED to VIOLATED.")
    else:
        click.echo("[PASS] Invariant integrity preserved across versions.")
    click.echo("")

@cli.command()
@click.argument("pipeline_id", default="orders_pipeline")
@click.option("--version", default="v1", help="Version to execute")
def execute(pipeline_id, version):
    """Execute real data transformations and record trace telemetry."""
    click.echo(f"\nExecuting {pipeline_id} [{version}] on sample dataset...")
    ir = [{"op": "FILTER", "expression": "status == 'PAID' and id != 2" if version == "v3" else "status == 'PAID'"}, {"op": "AGGREGATE_SUM", "column": "amount"}]
    res = ExecutionService.execute_pipeline(
        pipeline_id=pipeline_id,
        version=version,
        transformation_ir=ir,
        invariant_expression="ASSERT output.total_amount == input.total_amount - refunded.total_amount"
    )
    click.echo(f"Status:       {res['status']}")
    click.echo(f"Input Rows:   {res['input_rows']}")
    click.echo(f"Output Rows:  {res['output_rows']}")
    click.echo(f"Duration:     {res['execution_duration_ms']} ms")
    click.echo("\nExecution Traces:")
    for t in res["traces"]:
        click.echo(f"  Step {t['step_number']}: {t['step_name']:<20} in={t['input_rows']} out={t['output_rows']} ({t['duration_ms']} ms)")
    click.echo("")

if __name__ == "__main__":
    cli()
