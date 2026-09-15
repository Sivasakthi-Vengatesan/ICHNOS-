import React, { useState } from 'react';
import { VersionDiffResponse } from '../types';
import { GitBranch, Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface TimeTravelDiffProps {
  diffData: VersionDiffResponse | null;
  onSelectVersionPair: (fromV: string, toV: string) => void;
  onOpenCounterexample?: () => void;
}

const VERSIONS = ['v1', 'v2', 'v3', 'v4'];
const VERSION_STATUSES: Record<string, 'VERIFIED' | 'VIOLATED'> = {
  v1: 'VERIFIED',
  v2: 'VERIFIED',
  v3: 'VIOLATED',
  v4: 'VERIFIED',
};

export const TimeTravelDiff: React.FC<TimeTravelDiffProps> = ({
  diffData,
  onSelectVersionPair,
  onOpenCounterexample
}) => {
  const [fromVer, setFromVer] = useState(diffData?.from_version || 'v2');
  const [toVer, setToVer] = useState(diffData?.to_version || 'v3');

  const handleFromChange = (v: string) => {
    setFromVer(v);
    onSelectVersionPair(v, toVer);
  };

  const handleToChange = (v: string) => {
    setToVer(v);
    onSelectVersionPair(fromVer, v);
  };

  return (
    <div className="border-4 border-[#111111] bg-[#FFFFFF] shadow-bauhaus flex flex-col">
      {/* Header Bar */}
      <div className="p-4 border-b-2 border-[#111111] bg-[#E6E2D8] flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-[#111111]" />
          <span className="text-xs uppercase font-bold tracking-widest text-[#111111]">
            TIME TRAVEL: GIT-STYLE DIFF & VERIFICATION REGRESSION
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold">
          <span>COMPARING:</span>
          <span className="bg-[#FFFFFF] px-2 py-1 border-2 border-[#111111] text-[#111111]">
            {fromVer} ({VERSION_STATUSES[fromVer]})
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#111111]" />
          <span className={`px-2 py-1 border-2 border-[#111111] ${toVer === 'v3' ? 'bg-[#D02020] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#111111]'}`}>
            {toVer} ({VERSION_STATUSES[toVer]})
          </span>
        </div>
      </div>

      {/* Version Timeline Ribbon */}
      <div className="p-6 bg-[#F4F1E8] border-b-2 border-[#111111]">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#66635D] block mb-3">
          PIPELINE VERSION EVOLUTION TIMELINE
        </span>

        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-[#111111] -translate-y-1/2 -z-0"></div>

          {VERSIONS.map((v) => {
            const status = VERSION_STATUSES[v];
            const isFrom = fromVer === v;
            const isTo = toVer === v;
            const isViolated = status === 'VIOLATED';

            return (
              <div key={v} className="flex flex-col items-center gap-2 z-10">
                <button
                  onClick={() => {
                    if (fromVer !== v) handleToChange(v);
                  }}
                  className={`w-12 h-12 flex flex-col items-center justify-center border-4 border-[#111111] transition-all font-mono font-bold ${
                    isTo
                      ? 'bg-[#DDE51A] text-[#111111] shadow-bauhaus-sm scale-110'
                      : isFrom
                      ? 'bg-[#111111] text-[#FFFFFF] shadow-bauhaus-sm'
                      : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#E6E2D8]'
                  }`}
                >
                  <span className="text-xs uppercase">{v}</span>
                  <span className={`text-[10px] ${isViolated ? 'text-[#D02020] font-black' : 'text-[#168A52]'}`}>
                    {isViolated ? '✗' : '✓'}
                  </span>
                </button>
                <span className="text-[10px] font-mono uppercase font-bold text-[#66635D]">
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regression Alert Banner if Violated */}
      {diffData?.regression_detected && (
        <div className="p-4 bg-[#D02020] text-[#FFFFFF] border-b-2 border-[#111111] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold">
            <AlertTriangle className="w-5 h-5 text-[#DDE51A]" />
            <span>CRITICAL REGRESSION: Pipeline transitioned from VERIFIED ({fromVer}) to VIOLATED ({toVer})!</span>
          </div>
          {onOpenCounterexample && (
            <button
              onClick={onOpenCounterexample}
              className="btn-bauhaus bg-[#DDE51A] text-[#111111] text-xs font-bold uppercase tracking-wider px-3 py-1.5 border-2 border-[#111111]"
            >
              VIEW VIOLATING RECORD →
            </button>
          )}
        </div>
      )}

      {/* Side-by-Side Diff Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#111111]">
        {/* Left: Transformation Code AST Diff */}
        <div className="p-6 bg-[#FFFFFF]">
          <h4 className="text-xs uppercase font-bold tracking-widest text-[#66635D] mb-3">
            TRANSFORMATION LOGIC DIFF ({fromVer} → {toVer})
          </h4>
          <div className="p-4 bg-[#111111] text-[#FAFAFA] border-2 border-[#111111] font-mono text-xs space-y-1 overflow-x-auto shadow-inner">
            {diffData?.transformation_diff && diffData.transformation_diff.length > 0 ? (
              diffData.transformation_diff.map((line, idx) => {
                let color = 'text-[#FAFAFA]';
                let bg = '';
                if (line.type === 'added') {
                  color = 'text-[#168A52] font-bold';
                  bg = 'bg-[#168A52]/10';
                } else if (line.type === 'removed') {
                  color = 'text-[#D02020] font-bold';
                  bg = 'bg-[#D02020]/10';
                }
                return (
                  <div key={idx} className={`p-1 ${bg} ${color}`}>
                    {line.content}
                  </div>
                );
              })
            ) : (
              <div className="text-[#66635D]">No transformation changes between versions.</div>
            )}
          </div>
        </div>

        {/* Right: Schema & Invariant Status Comparison */}
        <div className="p-6 bg-[#F4F1E8] flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs uppercase font-bold tracking-widest text-[#66635D] mb-2">
                SCHEMA CONTRACT EVOLUTION
              </h4>
              <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111] font-mono text-xs">
                <span className="font-bold text-[#111111]">
                  {diffData?.schema_diff?.summary || 'Schema identical across versions.'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase font-bold tracking-widest text-[#66635D] mb-2">
                AFFECTED INVARIANTS & VERIFICATION OUTCOME
              </h4>
              <div className="space-y-2">
                {diffData?.invariant_changes.map((inv, i) => (
                  <div key={i} className="p-3 bg-[#FFFFFF] border-2 border-[#111111] shadow-bauhaus-sm font-mono text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#111111]">{inv.invariant_name}</span>
                      <span className={`font-bold ${inv.to_status === 'VIOLATED' ? 'text-[#D02020]' : 'text-[#168A52]'}`}>
                        {inv.from_status} → {inv.to_status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#66635D] truncate">
                      {inv.expression}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-[#111111] text-[10px] font-mono text-[#66635D] uppercase">
            FORMAL REASONING COMPARISON: DETERMINISTIC REGRESSION TRACE
          </div>
        </div>
      </div>
    </div>
  );
};
