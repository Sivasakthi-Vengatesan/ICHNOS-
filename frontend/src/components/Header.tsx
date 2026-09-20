import React from 'react';
import { Activity, ShieldCheck, Cpu, Play } from 'lucide-react';
import { TelemetryStats } from '../types';

interface HeaderProps {
  telemetry: TelemetryStats | null;
  onQuickVerify?: () => void;
  isVerifying?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ telemetry, onQuickVerify, isVerifying }) => {
  return (
    <header className="w-full bg-[#F4F1E8] border-b-4 border-[#111111] px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none">
      {/* Brand Identity & Logo */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#111111] flex items-center justify-center border-2 border-[#111111] shadow-bauhaus-sm">
          <div className="w-5 h-5 bg-[#DDE51A] flex items-center justify-center font-bold text-xs text-[#111111]">
            I
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-black tracking-tighter text-[#111111] leading-none">
              ICHNOS
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-[#111111] text-[#DDE51A] px-1.5 py-0.5">
              LAB INSTRUMENT
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest text-[#66635D] font-mono mt-0.5 font-bold">
            SMT-POWERED DATA LINEAGE & INVARIANT PROOF ENGINE
          </p>
        </div>
      </div>

      {/* Center Instrument Telemetry Badges */}
      <div className="hidden lg:flex items-center gap-3 font-mono text-xs">
        <div className="bg-[#FFFFFF] border-2 border-[#111111] px-3 py-1.5 flex items-center gap-2 shadow-bauhaus-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-[#168A52] animate-pulse"></div>
          <span className="font-bold text-[#111111]">SOLVER:</span>
          <span className="text-[#66635D]">{telemetry?.solver || 'Z3 SMT v4.13'}</span>
        </div>

        <div className="bg-[#FFFFFF] border-2 border-[#111111] px-3 py-1.5 flex items-center gap-2 shadow-bauhaus-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-[#168A52]" />
          <span className="font-bold text-[#111111]">VERIFIED:</span>
          <span className="font-bold text-[#168A52]">{telemetry?.verified || 128}</span>
        </div>

        <div className="bg-[#FFFFFF] border-2 border-[#111111] px-3 py-1.5 flex items-center gap-2 shadow-bauhaus-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D02020]"></div>
          <span className="font-bold text-[#111111]">VIOLATED:</span>
          <span className="font-bold text-[#D02020]">{telemetry?.violated || 9}</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        <button
          id="btn-run-verification-header"
          onClick={onQuickVerify}
          disabled={isVerifying}
          className="btn-bauhaus bg-[#DDE51A] text-[#111111] font-bold text-xs uppercase tracking-widest px-4 py-2.5 border-2 border-[#111111] shadow-bauhaus hover:bg-[#c9d010] active:shadow-none flex items-center gap-2 disabled:opacity-50"
        >
          {isVerifying ? (
            <>
              <div className="w-3 h-3 border-2 border-[#111111] border-t-transparent animate-spin"></div>
              <span>SOLVING WITH Z3...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-[#111111]" />
              <span>RUN VERIFICATION</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
