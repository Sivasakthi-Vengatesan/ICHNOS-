import React, { useState } from 'react';
import { Invariant } from '../types';
import { InvariantEditor } from '../components/InvariantEditor';
import { Code, ShieldCheck, CheckCircle, Plus, ArrowRight } from 'lucide-react';

interface InvariantsPageProps {
  invariants: Invariant[];
  onVerifyExpression: (expression: string) => void;
  isVerifying: boolean;
  onNavigate?: (screen: any) => void;
}

export const InvariantsPage: React.FC<InvariantsPageProps> = ({
  invariants,
  onVerifyExpression,
  isVerifying,
  onNavigate
}) => {
  const [selectedInvariant, setSelectedInvariant] = useState<Invariant>(invariants[0]);

  return (
    <div className="flex flex-col gap-8">
      {/* Numbered Section Heading */}
      <div className="flex items-center justify-between border-b-4 border-[#111111] pb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl md:text-2xl font-black bg-[#111111] text-[#DDE51A] px-3 py-1">
            06 /
          </span>
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#111111] leading-none uppercase">
              DECLARATIVE INVARIANT LANGUAGE & RULES
            </h2>
            <p className="text-xs uppercase font-mono tracking-widest text-[#66635D] mt-1 font-bold">
              FORMAL BUSINESS SPECIFICATIONS COMPILED TO FIRST-ORDER SMT CONSTRAINTS
            </p>
          </div>
        </div>
      </div>

      {/* Invariant DSL IDE Editor */}
      <InvariantEditor
        initialExpression={selectedInvariant?.expression || 'ASSERT output.total_amount == input.total_amount - refunded.total_amount'}
        onVerifyExpression={onVerifyExpression}
        isVerifying={isVerifying}
      />

      {/* Invariant Declarations Registry */}
      <div className="border-4 border-[#111111] bg-[#FFFFFF] shadow-bauhaus flex flex-col">
        <div className="p-4 border-b-2 border-[#111111] bg-[#E6E2D8] flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-widest text-[#111111]">
            REGISTERED INVARIANT SPECIFICATIONS ({invariants.length})
          </span>
          <span className="font-mono text-xs text-[#66635D]">
            Z3 QF_LIRA COMPLIANT
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {invariants.map((inv) => (
            <div
              key={inv.id}
              onClick={() => setSelectedInvariant(inv)}
              className={`p-5 border-2 border-[#111111] cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                selectedInvariant?.id === inv.id
                  ? 'bg-[#DDE51A] shadow-bauhaus'
                  : 'bg-[#F4F1E8] hover:bg-[#E6E2D8] shadow-bauhaus-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold bg-[#111111] text-[#FAFAFA] px-1.5 py-0.5">
                    {inv.severity}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#168A52]">
                    ACTIVE
                  </span>
                </div>

                <h4 className="text-sm font-black text-[#111111] mb-2 uppercase font-mono">
                  {inv.name}
                </h4>

                <div className="p-2 bg-[#FFFFFF] border border-[#111111] font-mono text-xs font-bold text-[#111111] mb-3">
                  {inv.expression}
                </div>

                <p className="text-xs text-[#66635D] font-medium leading-relaxed">
                  {inv.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#111111]/20 flex items-center justify-between text-[10px] font-mono text-[#66635D]">
                <span>SCOPE: {inv.pipeline_id}</span>
                <span className="font-bold text-[#111111]">LOAD IN EDITOR →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
