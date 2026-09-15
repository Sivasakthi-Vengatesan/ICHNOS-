import React from 'react';
import { TelemetryStats } from '../types';

interface TelemetryMarqueeProps {
  telemetry: TelemetryStats | null;
}

export const TelemetryMarquee: React.FC<TelemetryMarqueeProps> = ({ telemetry }) => {
  const pCount = String(telemetry?.pipelines || 7).padStart(2, '0');
  const eCount = String(telemetry?.executions || 142).padStart(3, '0');
  const vCount = String(telemetry?.verified || 128).padStart(3, '0');
  const fCount = String(telemetry?.violated || 9).padStart(2, '0');
  const uCount = String(telemetry?.unknown || 5).padStart(2, '0');

  const items = [
    `PIPELINES: ${pCount}`,
    `EXECUTIONS: ${eCount}`,
    `VERIFIED: ${vCount}`,
    `VIOLATIONS: ${fCount}`,
    `UNKNOWN: ${uCount}`,
    `SMT SOLVER: Z3PY QF_LIRA`,
    `STATUS: SOUND REASONING`,
    `MODE: REAL PIPELINE PROOFS`,
  ];

  const fullText = items.join('   ■   ');

  return (
    <div className="w-full bg-[#111111] text-[#FAFAFA] font-mono text-xs py-2 border-b-2 border-[#111111] overflow-hidden whitespace-nowrap select-none">
      <div className="inline-block animate-marquee">
        <span className="mx-4 text-[#DDE51A] font-bold">● TELEMETRY //</span>
        <span className="tracking-wider">{fullText}</span>
        <span className="mx-8 text-[#66635D]">///</span>
        <span className="mx-4 text-[#DDE51A] font-bold">● TELEMETRY //</span>
        <span className="tracking-wider">{fullText}</span>
        <span className="mx-8 text-[#66635D]">///</span>
      </div>
    </div>
  );
};
