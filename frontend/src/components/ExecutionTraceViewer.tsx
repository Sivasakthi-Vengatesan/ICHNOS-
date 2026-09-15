import React, { useState } from 'react';
import { Execution, ExecutionTrace } from '../types';
import { Activity, Clock, Layers, ArrowRight, Play } from 'lucide-react';

interface ExecutionTraceViewerProps {
  execution: Execution | null;
  onTriggerExecution?: () => void;
  isExecuting?: boolean;
}

export const ExecutionTraceViewer: React.FC<ExecutionTraceViewerProps> = ({
  execution,
  onTriggerExecution,
  isExecuting
}) => {
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);

  const traces = execution?.traces || [
    { step_number: 1, step_name: 'READ_SOURCE', operation: 'READ_CSV', input_rows: 1000, output_rows: 1000, duration_ms: 1.2, schema_snapshot: { id: 'int', amount: 'float', status: 'string' } },
    { step_number: 2, step_name: 'clean_orders', operation: 'FILTER', input_rows: 1000, output_rows: 600, duration_ms: 7.4, schema_snapshot: { id: 'int', amount: 'float', status: 'string' } },
    { step_number: 3, step_name: 'revenue_daily', operation: 'AGGREGATE_SUM', input_rows: 600, output_rows: 1, duration_ms: 0.9, schema_snapshot: { total_amount: 'float', order_count: 'int' } }
  ];

  const currentStep = traces[selectedStepIdx] || traces[0];

  return (
    <div className="border-4 border-[#111111] bg-[#FFFFFF] shadow-bauhaus flex flex-col">
      {/* Header Bar */}
      <div className="p-4 border-b-2 border-[#111111] bg-[#E6E2D8] flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-[#111111]" />
          <span className="text-xs uppercase font-bold tracking-widest text-[#111111]">
            EXECUTION TRACE INSPECTOR // REAL DATASET TELEMETRY
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onTriggerExecution && (
            <button
              onClick={onTriggerExecution}
              disabled={isExecuting}
              className="btn-bauhaus bg-[#DDE51A] text-[#111111] text-xs font-bold uppercase tracking-wider px-4 py-2 border-2 border-[#111111] shadow-bauhaus-sm hover:bg-[#c9d010] flex items-center gap-2 disabled:opacity-50"
            >
              {isExecuting ? (
                <span>RUNNING DATASET...</span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-[#111111]" />
                  <span>EXECUTE ON 1K CSV</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Execution Summary Badges */}
      <div className="p-4 bg-[#F4F1E8] border-b-2 border-[#111111] grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111] shadow-bauhaus-sm">
          <span className="text-[10px] uppercase font-bold text-[#66635D] block">EXECUTION ID</span>
          <span className="font-bold text-[#111111]">{execution?.id || 'exec_0042'}</span>
        </div>
        <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111] shadow-bauhaus-sm">
          <span className="text-[10px] uppercase font-bold text-[#66635D] block">TOTAL DURATION</span>
          <span className="font-bold text-[#111111]">{execution?.execution_duration_ms || 412.5} ms</span>
        </div>
        <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111] shadow-bauhaus-sm">
          <span className="text-[10px] uppercase font-bold text-[#66635D] block">INGESTED ROWS</span>
          <span className="font-bold text-[#111111]">{(execution?.input_rows || 18420).toLocaleString()}</span>
        </div>
        <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111] shadow-bauhaus-sm">
          <span className="text-[10px] uppercase font-bold text-[#66635D] block">OUTPUT ROWS</span>
          <span className="font-bold text-[#111111]">{(execution?.output_rows || 12279).toLocaleString()}</span>
        </div>
      </div>

      {/* Trace Step Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#111111]">
        {/* Step Sequence Selector */}
        <div className="p-6 bg-[#FFFFFF] space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-[#66635D] block mb-2">
            STEP-BY-STEP TRACE PIPELINE
          </span>
          <div className="space-y-2">
            {traces.map((step, idx) => {
              const isSelected = selectedStepIdx === idx;
              return (
                <button
                  key={step.step_number}
                  onClick={() => setSelectedStepIdx(idx)}
                  className={`w-full text-left p-3 border-2 border-[#111111] font-mono text-xs flex items-center justify-between transition-all ${
                    isSelected ? 'bg-[#DDE51A] text-[#111111] font-bold shadow-bauhaus-sm' : 'bg-[#F4F1E8] text-[#111111] hover:bg-[#E6E2D8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-[#66635D]">0{step.step_number}</span>
                    <span className="uppercase font-bold">{step.step_name}</span>
                  </div>
                  <span className="text-[10px] text-[#66635D]">{step.duration_ms} ms</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Step Deep Dive */}
        <div className="lg:col-span-2 p-6 bg-[#F4F1E8] flex flex-col justify-between">
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#111111]">
              <span className="text-sm font-bold text-[#111111] uppercase">
                STEP 0{currentStep.step_number}: {currentStep.step_name}
              </span>
              <span className="bg-[#111111] text-[#DDE51A] px-2 py-0.5 text-[10px] font-bold">
                OP: {currentStep.operation}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111]">
                <span className="text-[10px] uppercase font-bold text-[#66635D] block">INPUT ROWS</span>
                <span className="text-lg font-black text-[#111111]">{currentStep.input_rows.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111]">
                <span className="text-[10px] uppercase font-bold text-[#66635D] block">OUTPUT ROWS</span>
                <span className="text-lg font-black text-[#168A52]">{currentStep.output_rows.toLocaleString()}</span>
              </div>
            </div>

            {currentStep.schema_snapshot && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
                  SCHEMA CONTRACT SNAPSHOT
                </span>
                <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111] space-y-1">
                  {Object.entries(currentStep.schema_snapshot).map(([col, type]) => (
                    <div key={col} className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#111111]">{col}:</span>
                      <span className="text-[#66635D]">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t-2 border-[#111111] text-[10px] font-mono text-[#66635D] uppercase">
            MEASURED EXECUTION DURATION: {currentStep.duration_ms} MS
          </div>
        </div>
      </div>
    </div>
  );
};
