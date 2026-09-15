import React, { useState } from 'react';
import { LineageGraphResponse, LineageNode, LineageEdge } from '../types';
import { Database, Filter, Layers, ArrowRight, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';

interface LineageGraphProps {
  data: LineageGraphResponse | null;
  onSelectNode?: (node: LineageNode) => void;
  selectedNodeId?: string | null;
}

export const LineageGraph: React.FC<LineageGraphProps> = ({
  data,
  onSelectNode,
  selectedNodeId
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'column'>('table');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  if (!data) {
    return (
      <div className="p-8 bg-[#FFFFFF] border-2 border-[#111111] text-center font-mono text-sm text-[#66635D]">
        NO LINEAGE DATA AVAILABLE. SELECT A PIPELINE TO RENDER DAG.
      </div>
    );
  }

  const selectedNode = data.nodes.find((n) => n.id === selectedNodeId) || data.nodes[2];

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'source':
        return <Database className="w-4 h-4 text-[#2457C5]" />;
      case 'transformation':
        return <Filter className="w-4 h-4 text-[#111111]" />;
      case 'aggregate':
        return <Layers className="w-4 h-4 text-[#168A52]" />;
      case 'sink':
        return <ArrowRight className="w-4 h-4 text-[#66635D]" />;
      default:
        return <Database className="w-4 h-4 text-[#111111]" />;
    }
  };

  return (
    <div className="flex flex-col border-4 border-[#111111] bg-[#FFFFFF] shadow-bauhaus">
      {/* Top Controls Bar */}
      <div className="p-4 border-b-2 border-[#111111] bg-[#E6E2D8] flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest bg-[#111111] text-[#FAFAFA] px-2 py-1">
            DAG VISUALIZER
          </span>
          <span className="font-bold text-sm text-[#111111]">
            {data.pipeline_name} <span className="font-mono text-xs text-[#66635D]">[{data.version}]</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-[#111111] ${
              activeTab === 'table' ? 'bg-[#111111] text-[#DDE51A]' : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#F4F1E8]'
            }`}
          >
            TABLE-LEVEL LINEAGE
          </button>
          <button
            onClick={() => setActiveTab('column')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-[#111111] ${
              activeTab === 'column' ? 'bg-[#111111] text-[#DDE51A]' : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#F4F1E8]'
            }`}
          >
            COLUMN-LEVEL LINEAGE
          </button>
        </div>
      </div>

      {/* Main Graph Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#111111]">
        {/* Left 2 Cols: Interactive Graph Flow */}
        <div className="lg:col-span-2 p-6 bg-[#F4F1E8] min-h-[420px] flex flex-col justify-center">
          {activeTab === 'table' ? (
            <div className="flex flex-col gap-6">
              {/* Sequential Node Flow */}
              <div className="flex flex-wrap items-center justify-start gap-4">
                {data.nodes.map((node, idx) => {
                  const isSelected = selectedNodeId === node.id;
                  const isViolated = node.status === 'violated';
                  const isRootCause = node.is_root_cause;

                  let cardBorder = 'border-2 border-[#111111]';
                  let cardBg = 'bg-[#FFFFFF]';
                  let shadow = 'shadow-bauhaus-sm';

                  if (isRootCause) {
                    cardBorder = 'border-4 border-[#D02020]';
                    cardBg = 'bg-[#FFFFFF]';
                    shadow = 'shadow-bauhaus-red';
                  } else if (isSelected) {
                    cardBorder = 'border-2 border-[#111111]';
                    cardBg = 'bg-[#DDE51A]';
                    shadow = 'shadow-bauhaus';
                  }

                  return (
                    <React.Fragment key={node.id}>
                      <div
                        onClick={() => onSelectNode && onSelectNode(node)}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className={`cursor-pointer p-4 min-w-[160px] max-w-[210px] ${cardBorder} ${cardBg} ${shadow} transition-all duration-150 relative hover:-translate-y-1`}
                      >
                        {isRootCause && (
                          <div className="absolute -top-3.5 left-2 bg-[#D02020] text-[#FFFFFF] text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 border border-[#111111]">
                            ROOT CAUSE
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            {getNodeIcon(node.type)}
                            <span className="text-[10px] font-mono uppercase font-bold text-[#66635D]">
                              {node.type}
                            </span>
                          </div>
                          {node.status === 'verified' && (
                            <span className="text-[10px] font-bold text-[#168A52]">✓ VERIFIED</span>
                          )}
                          {node.status === 'violated' && (
                            <span className="text-[10px] font-bold text-[#D02020]">✗ VIOLATED</span>
                          )}
                        </div>

                        <div className="font-mono text-xs font-bold text-[#111111] truncate mb-1">
                          {node.label}
                        </div>

                        {node.operation && (
                          <div className="text-[11px] font-mono text-[#2457C5] bg-[#E6E2D8] p-1 truncate mb-2 border border-[#111111]/20">
                            {node.operation}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] font-mono text-[#66635D] pt-2 border-t border-[#111111]/10">
                          <span>ROWS:</span>
                          <span className="font-bold text-[#111111]">
                            {node.rows ? node.rows.toLocaleString() : '---'}
                          </span>
                        </div>
                      </div>

                      {idx < data.nodes.length - 1 && (
                        <div className="flex items-center text-[#111111] font-mono text-xs font-bold px-1">
                          <ArrowRight className="w-5 h-5 text-[#111111]" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Visual Legend */}
              <div className="mt-8 pt-4 border-t-2 border-[#111111] flex flex-wrap items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#168A52] border border-[#111111]"></div>
                  <span>FORMALLY VERIFIED</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#D02020] border border-[#111111]"></div>
                  <span>FORMALLY VIOLATED (ROOT CAUSE)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#2457C5] border border-[#111111]"></div>
                  <span>INFORMATION FLOW</span>
                </div>
              </div>
            </div>
          ) : (
            /* Column-Level Lineage View */
            <div className="flex flex-col gap-4">
              <h4 className="text-xs uppercase font-bold tracking-widest text-[#66635D]">
                COLUMN-LEVEL TRACEABILITY CHAINS
              </h4>
              {data.column_lineage && data.column_lineage.length > 0 ? (
                <div className="space-y-3">
                  {data.column_lineage.map((colTrace, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[#FFFFFF] border-2 border-[#111111] shadow-bauhaus-sm font-mono text-xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[#2457C5]">{colTrace.transformation}</span>
                        <span className="text-[10px] uppercase font-bold text-[#66635D]">
                          MAP: {colTrace.source_column} → {colTrace.target_column}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs flex-wrap bg-[#F4F1E8] p-2 border border-[#111111]/20">
                        {colTrace.path.map((p, pIdx) => (
                          <React.Fragment key={pIdx}>
                            <span className="font-bold text-[#111111] bg-[#FFFFFF] px-2 py-0.5 border border-[#111111]">
                              {p}
                            </span>
                            {pIdx < colTrace.path.length - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-[#2457C5]" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#FFFFFF] border border-[#111111] text-xs font-mono text-[#66635D]">
                  No column mappings registered for this pipeline.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Node Inspector Panel */}
        <div className="p-6 bg-[#FFFFFF] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111] mb-4">
              <span className="text-xs uppercase font-bold tracking-widest text-[#66635D]">
                NODE INSPECTOR
              </span>
              <span className="font-mono text-xs font-bold bg-[#111111] text-[#DDE51A] px-2 py-0.5">
                {selectedNode?.id || 'node_clean_orders'}
              </span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
                  NODE LABEL
                </label>
                <div className="p-2 bg-[#F4F1E8] border-2 border-[#111111] font-bold text-[#111111]">
                  {selectedNode?.label}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
                  CLASSIFICATION & TYPE
                </label>
                <div className="p-2 bg-[#F4F1E8] border-2 border-[#111111] flex items-center justify-between">
                  <span className="uppercase font-bold text-[#2457C5]">{selectedNode?.type}</span>
                  <span className="font-bold">
                    {selectedNode?.is_root_cause ? 'CRITICAL ROOT CAUSE' : 'NORMAL'}
                  </span>
                </div>
              </div>

              {selectedNode?.operation && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
                    TRANSFORMATION EXPRESSION
                  </label>
                  <div className="p-2 bg-[#F4F1E8] border-2 border-[#111111] font-bold text-[#D02020]">
                    {selectedNode.operation}
                  </div>
                </div>
              )}

              {selectedNode?.schema_def && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
                    SCHEMA CONTRACT
                  </label>
                  <div className="p-2 bg-[#F4F1E8] border-2 border-[#111111] max-h-32 overflow-y-auto space-y-1">
                    {Object.entries(selectedNode.schema_def).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[11px]">
                        <span className="text-[#111111] font-bold">{k}:</span>
                        <span className="text-[#66635D]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-[#111111]">
            <div className="text-[10px] font-mono text-[#66635D] uppercase">
              TRACE STATUS: {selectedNode?.status?.toUpperCase() || 'VERIFIED'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
