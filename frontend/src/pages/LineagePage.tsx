import React, { useState, useEffect } from 'react';
import { LineageGraphResponse, LineageNode } from '../types';
import { fetchLineage } from '../services/api';
import { LineageGraph } from '../components/LineageGraph';
import { Network, GitBranch, AlertTriangle } from 'lucide-react';

interface LineagePageProps {
  selectedPipelineId?: string;
  onNavigate?: (screen: any) => void;
}

export const LineagePage: React.FC<LineagePageProps> = ({
  selectedPipelineId = 'orders_pipeline',
  onNavigate
}) => {
  const [pipelineId, setPipelineId] = useState(selectedPipelineId);
  const [version, setVersion] = useState('v3');
  const [lineageData, setLineageData] = useState<LineageGraphResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<LineageNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      const res = await fetchLineage(pipelineId, version);
      if (active) {
        setLineageData(res);
        setIsLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [pipelineId, version]);

  return (
    <div className="flex flex-col gap-8">
      {/* Numbered Section Heading */}
      <div className="flex flex-wrap items-center justify-between border-b-4 border-[#111111] pb-4 gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl md:text-2xl font-black bg-[#111111] text-[#DDE51A] px-3 py-1">
            04 /
          </span>
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#111111] leading-none uppercase">
              DATA LINEAGE // DIRECTED GRAPH SURVEILLANCE
            </h2>
            <p className="text-xs uppercase font-mono tracking-widest text-[#66635D] mt-1 font-bold">
              END-TO-END TRANSFORMATION DAGS, COLUMN TRACEABILITY & ROOT CAUSE PROPAGATION
            </p>
          </div>
        </div>

        {/* Version Switcher Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="font-bold text-[#66635D]">VERSION:</span>
          {['v1', 'v2', 'v3', 'v4'].map((v) => (
            <button
              key={v}
              onClick={() => setVersion(v)}
              className={`px-3 py-1.5 font-bold uppercase border-2 border-[#111111] transition-colors ${
                version === v ? 'bg-[#111111] text-[#DDE51A]' : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#F4F1E8]'
              }`}
            >
              {v} {v === 'v3' && '(VIOLATED)'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Lineage Graph */}
      <LineageGraph
        data={lineageData}
        onSelectNode={(node) => setSelectedNode(node)}
        selectedNodeId={selectedNode?.id}
      />
    </div>
  );
};
