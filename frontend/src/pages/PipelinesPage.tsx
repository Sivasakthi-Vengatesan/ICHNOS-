import React, { useState } from 'react';
import { Pipeline, PipelineVersion } from '../types';
import { GitBranch, Plus, ArrowRight, CheckCircle, AlertTriangle, Layers, Database } from 'lucide-react';

interface PipelinesPageProps {
  pipelines: Pipeline[];
  onSelectPipeline: (pipeline: Pipeline) => void;
  onNavigate: (screen: any) => void;
}

export const PipelinesPage: React.FC<PipelinesPageProps> = ({
  pipelines,
  onSelectPipeline,
  onNavigate
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(pipelines[0]?.id || 'orders_pipeline');

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId) || pipelines[0];

  return (
    <div className="flex flex-col gap-8">
      {/* Numbered Section Heading */}
      <div className="flex items-center justify-between border-b-4 border-[#111111] pb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl md:text-2xl font-black bg-[#111111] text-[#DDE51A] px-3 py-1">
            02 /
          </span>
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#111111] leading-none uppercase">
              PIPELINE CATALOGUE & SCHEMA REGISTRY
            </h2>
            <p className="text-xs uppercase font-mono tracking-widest text-[#66635D] mt-1 font-bold">
              REGISTERED DATA PIPELINES, TRANSFORMATION IR & VERSION TREES
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-bauhaus bg-[#DDE51A] text-[#111111] font-bold text-xs uppercase tracking-widest px-4 py-2.5 border-2 border-[#111111] shadow-bauhaus hover:bg-[#c9d010] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>NEW PIPELINE</span>
        </button>
      </div>

      {/* Grid: Pipelines List & Version Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Pipeline Cards */}
        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase font-bold tracking-widest text-[#66635D]">
            REGISTERED PIPELINES ({pipelines.length})
          </span>

          {pipelines.map((pipeline) => {
            const isSelected = pipeline.id === selectedPipelineId;
            const isOrders = pipeline.id === 'orders_pipeline';

            return (
              <div
                key={pipeline.id}
                onClick={() => {
                  setSelectedPipelineId(pipeline.id);
                  onSelectPipeline(pipeline);
                }}
                className={`p-6 border-4 border-[#111111] cursor-pointer transition-all duration-150 ${
                  isSelected ? 'bg-[#DDE51A] shadow-bauhaus' : 'bg-[#FFFFFF] hover:bg-[#F4F1E8] shadow-bauhaus-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-[#111111]" />
                    <span className="font-mono text-xs font-bold text-[#66635D]">
                      ID: {pipeline.id}
                    </span>
                  </div>
                  {isOrders ? (
                    <span className="bg-[#D02020] text-[#FFFFFF] text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#111111]">
                      v3 VIOLATED
                    </span>
                  ) : (
                    <span className="bg-[#168A52] text-[#FFFFFF] text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#111111]">
                      VERIFIED
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-[#111111] mb-2 uppercase tracking-tight">
                  {pipeline.name}
                </h3>

                <p className="text-xs text-[#66635D] font-medium line-clamp-2 mb-4">
                  {pipeline.description || 'No description provided.'}
                </p>

                <div className="flex items-center justify-between pt-3 border-t-2 border-[#111111] text-[11px] font-mono">
                  <span className="text-[#66635D]">SOURCE:</span>
                  <span className="font-bold text-[#111111]">{pipeline.source_type}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Cols: Selected Pipeline Version Tree & IR Inspector */}
        <div className="lg:col-span-2 border-4 border-[#111111] bg-[#FFFFFF] shadow-bauhaus flex flex-col">
          <div className="p-4 border-b-2 border-[#111111] bg-[#E6E2D8] flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-widest text-[#111111]">
              PIPELINE SPECIFICATION // {selectedPipeline?.name}
            </span>
            <span className="font-mono text-xs font-bold bg-[#111111] text-[#DDE51A] px-2 py-0.5">
              SOURCE: {selectedPipeline?.source_type}
            </span>
          </div>

          <div className="p-6 flex flex-col gap-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#66635D] block mb-2">
                ACTIVE VERSIONS IN HISTORY
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                {(selectedPipeline?.versions || []).map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-[#F4F1E8] border-2 border-[#111111] shadow-bauhaus-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#111111] uppercase">{v.version}</span>
                      <span className={`text-[10px] font-bold ${v.metadata_json?.status === 'VIOLATED' ? 'text-[#D02020]' : 'text-[#168A52]'}`}>
                        {v.metadata_json?.status || 'VERIFIED'}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#66635D] truncate">
                      {v.source_hash}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transformation IR Box */}
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#66635D] block mb-2">
                TRANSFORMATION INTERMEDIATE REPRESENTATION (IR)
              </span>
              <div className="p-4 bg-[#111111] text-[#DDE51A] border-2 border-[#111111] font-mono text-xs max-h-56 overflow-y-auto space-y-1 shadow-inner">
                <pre>{JSON.stringify(selectedPipeline?.versions?.[0]?.transformation_ir || [], null, 2)}</pre>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t-2 border-[#111111] flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('lineage')}
                className="btn-bauhaus bg-[#111111] text-[#DDE51A] text-xs font-bold uppercase tracking-wider px-4 py-2 border-2 border-[#111111] hover:bg-[#222222]"
              >
                RENDER LINEAGE GRAPH →
              </button>
              <button
                onClick={() => onNavigate('timetravel')}
                className="btn-bauhaus bg-[#FFFFFF] text-[#111111] text-xs font-bold uppercase tracking-wider px-4 py-2 border-2 border-[#111111] hover:bg-[#E6E2D8]"
              >
                TIME TRAVEL VERSION DIFF →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#111111]/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#FFFFFF] border-4 border-[#111111] shadow-bauhaus-lg max-w-xl w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
              <h3 className="text-xl font-black uppercase tracking-tight text-[#111111]">
                CREATE NEW PIPELINE CONFIGURATION
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="font-mono font-bold text-sm text-[#66635D] hover:text-[#111111]"
              >
                [ESC / CLOSE]
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
                  PIPELINE NAME
                </label>
                <input
                  type="text"
                  defaultValue="payment_settlement_v2"
                  className="w-full p-3 bg-[#F4F1E8] border-2 border-[#111111] font-bold focus:outline-none focus:border-[#DDE51A]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
                  INGESTION SOURCE
                </label>
                <input
                  type="text"
                  defaultValue="Kafka Topic: payments.settled"
                  className="w-full p-3 bg-[#F4F1E8] border-2 border-[#111111] font-bold focus:outline-none focus:border-[#DDE51A]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#66635D] block mb-1">
                  INITIAL INVARIANT
                </label>
                <textarea
                  rows={2}
                  defaultValue="ASSERT output.net_amount == input.gross_amount - input.fee_amount"
                  className="w-full p-3 bg-[#F4F1E8] border-2 border-[#111111] font-bold focus:outline-none focus:border-[#DDE51A] resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[#111111] flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border-2 border-[#111111] font-bold text-xs uppercase hover:bg-[#F4F1E8]"
              >
                CANCEL
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-bauhaus bg-[#DDE51A] text-[#111111] font-bold text-xs uppercase tracking-wider px-6 py-2 border-2 border-[#111111] shadow-bauhaus-sm"
              >
                CREATE PIPELINE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
