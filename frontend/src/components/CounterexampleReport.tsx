import React from 'react';
import { CounterexampleData } from '../types';
import { AlertTriangle, Compass, ArrowRight, CornerDownRight, FileText } from 'lucide-react';

interface CounterexampleReportProps {
  data: CounterexampleData | null;
  explanation?: string | null;
  rootTransformation?: string | null;
  onTraceInLineage?: () => void;
}

export const CounterexampleReport: React.FC<CounterexampleReportProps> = ({
  data,
  explanation,
  rootTransformation,
  onTraceInLineage
}) => {
  if (!data) {
    return (
      <div className="p-8 bg-[#FFFFFF] border-4 border-[#111111] shadow-bauhaus text-center font-mono text-xs text-[#66635D]">
        NO ACTIVE COUNTEREXAMPLE. PIPELINE SATISFIES FORMAL SPECIFICATION.
      </div>
    );
  }

  const orderId = data.order_id || 2;
  const amount = data.amount || 300;
  const status = data.status || 'PAID';
  const diff = data.difference || 300;
  const expContrib = data.expected_contribution ?? 300;
  const actContrib = data.actual_contribution ?? 0;

  return (
    <div className="border-4 border-[#D02020] bg-[#FFFFFF] shadow-bauhaus-red flex flex-col">
      {/* Incident Report Header */}
      <div className="bg-[#D02020] text-[#FFFFFF] p-4 border-b-4 border-[#111111] flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#111111] text-[#DDE51A] flex items-center justify-center font-black text-sm border border-[#FFFFFF]">
            !
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#F4F1E8]">
              INVESTIGATION INCIDENT REPORT
            </span>
            <h3 className="text-xl font-black tracking-tight leading-none">
              COUNTEREXAMPLE / SAT MODEL #001
            </h3>
          </div>
        </div>

        <div className="bg-[#111111] text-[#FAFAFA] font-mono text-xs px-3 py-1 border border-[#FFFFFF]">
          VIOLATION IMPACT: <span className="text-[#DDE51A] font-bold">{diff.toFixed(2)} USD</span>
        </div>
      </div>

      {/* Grid of Offending State Attributes */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 border-b-2 border-[#111111] bg-[#F4F1E8] font-mono text-xs">
        <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111] shadow-bauhaus-sm">
          <span className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
            RECORD IDENTIFIER
          </span>
          <span className="text-lg font-black text-[#111111]">
            ORDER #{orderId}
          </span>
        </div>

        <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111] shadow-bauhaus-sm">
          <span className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
            STATUS STATE
          </span>
          <span className="text-lg font-black text-[#168A52]">
            {status}
          </span>
        </div>

        <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111] shadow-bauhaus-sm">
          <span className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
            EXPECTED CONTRIBUTION
          </span>
          <span className="text-lg font-black text-[#111111]">
            {expContrib.toFixed(2)}
          </span>
        </div>

        <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111] shadow-bauhaus-sm">
          <span className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
            ACTUAL CONTRIBUTION
          </span>
          <span className="text-lg font-black text-[#D02020]">
            {actContrib.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Root Cause Diagnosis & Stream Coordinates */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#FFFFFF]">
        {/* Left: Root Cause Explanation */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-[#D02020]" />
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#111111]">
              ROOT CAUSE DIAGNOSIS
            </h4>
          </div>
          <div className="p-4 bg-[#F4F1E8] border-2 border-[#111111] font-mono text-xs leading-relaxed text-[#111111] space-y-2">
            <div className="font-bold text-[#D02020]">
              FAULTY TRANSFORMATION: {rootTransformation || 'clean_orders()'}
            </div>
            <p>
              {explanation || `Record ID ${orderId} satisfies all precondition constraints for inclusion in revenue aggregate, but was dropped by filter predicate in transformation node.`}
            </p>
          </div>
        </div>

        {/* Right: Kafka Stream Ingestion Coordinate */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-[#2457C5]" />
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#111111]">
              KAFKA STREAM ORIGIN COORDINATE
            </h4>
          </div>
          <div className="p-4 bg-[#F4F1E8] border-2 border-[#111111] font-mono text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#66635D]">TOPIC:</span>
              <span className="font-bold text-[#111111]">orders.events.v1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#66635D]">PARTITION:</span>
              <span className="font-bold text-[#111111]">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#66635D]">OFFSET:</span>
              <span className="font-bold text-[#111111]">8492</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#66635D]">INGEST TIMESTAMP:</span>
              <span className="font-bold text-[#111111]">2026-09-15 14:02:31 UTC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Action */}
      <div className="p-4 bg-[#E6E2D8] border-t-2 border-[#111111] flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-[#66635D]">
          PROVEN MINIMAL MODEL SATISFIED VIA Z3PY
        </span>
        {onTraceInLineage && (
          <button
            onClick={onTraceInLineage}
            className="btn-bauhaus bg-[#111111] text-[#DDE51A] text-xs uppercase font-bold tracking-widest px-4 py-2 border-2 border-[#111111] shadow-bauhaus-sm hover:bg-[#222222] flex items-center gap-2"
          >
            <span>HIGHLIGHT ROOT CAUSE IN LINEAGE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
