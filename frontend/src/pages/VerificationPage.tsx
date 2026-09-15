import React, { useState } from 'react';
import { VerificationResponse } from '../types';
import { VerificationResult } from '../components/VerificationResult';
import { CounterexampleReport } from '../components/CounterexampleReport';
import { runVerification } from '../services/api';
import { ShieldCheck, Play, RefreshCw, Layers, Code, AlertTriangle } from 'lucide-react';

interface VerificationPageProps {
  currentVerification: VerificationResponse | null;
  onNavigate?: (screen: any) => void;
  onRefreshVerification: () => void;
  isVerifying: boolean;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({
  currentVerification,
  onNavigate,
  onRefreshVerification,
  isVerifying
}) => {
  const [activePipelineVersion, setActivePipelineVersion] = useState<'v1' | 'v2' | 'v3' | 'v4'>('v3');
  const [verificationResult, setVerificationResult] = useState<VerificationResponse | null>(currentVerification);
  const [localSolving, setLocalSolving] = useState(false);
  const [showPlayground, setShowPlayground] = useState(false);

  // Custom playground state
  const [customExpression, setCustomExpression] = useState('ASSERT output.total_amount == input.total_amount - refunded.total_amount');
  const [customFilterExclusion, setCustomFilterExclusion] = useState(true);

  const handleSolveVersion = async (ver: 'v1' | 'v2' | 'v3' | 'v4') => {
    setActivePipelineVersion(ver);
    setLocalSolving(true);
    const res = await runVerification({
      pipeline_id: 'orders_pipeline',
      version_id: ver
    });
    setVerificationResult(res);
    setLocalSolving(false);
  };

  const handleSolvePlayground = async () => {
    setLocalSolving(true);
    const ir = customFilterExclusion
      ? [
          { op: 'FILTER', column: 'status', operator: '==', value: 'PAID', expression: "status == 'PAID' and id != 2", node_name: 'clean_orders' },
          { op: 'AGGREGATE_SUM', column: 'amount', node_name: 'revenue_daily' }
        ]
      : [
          { op: 'FILTER', column: 'status', operator: '==', value: 'PAID', expression: "status == 'PAID'", node_name: 'clean_orders' },
          { op: 'AGGREGATE_SUM', column: 'amount', node_name: 'revenue_daily' }
        ];

    const res = await runVerification({
      custom_pipeline_ir: ir,
      custom_invariant_expression: customExpression
    });
    setVerificationResult(res);
    setLocalSolving(false);
  };

  const activeResult = verificationResult || currentVerification;

  return (
    <div className="flex flex-col gap-8">
      {/* Numbered Section Heading */}
      <div className="flex flex-wrap items-center justify-between border-b-4 border-[#111111] pb-4 gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl md:text-2xl font-black bg-[#111111] text-[#DDE51A] px-3 py-1">
            05 /
          </span>
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#111111] leading-none uppercase">
              FORMAL SMT VERIFICATION BENCH
            </h2>
            <p className="text-xs uppercase font-mono tracking-widest text-[#66635D] mt-1 font-bold">
              FIRST-ORDER LOGICAL SAT/UNSAT REASONING // SOUND PIPELINE PROOFS
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPlayground(!showPlayground)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 border-[#111111] transition-colors ${
              showPlayground ? 'bg-[#111111] text-[#DDE51A]' : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#F4F1E8]'
            }`}
          >
            {showPlayground ? 'HIDE SMT PLAYGROUND' : 'OPEN SMT PLAYGROUND'}
          </button>
        </div>
      </div>

      {/* Target Pipeline Version Selector Bar */}
      <div className="p-4 bg-[#FFFFFF] border-4 border-[#111111] shadow-bauhaus-sm flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#66635D]">TARGET VERSION:</span>
          {(['v1', 'v2', 'v3', 'v4'] as const).map((v) => (
            <button
              key={v}
              onClick={() => handleSolveVersion(v)}
              disabled={localSolving}
              className={`px-3 py-1.5 font-bold uppercase border-2 border-[#111111] ${
                activePipelineVersion === v
                  ? v === 'v3'
                    ? 'bg-[#D02020] text-[#FFFFFF]'
                    : 'bg-[#168A52] text-[#FFFFFF]'
                  : 'bg-[#F4F1E8] text-[#111111] hover:bg-[#E6E2D8]'
              }`}
            >
              {v} {v === 'v3' ? '(VIOLATED BUG)' : '(PROVEN)'}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleSolveVersion(activePipelineVersion)}
          disabled={localSolving}
          className="btn-bauhaus bg-[#DDE51A] text-[#111111] font-bold text-xs uppercase tracking-widest px-4 py-1.5 border-2 border-[#111111] flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${localSolving ? 'animate-spin' : ''}`} />
          <span>{localSolving ? 'QUERYING Z3...' : 'RE-SOLVE'}</span>
        </button>
      </div>

      {/* SMT Interactive Playground Drawer */}
      {showPlayground && (
        <div className="p-6 bg-[#F4F1E8] border-4 border-[#111111] shadow-bauhaus flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-[#111111]" />
              <span className="text-xs uppercase font-bold tracking-widest text-[#111111]">
                INTERACTIVE SMT SANDBOX // LIVE FIRST-ORDER LOGIC INJECTION
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#66635D]">
              Z3 THEOREM PROVER
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
                TRANSFORMATION FILTER PREDICATE BEHAVIOR
              </label>
              <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="radio"
                    name="filterBehavior"
                    checked={customFilterExclusion}
                    onChange={() => setCustomFilterExclusion(true)}
                    className="accent-[#D02020]"
                  />
                  <span className="text-[#D02020]">BUGGY FILTER: status == 'PAID' and id != 2 (Drops Order #2)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="radio"
                    name="filterBehavior"
                    checked={!customFilterExclusion}
                    onChange={() => setCustomFilterExclusion(false)}
                    className="accent-[#168A52]"
                  />
                  <span className="text-[#168A52]">CORRECT FILTER: status == 'PAID' (Preserves all PAID orders)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
                DECLARED INVARIANT FORMULA
              </label>
              <input
                type="text"
                value={customExpression}
                onChange={(e) => setCustomExpression(e.target.value)}
                className="w-full p-3 bg-[#FFFFFF] border-2 border-[#111111] font-bold text-xs text-[#111111] focus:outline-none focus:border-[#DDE51A]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t-2 border-[#111111]">
            <button
              onClick={handleSolvePlayground}
              disabled={localSolving}
              className="btn-bauhaus bg-[#111111] text-[#DDE51A] font-bold text-xs uppercase tracking-widest px-6 py-2 border-2 border-[#111111] shadow-bauhaus-sm hover:bg-[#222222] flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-[#DDE51A]" />
              <span>RUN LIVE PROVER IN Z3</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Verification Result Card */}
      <VerificationResult
        data={activeResult}
        onOpenCounterexample={() => {
          const el = document.getElementById('counterexample-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Incident Counterexample Report (Visible on SAT Violations) */}
      {activeResult?.result === 'VIOLATED' && activeResult.counterexample && (
        <div id="counterexample-section">
          <CounterexampleReport
            data={activeResult.counterexample}
            explanation={activeResult.explanation}
            rootTransformation={activeResult.root_transformation}
            onTraceInLineage={() => onNavigate && onNavigate('lineage')}
          />
        </div>
      )}
    </div>
  );
};
