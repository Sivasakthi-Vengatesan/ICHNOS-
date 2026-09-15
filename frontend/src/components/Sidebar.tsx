import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Activity,
  Network,
  ShieldCheck,
  Code,
  Clock,
  ChevronRight
} from 'lucide-react';

export type NavScreenId =
  | 'overview'
  | 'pipelines'
  | 'executions'
  | 'lineage'
  | 'verification'
  | 'invariants'
  | 'timetravel';

interface SidebarProps {
  activeScreen: NavScreenId;
  onSelectScreen: (screen: NavScreenId) => void;
}

const NAV_ITEMS: Array<{ id: NavScreenId; num: string; label: string; icon: React.ReactNode }> = [
  { id: 'overview', num: '01', label: 'OVERVIEW', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'pipelines', num: '02', label: 'PIPELINES', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'executions', num: '03', label: 'EXECUTIONS', icon: <Activity className="w-4 h-4" /> },
  { id: 'lineage', num: '04', label: 'LINEAGE', icon: <Network className="w-4 h-4" /> },
  { id: 'verification', num: '05', label: 'VERIFICATION', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'invariants', num: '06', label: 'INVARIANTS', icon: <Code className="w-4 h-4" /> },
  { id: 'timetravel', num: '07', label: 'TIME TRAVEL', icon: <Clock className="w-4 h-4" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onSelectScreen }) => {
  return (
    <aside className="w-full md:w-64 bg-[#F4F1E8] border-r-4 border-[#111111] flex flex-col justify-between shrink-0 select-none">
      {/* Navigation List */}
      <div className="flex flex-col">
        <div className="p-4 border-b-2 border-[#111111] bg-[#E6E2D8]">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111]">
            INSTRUMENT PANEL
          </span>
        </div>

        <nav className="flex flex-col">
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => onSelectScreen(item.id)}
                className={`w-full text-left px-4 py-3.5 flex items-center justify-between border-b-2 border-[#111111] transition-colors duration-150 ${
                  isActive
                    ? 'bg-[#DDE51A] text-[#111111] font-bold shadow-inner'
                    : 'bg-[#F4F1E8] text-[#111111] hover:bg-[#E6E2D8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-[#66635D] w-6">
                    {item.num}
                  </span>
                  <span className="text-xs uppercase tracking-wider font-bold">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {isActive && <div className="w-2 h-2 bg-[#111111]"></div>}
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#111111]' : 'text-[#66635D]'}`} />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Panel */}
      <div className="p-4 border-t-4 border-[#111111] bg-[#FFFFFF] font-mono text-[11px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#66635D] font-bold">Z3 SMT ENGINE</span>
          <span className="text-[#168A52] font-bold">ONLINE</span>
        </div>
        <div className="w-full bg-[#E6E2D8] h-1.5 mb-2 overflow-hidden">
          <div className="bg-[#168A52] h-full w-full"></div>
        </div>
        <div className="text-[10px] text-[#66635D]">
          PRECISION: EXACT REASONING
        </div>
      </div>
    </aside>
  );
};
