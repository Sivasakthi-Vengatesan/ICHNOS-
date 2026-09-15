import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Sidebar, NavScreenId } from './components/Sidebar';
import { TelemetryMarquee } from './components/TelemetryMarquee';
import { OverviewPage } from './pages/OverviewPage';
import { PipelinesPage } from './pages/PipelinesPage';
import { ExecutionsPage } from './pages/ExecutionsPage';
import { LineagePage } from './pages/LineagePage';
import { VerificationPage } from './pages/VerificationPage';
import { InvariantsPage } from './pages/InvariantsPage';
import { TimeTravelPage } from './pages/TimeTravelPage';
import {
  fetchTelemetry,
  fetchPipelines,
  fetchExecutions,
  fetchInvariants,
  runVerification,
  triggerExecution
} from './services/api';
import { TelemetryStats, Pipeline, Execution, Invariant, VerificationResponse } from './types';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<NavScreenId>('overview');
  const [telemetry, setTelemetry] = useState<TelemetryStats | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [invariants, setInvariants] = useState<Invariant[]>([]);
  const [verificationResult, setVerificationResult] = useState<VerificationResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Initial load
  useEffect(() => {
    async function init() {
      const [tData, pData, eData, iData, vData] = await Promise.all([
        fetchTelemetry(),
        fetchPipelines(),
        fetchExecutions(),
        fetchInvariants(),
        runVerification({ pipeline_id: 'orders_pipeline', version_id: 'v3' })
      ]);
      setTelemetry(tData);
      setPipelines(pData);
      setExecutions(eData);
      setInvariants(iData);
      setVerificationResult(vData);
    }
    init();
  }, []);

  const handleRunVerification = async () => {
    setIsVerifying(true);
    const res = await runVerification({
      pipeline_id: 'orders_pipeline',
      version_id: 'v3'
    });
    setVerificationResult(res);
    setIsVerifying(false);

    if (res.result === 'VERIFIED') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#DDE51A', '#168A52', '#111111']
      });
    }
  };

  const handleVerifyCustomExpression = async (expression: string) => {
    setIsVerifying(true);
    const res = await runVerification({
      pipeline_id: 'orders_pipeline',
      custom_invariant_expression: expression,
      custom_pipeline_ir: [
        { op: 'FILTER', column: 'status', operator: '==', value: 'PAID', expression: "status == 'PAID'", node_name: 'clean_orders' },
        { op: 'AGGREGATE_SUM', column: 'amount', node_name: 'revenue_daily' }
      ]
    });
    setVerificationResult(res);
    setIsVerifying(false);
    setActiveScreen('verification');
  };

  const handleTriggerExecution = async () => {
    setIsExecuting(true);
    const res = await triggerExecution('orders_pipeline', 'v1');
    setIsExecuting(false);
    // Refresh executions
    const freshExecs = await fetchExecutions();
    setExecutions(freshExecs);
  };

  return (
    <div className="min-h-screen bg-[#F4F1E8] text-[#111111] flex flex-col selection:bg-[#DDE51A] selection:text-[#111111]">
      {/* Top Laboratory Instrument Header */}
      <Header
        telemetry={telemetry}
        onQuickVerify={handleRunVerification}
        isVerifying={isVerifying}
      />

      {/* Kinetic Telemetry Strip */}
      <TelemetryMarquee telemetry={telemetry} />

      {/* Main Workspace Layout with Sidebar and Swiss Grid */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1720px] mx-auto">
        {/* Numbered Sidebar */}
        <Sidebar
          activeScreen={activeScreen}
          onSelectScreen={(screen) => setActiveScreen(screen)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-6 md:p-10 overflow-x-hidden min-h-[calc(100vh-140px)]">
          {activeScreen === 'overview' && (
            <OverviewPage
              telemetry={telemetry}
              pipelines={pipelines}
              verification={verificationResult}
              onNavigate={(screen) => setActiveScreen(screen)}
              onRunVerification={handleRunVerification}
              isVerifying={isVerifying}
            />
          )}

          {activeScreen === 'pipelines' && (
            <PipelinesPage
              pipelines={pipelines}
              onSelectPipeline={(p) => {}}
              onNavigate={(screen) => setActiveScreen(screen)}
            />
          )}

          {activeScreen === 'executions' && (
            <ExecutionsPage
              executions={executions}
              onTriggerExecution={handleTriggerExecution}
              isExecuting={isExecuting}
            />
          )}

          {activeScreen === 'lineage' && (
            <LineagePage
              selectedPipelineId="orders_pipeline"
              onNavigate={(screen) => setActiveScreen(screen)}
            />
          )}

          {activeScreen === 'verification' && (
            <VerificationPage
              currentVerification={verificationResult}
              onNavigate={(screen) => setActiveScreen(screen)}
              onRefreshVerification={handleRunVerification}
              isVerifying={isVerifying}
            />
          )}

          {activeScreen === 'invariants' && (
            <InvariantsPage
              invariants={invariants}
              onVerifyExpression={handleVerifyCustomExpression}
              isVerifying={isVerifying}
              onNavigate={(screen) => setActiveScreen(screen)}
            />
          )}

          {activeScreen === 'timetravel' && (
            <TimeTravelPage
              onNavigate={(screen) => setActiveScreen(screen)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
