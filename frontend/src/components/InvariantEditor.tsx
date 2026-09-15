import React, { useState, useEffect } from 'react';
import { validateInvariantDSL } from '../services/api';
import { Code, CheckCircle, AlertTriangle, Play, Sparkles } from 'lucide-react';

interface InvariantEditorProps {
  initialExpression?: string;
  onVerifyExpression?: (expression: string) => void;
  isVerifying?: boolean;
}

const TEMPLATES = [
  {
    name: 'PAYMENT_COMPLETENESS',
    expr: 'ASSERT output.total_amount == input.total_amount - refunded.total_amount',
    desc: 'Ensures net payment aggregation preserves non-refunded transactions.'
  },
  {
    name: 'ROW_CONSERVATION',
    expr: 'ASSERT output.row_count + rejected.row_count == input.row_count',
    desc: 'Proves no rows are leaked across intermediate filter steps.'
  },
  {
    name: 'NON_NEGATIVE_REVENUE',
    expr: 'ASSERT output.total_amount >= 0',
    desc: 'Guarantees calculated revenues are non-negative.'
  },
  {
    name: 'NULL_TOLERANCE_CHECK',
    expr: 'ASSERT output.null_count(region) == 0',
    desc: 'Enforces zero null values in critical partition columns.'
  }
];

export const InvariantEditor: React.FC<InvariantEditorProps> = ({
  initialExpression = 'ASSERT output.total_amount == input.total_amount - refunded.total_amount',
  onVerifyExpression,
  isVerifying
}) => {
  const [expression, setExpression] = useState(initialExpression);
  const [validationResult, setValidationResult] = useState<{ is_valid: boolean; ast?: any; error_message?: string }>({ is_valid: true });
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setIsValidating(true);
      const res = await validateInvariantDSL(expression);
      if (active) {
        setValidationResult(res);
        setIsValidating(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [expression]);

  return (
    <div className="border-4 border-[#111111] bg-[#FFFFFF] shadow-bauhaus flex flex-col">
      {/* Editor Header Bar */}
      <div className="p-4 border-b-2 border-[#111111] bg-[#E6E2D8] flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-[#111111]" />
          <span className="text-xs uppercase font-bold tracking-widest text-[#111111]">
            INVARIANT DSL COMPILER & EDITOR
          </span>
        </div>

        {/* Validation Status Badge */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {isValidating ? (
            <span className="text-[#66635D]">VALIDATING AST...</span>
          ) : validationResult.is_valid ? (
            <div className="flex items-center gap-1 text-[#168A52] font-bold bg-[#FFFFFF] px-2 py-0.5 border border-[#111111]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>SYNTAX VALID</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[#D02020] font-bold bg-[#FFFFFF] px-2 py-0.5 border border-[#111111]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SYNTAX ERROR</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Template Selector Buttons */}
      <div className="p-3 bg-[#F4F1E8] border-b-2 border-[#111111] flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-[#66635D] tracking-wider">
          TEMPLATES:
        </span>
        {TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.name}
            onClick={() => setExpression(tmpl.expr)}
            className="px-2.5 py-1 bg-[#FFFFFF] border-2 border-[#111111] text-[11px] font-mono font-bold hover:bg-[#DDE51A] transition-colors"
          >
            {tmpl.name}
          </button>
        ))}
      </div>

      {/* Editor Code Area */}
      <div className="p-6 bg-[#FFFFFF] flex flex-col gap-4">
        <div>
          <label className="text-xs uppercase font-bold tracking-widest text-[#66635D] block mb-2">
            DECLARATIVE ASSERTION SPECIFICATION
          </label>
          <textarea
            id="invariant-dsl-textarea"
            rows={4}
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="w-full p-4 bg-[#F4F1E8] border-2 border-[#111111] font-mono text-sm font-bold text-[#111111] focus:outline-none focus:border-[#DDE51A] shadow-inner resize-none leading-relaxed"
            placeholder="ASSERT output.total_amount == input.total_amount - refunded.total_amount"
          />
        </div>

        {/* AST Representation Box */}
        {validationResult.ast && (
          <div>
            <label className="text-xs uppercase font-bold tracking-widest text-[#66635D] block mb-1">
              COMPILED ABSTRACT SYNTAX TREE (AST)
            </label>
            <pre className="p-3 bg-[#111111] text-[#DDE51A] border-2 border-[#111111] font-mono text-xs max-h-36 overflow-y-auto">
              {JSON.stringify(validationResult.ast, null, 2)}
            </pre>
          </div>
        )}

        {/* Error Output */}
        {!validationResult.is_valid && validationResult.error_message && (
          <div className="p-3 bg-[#D02020]/10 border-2 border-[#D02020] text-[#D02020] font-mono text-xs font-bold">
            PARSE ERROR: {validationResult.error_message}
          </div>
        )}
      </div>

      {/* Footer Run Verification Button */}
      <div className="p-4 bg-[#E6E2D8] border-t-2 border-[#111111] flex items-center justify-between">
        <span className="text-xs font-mono text-[#66635D]">
          FIRST-ORDER SMT FORMAL COMPILER
        </span>
        <button
          id="btn-verify-invariant-dsl"
          onClick={() => onVerifyExpression && onVerifyExpression(expression)}
          disabled={!validationResult.is_valid || isVerifying}
          className="btn-bauhaus bg-[#DDE51A] text-[#111111] font-bold text-xs uppercase tracking-widest px-6 py-2.5 border-2 border-[#111111] shadow-bauhaus hover:bg-[#c9d010] active:shadow-none flex items-center gap-2 disabled:opacity-50"
        >
          {isVerifying ? (
            <span>SOLVING SMT PROOF...</span>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-[#111111]" />
              <span>TEST INVARIANT WITH Z3</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
