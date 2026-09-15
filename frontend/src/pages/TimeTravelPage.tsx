import React, { useState, useEffect } from 'react';
import { VersionDiffResponse } from '../types';
import { compareVersions } from '../services/api';
import { TimeTravelDiff } from '../components/TimeTravelDiff';
import { Clock, GitCompare, AlertTriangle } from 'lucide-react';

interface TimeTravelPageProps {
  onNavigate?: (screen: any) => void;
}

export const TimeTravelPage: React.FC<TimeTravelPageProps> = ({ onNavigate }) => {
  const [pipelineId, setPipelineId] = useState('orders_pipeline');
  const [fromVer, setFromVer] = useState('v2');
  const [toVer, setToVer] = useState('v3');
  const [diffData, setDiffData] = useState<VersionDiffResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadDiff() {
      setIsLoading(true);
      const res = await compareVersions(pipelineId, fromVer, toVer);
      if (active) {
        setDiffData(res);
        setIsLoading(false);
      }
    }
    loadDiff();
    return () => {
      active = false;
    };
  }, [pipelineId, fromVer, toVer]);

  const handleSelectVersionPair = (f: string, t: string) => {
    setFromVer(f);
    setToVer(t);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Numbered Section Heading */}
      <div className="flex items-center justify-between border-b-4 border-[#111111] pb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl md:text-2xl font-black bg-[#111111] text-[#DDE51A] px-3 py-1">
            07 /
          </span>
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#111111] leading-none uppercase">
              TIME TRAVEL // VERSION DIFF & REGRESSION
            </h2>
            <p className="text-xs uppercase font-mono tracking-widest text-[#66635D] mt-1 font-bold">
              GIT DIFF + DATA LINEAGE + FORMAL VERIFICATION HISTORY
            </p>
          </div>
        </div>
      </div>

      {/* Main Time Travel Diff Component */}
      <TimeTravelDiff
        diffData={diffData}
        onSelectVersionPair={handleSelectVersionPair}
        onOpenCounterexample={() => onNavigate && onNavigate('verification')}
      />
    </div>
  );
};
