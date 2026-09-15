export interface TransformationIROperation {
  op: string; // FILTER, SELECT, MAP, RENAME, AGGREGATE_SUM, AGGREGATE_COUNT, JOIN, DROP_NULLS
  node_name?: string;
  column?: string;
  target_column?: string;
  operator?: string;
  value?: any;
  expression?: string;
  join_type?: string;
  join_key?: string;
  right_dataset?: string;
  description?: string;
}

export interface PipelineVersion {
  id: string;
  pipeline_id: string;
  version: string;
  source_hash: string;
  transformation_ir: TransformationIROperation[];
  schema_def: Record<string, string>;
  created_at: string;
  metadata_json?: Record<string, any>;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  source_type: string;
  created_at: string;
  updated_at: string;
  versions: PipelineVersion[];
}

export interface Invariant {
  id: string;
  pipeline_id: string;
  name: string;
  description?: string;
  expression: string;
  severity: string;
  is_enabled: boolean;
  created_at: string;
}

export interface CounterexampleData {
  order_id?: any;
  amount?: number;
  status?: string;
  expected_contribution?: number;
  actual_contribution?: number;
  difference?: number;
  fields?: Record<string, any>;
}

export interface VerificationResponse {
  id?: string;
  pipeline_id?: string;
  version?: string;
  invariant_name?: string;
  invariant_expression: string;
  result: "VERIFIED" | "VIOLATED" | "UNKNOWN";
  solver_name: string;
  solver_result: "UNSAT" | "SAT" | "UNKNOWN";
  solver_time_ms: number;
  interpretation: string;
  counterexample?: CounterexampleData | null;
  explanation?: string | null;
  impact_amount?: number | null;
  root_transformation?: string | null;
  active_constraints?: string[];
  created_at?: string;
}

export interface LineageNode {
  id: string;
  label: string;
  type: string; // source, transformation, dataset, sink, aggregate
  rows?: number;
  schema_def?: Record<string, string>;
  operation?: string;
  status?: "normal" | "verified" | "violated" | "active";
  is_root_cause?: boolean;
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  edge_type: string;
  source_column?: string;
  target_column?: string;
  is_violated_path?: boolean;
}

export interface LineageGraphResponse {
  pipeline_id: string;
  pipeline_name: string;
  version: string;
  nodes: LineageNode[];
  edges: LineageEdge[];
  column_lineage?: Array<{
    source_column: string;
    target_column: string;
    transformation: string;
    path: string[];
  }>;
}

export interface ExecutionTrace {
  step_number: number;
  step_name: string;
  operation: string;
  input_rows: number;
  output_rows: number;
  duration_ms: number;
  schema_snapshot?: Record<string, string>;
}

export interface Execution {
  id: string;
  pipeline_version_id: string;
  status: string;
  started_at: string;
  completed_at: string;
  input_rows: number;
  output_rows: number;
  execution_duration_ms: number;
  execution_metadata?: Record<string, any>;
  traces?: ExecutionTrace[];
  verification_runs?: any[];
}

export interface VersionDiffResponse {
  pipeline_id: string;
  from_version: string;
  to_version: string;
  from_status: string;
  to_status: string;
  transformation_diff: Array<{
    type: "added" | "removed" | "unchanged";
    step_number: number;
    content: string;
  }>;
  schema_diff: {
    has_change: boolean;
    added_columns: Record<string, string>;
    removed_columns: Record<string, string>;
    modified_columns: Record<string, { from: string; to: string }>;
    summary: string;
  };
  invariant_changes: Array<{
    invariant_name: string;
    expression: string;
    from_status: string;
    to_status: string;
    regression: boolean;
  }>;
  regression_detected: boolean;
  counterexample?: CounterexampleData | null;
}

export interface TelemetryStats {
  pipelines: number;
  executions: number;
  verified: number;
  violated: number;
  unknown: number;
  solver: string;
  uptime_seconds: number;
  status: string;
}
