import React from 'react';
import { VerificationResponse } from '../types';
import { ShieldCheck, AlertOctagon, HelpCircle, Clock, Cpu, Check } from 'lucide-react';

interface VerificationResultProps {
  data: VerificationResponse | null;
  onOpenCounterexample?: () => void;
}

export const VerificationResult: React.FC<VerificationResultProps> = ({
  data,
  onOpenCounterexample
}) => {
  if (!data) {
    return (
      <div className="p-8 bg-[#FFFFFF] border-4 border-[#111111] shadow-bauhaus text-center font-mono">
        <span className="text-xs uppercase tracking-widest text-[#66635D]">
          NO VERIFICATION RUN ACTIVE. CLICK [RUN VERIFICATION] TO SOLVE.
        </span>
      </div>
    );
  }

  const isVerified = data.result === 'VERIFIED';
  const isViolated = data.result === 'VIOLATED';
  const isUnknown = data.result === 'UNKNOWN';

  let statusBg = 'bg-[#168A52]';
  let statusText = 'text-[#FFFFFF]';
  let statusBorder = 'border-[#111111]';
  let statusTitle = 'FORMALLY VERIFIED';
  let solverResultDisplay = 'UNSAT';

  if (isViolated) {
    statusBg = 'bg-[#D02020]';
    statusText = 'text-[#FFFFFF]';
    statusTitle = 'FORMALLY VIOLATED';
    solverResultDisplay = 'SAT';
  } else if (isUnknown) {
    statusBg = 'bg-[#D49A00]';
    statusText = 'text-[#111111]';
    statusTitle = 'UNKNOWN / UNSUPPORTED';
    solverResultDisplay = 'UNKNOWN';
  }

  return (
    <div className="border-4 border-[#111111] bg-[#FFFFFF] shadow-bauhaus flex flex-col">
      {/* Massive Status Header Banner */}
      <div className={`p-6 ${statusBg} ${statusText} border-b-4 border-[#111111] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#111111] text-[#FAFAFA] flex items-center justify-center border-2 border-[#111111] text-2xl font-black shrink-0">
            {isVerified && '✓'}
            {isViolated && '✗'}
            {isUnknown && '?'}
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest bg-[#111111] text-[#DDE51A] px-2 py-0.5">
              FORMAL SMT PROOF RESULT
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mt-1">
              {statusTitle}
            </h2>
          </div>
        </div>

        {/* Solver Telemetry Box */}
        <div className="bg-[#111111] text-[#FAFAFA] border-2 border-[#111111] p-3 font-mono text-xs flex flex-col gap-1 min-w-[180px]">
          <div className="flex items-center justify-between text-[#DDE51A]">
            <span>SOLVER:</span>
            <span className="font-bold">{data.solver_name.toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>RESULT:</span>
            <span className="font-bold text-[#FFFFFF]">{solverResultDisplay}</span>
          </div>
          <div className="flex items-center justify-between text-[#E6E2D8]">
            <span>SOLVE TIME:</span>
            <span>{data.solver_time_ms} ms</span>
          </div>
        </div>
      </div>

      {/* Invariant Declaration Box */}
      <div className="p-6 border-b-2 border-[#111111] bg-[#F4F1E8]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#66635D]">
            PROVEN INVARIANT PROPERTY
          </span>
          <span className="font-mono text-xs font-bold text-[#111111] bg-[#E6E2D8] px-2 py-0.5 border border-[#111111]">
            {data.invariant_name || 'INV-001'}
          </span>
        </div>
        <div className="p-4 bg-[#FFFFFF] border-2 border-[#111111] font-mono text-sm font-bold text-[#111111] overflow-x-auto shadow-bauhaus-sm">
          {data.invariant_expression}
        </div>
      </div>

      {/* Interpretation & Active Logic Constraints */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FFFFFF]">
        <div>
          <h4 className="text-xs uppercase font-bold tracking-widest text-[#66635D] mb-2">
            FORMAL INTERPRETATION
          </h4>
          <p className="text-sm font-medium text-[#111111] leading-relaxed p-3 bg-[#F4F1E8] border-2 border-[#111111]">
            {data.interpretation}
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase font-bold tracking-widest text-[#66635D] mb-2">
            ACTIVE SOLVER CONSTRAINTS
          </h4>
          <div className="p-3 bg-[#F4F1E8] border-2 border-[#111111] font-mono text-xs space-y-1">
            {data.active_constraints && data.active_constraints.length > 0 ? (
              data.active_constraints.map((c, i) => (
                <div key={i} className="text-[#111111] truncate">
                  • {c}
                </div>
              ))
            ) : (
              <div className="text-[#66635D]">Standard domain constraints applied.</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Action Bar for SAT Violations */}
      {isViolated && (
        <div className="p-4 bg-[#E6E2D8] border-t-2 border-[#111111] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D02020]">
            <AlertOctagon className="w-4 h-4" />
            <span>COUNTEREXAMPLE EXTRACTED FROM SAT SOLVER MODEL</span>
          </div>
          {onOpenCounterexample && (
            <button
              id="btn-inspect-counterexample"
              onClick={onOpenCounterexample}
              className="btn-bauhaus bg-[#D02020] text-[#FFFFFF] text-xs uppercase font-bold tracking-widest px-4 py-2 border-2 border-[#111111] shadow-bauhaus-sm hover:bg-[#b01818]"
            >
              INSPECT COUNTEREXAMPLE REPORT →
            </button>
          )}
        </div>
      )}
    </div>
  );
};
