import React, { useState } from 'react';
import { Execution } from '../types';
import { ExecutionTraceViewer } from '../components/ExecutionTraceViewer';
import { Activity, Play, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface ExecutionsPageProps {
  executions: Execution[];
  onTriggerExecution: () => void;
  isExecuting: boolean;
}

export const ExecutionsPage: React.FC<ExecutionsPageProps> = ({
  executions,
  onTriggerExecution,
  isExecuting
}) => {
  const [selectedExecId, setSelectedExecId] = useState<string>(executions[0]?.id || 'exec_0042');

  const selectedExec = executions.find((e) => e.id === selectedExecId) || executions[0];

  return (
    <div className="flex flex-col gap-8">
      {/* Numbered Section Heading */}
      <div className="flex items-center justify-between border-b-4 border-[#111111] pb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl md:text-2xl font-black bg-[#111111] text-[#DDE51A] px-3 py-1">
            03 /
          </span>
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#111111] leading-none uppercase">
              EXECUTION HISTORICAL TRACE ENGINE
            </h2>
            <p className="text-xs uppercase font-mono tracking-widest text-[#66635D] mt-1 font-bold">
              OBSERVED ROW-LEVEL TRACES, TIMESTAMPS, METRICS & INVARIANT RUNS
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerExecution}
          disabled={isExecuting}
          className="btn-bauhaus bg-[#DDE51A] text-[#111111] font-bold text-xs uppercase tracking-widest px-4 py-2.5 border-2 border-[#111111] shadow-bauhaus hover:bg-[#c9d010] flex items-center gap-2 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-[#111111]" />
          <span>{isExecuting ? 'EXECUTING DATASET...' : 'RUN EXECUTION'}</span>
        </button>
      </div>

      {/* Execution Detail Trace Inspector */}
      <ExecutionTraceViewer
        execution={selectedExec}
        onTriggerExecution={onTriggerExecution}
        isExecuting={isExecuting}
      />

      {/* Dense Technical Table of Execution Records */}
      <div className="border-4 border-[#111111] bg-[#FFFFFF] shadow-bauhaus flex flex-col">
        <div className="p-4 border-b-2 border-[#111111] bg-[#E6E2D8] flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-widest text-[#111111]">
            EXECUTIONS LEDGER ({executions.length} RECORDED)
          </span>
          <span className="font-mono text-xs text-[#66635D]">
            REAL ROW COUNTS & MEASURED WALL TIME
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F1E8] border-b-2 border-[#111111]">
                <th className="p-3 font-bold uppercase text-[#66635D]">EXECUTION ID</th>
                <th className="p-3 font-bold uppercase text-[#66635D]">PIPELINE / VERSION</th>
                <th className="p-3 font-bold uppercase text-[#66635D]">STATUS</th>
                <th className="p-3 font-bold uppercase text-[#66635D]">INPUT ROWS</th>
                <th className="p-3 font-bold uppercase text-[#66635D]">OUTPUT ROWS</th>
                <th className="p-3 font-bold uppercase text-[#66635D]">WALL TIME</th>
                <th className="p-3 font-bold uppercase text-[#66635D] text-right">INSPECT</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#111111]">
              {executions.map((exec) => {
                const isSelected = exec.id === selectedExecId;
                const isViolated = exec.status === 'VIOLATED';

                return (
                  <tr
                    key={exec.id}
                    onClick={() => setSelectedExecId(exec.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#DDE51A]' : 'hover:bg-[#F4F1E8]'
                    }`}
                  >
                    <td className="p-3 font-bold text-[#111111]">{exec.id}</td>
                    <td className="p-3 text-[#111111]">{exec.pipeline_version_id}</td>
                    <td className="p-3">
                      {isViolated ? (
                        <span className="bg-[#D02020] text-[#FFFFFF] px-2 py-0.5 font-bold text-[10px] border border-[#111111]">
                          ✗ VIOLATED
                        </span>
                      ) : (
                        <span className="bg-[#168A52] text-[#FFFFFF] px-2 py-0.5 font-bold text-[10px] border border-[#111111]">
                          ✓ SUCCESS
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[#111111]">{exec.input_rows.toLocaleString()}</td>
                    <td className="p-3 text-[#111111]">{exec.output_rows.toLocaleString()}</td>
                    <td className="p-3 text-[#66635D]">{exec.execution_duration_ms} ms</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExecId(exec.id);
                        }}
                        className="px-2.5 py-1 bg-[#FFFFFF] text-[#111111] border border-[#111111] font-bold text-[10px] hover:bg-[#E6E2D8]"
                      >
                        SELECT
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
