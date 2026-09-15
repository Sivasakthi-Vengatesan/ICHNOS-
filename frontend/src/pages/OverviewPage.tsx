import React from 'react';
import { TelemetryStats, Pipeline, VerificationResponse } from '../types';
import { ShieldCheck, AlertOctagon, HelpCircle, Activity, Play, ArrowRight, GitBranch, Layers } from 'lucide-react';

interface OverviewPageProps {
  telemetry: TelemetryStats | null;
  pipelines: Pipeline[];
  verification: VerificationResponse | null;
  onNavigate: (screen: any) => void;
  onRunVerification: () => void;
  isVerifying: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  telemetry,
  pipelines,
  verification,
  onNavigate,
  onRunVerification,
  isVerifying
}) => {
  const pCount = String(telemetry?.pipelines || 7).padStart(2, '0');
  const eCount = String(telemetry?.executions || 142).padStart(3, '0');
  const vCount = String(telemetry?.verified || 128).padStart(3, '0');
  const fCount = String(telemetry?.violated || 9).padStart(2, '0');
  const uCount = String(telemetry?.unknown || 5).padStart(2, '0');

  return (
    <div className="flex flex-col gap-8">
      {/* Numbered Section Heading */}
      <div className="flex items-center gap-3 border-b-4 border-[#111111] pb-4">
        <span className="font-mono text-xl md:text-2xl font-black bg-[#111111] text-[#DDE51A] px-3 py-1">
          01 /
        </span>
        <div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#111111] leading-none uppercase">
            SYSTEM OVERVIEW // LABORATORY INSTRUMENT
          </h2>
          <p className="text-xs uppercase font-mono tracking-widest text-[#66635D] mt-1 font-bold">
            FORMAL SMT VERIFICATION ENGINE & DATA LINEAGE SURVEILLANCE
          </p>
        </div>
      </div>

      {/* Hero Constructivist Banner */}
      <div className="border-4 border-[#111111] bg-[#FFFFFF] shadow-bauhaus grid grid-cols-1 lg:grid-cols-3 divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-[#111111]">
        <div className="p-8 lg:col-span-2 bg-[#F4F1E8] flex flex-col justify-between">
          <div>
            <div className="inline-block bg-[#111111] text-[#DDE51A] font-mono text-xs font-bold uppercase tracking-widest px-2 py-1 mb-4">
              ACTIVE REASONING ENGINE
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-[#111111] leading-[0.88] uppercase mb-4">
              DATA<br />UNDER<br />PROOF.
            </h1>
            <p className="text-base md:text-lg text-[#111111] font-medium max-w-xl leading-relaxed">
              TraceLake-V computes mathematical proofs of data transformation invariants with Z3 SMT.
              Detect logic regressions, extract minimal counterexamples, and explore column lineage through time.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onRunVerification}
              disabled={isVerifying}
              className="btn-bauhaus bg-[#DDE51A] text-[#111111] font-bold text-sm uppercase tracking-widest px-6 py-3.5 border-2 border-[#111111] shadow-bauhaus hover:bg-[#c9d010] flex items-center gap-3 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-[#111111]" />
              <span>{isVerifying ? 'SOLVING PROOFS WITH Z3...' : 'EXECUTE VERIFICATION SUITE'}</span>
            </button>
            <button
              onClick={() => onNavigate('lineage')}
              className="btn-bauhaus bg-[#FFFFFF] text-[#111111] font-bold text-sm uppercase tracking-widest px-6 py-3.5 border-2 border-[#111111] shadow-bauhaus hover:bg-[#E6E2D8] flex items-center gap-2"
            >
              <span>INSPECT LINEAGE DAG</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Hero Side: Quick SMT Status Snapshot */}
        <div className="p-8 bg-[#FFFFFF] flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#66635D] block mb-3">
              LATEST SMT VERIFICATION STATE
            </span>
            <div className={`p-4 border-4 border-[#111111] ${verification?.result === 'VIOLATED' ? 'bg-[#D02020] text-[#FFFFFF]' : 'bg-[#168A52] text-[#FFFFFF]'} shadow-bauhaus-sm mb-4`}>
              <div className="text-[10px] uppercase font-mono font-bold tracking-widest opacity-90">
                RESULT: {verification?.solver_result || 'UNSAT'}
              </div>
              <div className="text-2xl md:text-3xl font-black tracking-tight leading-none mt-1">
                {verification?.result === 'VIOLATED' ? 'FORMALLY VIOLATED' : 'FORMALLY VERIFIED'}
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#111111]/20">
                <span className="text-[#66635D]">SOLVER TIME:</span>
                <span className="font-bold text-[#111111]">{verification?.solver_time_ms || 14.2} ms</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#111111]/20">
                <span className="text-[#66635D]">PIPELINE:</span>
                <span className="font-bold text-[#111111]">orders_pipeline (v3)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#66635D]">INVARIANT:</span>
                <span className="font-bold text-[#111111]">PAYMENT_COMPLETENESS</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-[#111111] mt-6">
            <button
              onClick={() => onNavigate('verification')}
              className="w-full text-center py-2.5 bg-[#111111] text-[#DDE51A] font-bold text-xs uppercase tracking-widest hover:bg-[#222222] transition-colors"
            >
              OPEN VERIFICATION BENCH →
            </button>
          </div>
        </div>
      </div>

      {/* Massive System Statistics 5-Column Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-6 bg-[#FFFFFF] border-4 border-[#111111] shadow-bauhaus flex flex-col justify-between">
          <span className="text-xs uppercase font-bold tracking-widest text-[#66635D]">
            PIPELINES
          </span>
          <span className="text-5xl md:text-6xl font-black font-mono text-[#111111] my-2">
            {pCount}
          </span>
          <span className="text-[10px] font-mono text-[#66635D] uppercase font-bold">
            REGISTERED SCHEMAS
          </span>
        </div>

        <div className="p-6 bg-[#FFFFFF] border-4 border-[#111111] shadow-bauhaus flex flex-col justify-between">
          <span className="text-xs uppercase font-bold tracking-widest text-[#66635D]">
            EXECUTIONS
          </span>
          <span className="text-5xl md:text-6xl font-black font-mono text-[#111111] my-2">
            {eCount}
          </span>
          <span className="text-[10px] font-mono text-[#66635D] uppercase font-bold">
            MEASURED TRACES
          </span>
        </div>

        <div className="p-6 bg-[#FFFFFF] border-4 border-[#168A52] shadow-bauhaus-green flex flex-col justify-between">
          <span className="text-xs uppercase font-bold tracking-widest text-[#168A52]">
            VERIFIED
          </span>
          <span className="text-5xl md:text-6xl font-black font-mono text-[#168A52] my-2">
            {vCount}
          </span>
          <span className="text-[10px] font-mono text-[#168A52] uppercase font-bold">
            Z3 UNSAT PROOFS
          </span>
        </div>

        <div className="p-6 bg-[#FFFFFF] border-4 border-[#D02020] shadow-bauhaus-red flex flex-col justify-between">
          <span className="text-xs uppercase font-bold tracking-widest text-[#D02020]">
            VIOLATED
          </span>
          <span className="text-5xl md:text-6xl font-black font-mono text-[#D02020] my-2">
            {fCount}
          </span>
          <span className="text-[10px] font-mono text-[#D02020] uppercase font-bold">
            SAT COUNTEREXAMPLES
          </span>
        </div>

        <div className="p-6 bg-[#FFFFFF] border-4 border-[#D49A00] shadow-bauhaus flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-xs uppercase font-bold tracking-widest text-[#D49A00]">
            UNKNOWN
          </span>
          <span className="text-5xl md:text-6xl font-black font-mono text-[#D49A00] my-2">
            {uCount}
          </span>
          <span className="text-[10px] font-mono text-[#66635D] uppercase font-bold">
            UNSUPPORTED UDFS
          </span>
        </div>
      </div>

      {/* Active Pipelines Grid / Table */}
      <div className="border-4 border-[#111111] bg-[#FFFFFF] shadow-bauhaus flex flex-col">
        <div className="p-4 border-b-2 border-[#111111] bg-[#E6E2D8] flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-widest text-[#111111]">
            MONITORED PIPELINES & GROUND TRUTH
          </span>
          <button
            onClick={() => onNavigate('pipelines')}
            className="text-xs font-bold uppercase tracking-wider text-[#111111] hover:underline"
          >
            VIEW ALL PIPELINES →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F1E8] border-b-2 border-[#111111]">
                <th className="p-3 font-bold uppercase text-[#66635D]">ID</th>
                <th className="p-3 font-bold uppercase text-[#66635D]">PIPELINE NAME</th>
                <th className="p-3 font-bold uppercase text-[#66635D]">SOURCE INGEST</th>
                <th className="p-3 font-bold uppercase text-[#66635D]">VERSIONS</th>
                <th className="p-3 font-bold uppercase text-[#66635D]">LATEST STATUS</th>
                <th className="p-3 font-bold uppercase text-[#66635D] text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#111111]">
              <tr className="hover:bg-[#F4F1E8]">
                <td className="p-3 font-bold text-[#111111]">001</td>
                <td className="p-3 font-bold text-[#111111]">orders_pipeline</td>
                <td className="p-3 text-[#2457C5]">Kafka / orders.raw</td>
                <td className="p-3">v1, v2, v3, v4</td>
                <td className="p-3">
                  <span className="inline-block bg-[#D02020] text-[#FFFFFF] px-2 py-0.5 font-bold text-[10px]">
                    ✗ VIOLATED (v3)
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => onNavigate('verification')}
                    className="px-3 py-1 bg-[#DDE51A] text-[#111111] border border-[#111111] font-bold text-[10px] hover:bg-[#c9d010]"
                  >
                    INSPECT
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-[#F4F1E8]">
                <td className="p-3 font-bold text-[#111111]">002</td>
                <td className="p-3 font-bold text-[#111111]">payments_reconciliation</td>
                <td className="p-3 text-[#2457C5]">Stripe Webhook / S3</td>
                <td className="p-3">v1</td>
                <td className="p-3">
                  <span className="inline-block bg-[#168A52] text-[#FFFFFF] px-2 py-0.5 font-bold text-[10px]">
                    ✓ VERIFIED (v1)
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => onNavigate('verification')}
                    className="px-3 py-1 bg-[#FFFFFF] text-[#111111] border border-[#111111] font-bold text-[10px] hover:bg-[#E6E2D8]"
                  >
                    INSPECT
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-[#F4F1E8]">
                <td className="p-3 font-bold text-[#111111]">003</td>
                <td className="p-3 font-bold text-[#111111]">inventory_warehouse</td>
                <td className="p-3 text-[#2457C5]">Warehouse ERP</td>
                <td className="p-3">v1</td>
                <td className="p-3">
                  <span className="inline-block bg-[#168A52] text-[#FFFFFF] px-2 py-0.5 font-bold text-[10px]">
                    ✓ VERIFIED (v1)
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => onNavigate('verification')}
                    className="px-3 py-1 bg-[#FFFFFF] text-[#111111] border border-[#111111] font-bold text-[10px] hover:bg-[#E6E2D8]"
                  >
                    INSPECT
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
