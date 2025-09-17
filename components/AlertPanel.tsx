import React from 'react';
import { type FaultAnalysis, FaultStatus } from '../types';

interface AlertPanelProps {
  analysis: FaultAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

const AnalyzingIcon = () => (
    <div className="w-10 h-10 relative animate-pulse-brain">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5l.415-.207a.75.75 0 011.085.67V10.5m0 0h6m-6 0a.75.75 0 001.085.67l.416-.207m-7.166 4.584A.75.75 0 005.25 15h5.25m0 0a.75.75 0 00.75-.75V8.25m-6 6.75a.75.75 0 00.75-.75V8.25m0 0a.75.75 0 00-.75.75v5.25m7.5-6.75a.75.75 0 00-.75.75v5.25m0 0a.75.75 0 00.75.75h3a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75h-3m-3.75 9.75a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75h-.008zM12 15a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75h-.008z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0" />
        </svg>
    </div>
);
const HealthyIcon = () => (
    <div className="w-10 h-10 text-green-400 animate-glow-healthy">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </div>
);
const WarningIcon = () => (
    <div className="w-10 h-10 text-yellow-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    </div>
);
const CriticalIcon = () => (
    <div className="w-10 h-10 text-red-500 animate-pulse-critical">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.73-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-4.243-4.243l3.275-3.275a4.5 4.5 0 00-6.336 4.486c.046.58.297 1.143.748 1.743m-4.546 2.344a3.004 3.004 0 00-4.243-4.243L6.75 21A2.652 2.652 0 009 19.5l2.42-2.42z" />
        </svg>
    </div>
);

const AlertPanel: React.FC<AlertPanelProps> = ({ analysis, isLoading, error }) => {
  let content;
  let animationClass = "";
  const baseClasses = "mt-6 p-5 rounded-lg shadow-lg border-t-4 transition-all duration-300";
  let statusClasses = "bg-gray-800 border-gray-600";
  
  if(analysis) {
    switch (analysis.status) {
        case FaultStatus.Healthy: statusClasses = 'bg-green-900/50 border-green-500'; break;
        case FaultStatus.Warning: statusClasses = 'bg-yellow-900/50 border-yellow-500'; break;
        case FaultStatus.Critical: statusClasses = 'bg-red-900/50 border-red-500'; break;
    }
  }

  if (isLoading) {
    content = (
      <div className="flex items-center gap-4">
        <AnalyzingIcon />
        <div>
          <h3 className="text-lg font-semibold font-orbitron text-cyan-glow">Analyzing...</h3>
          <p className="text-gray-400">Communicating with Gemini for the latest system analysis.</p>
        </div>
      </div>
    );
  } else if (error) {
     statusClasses = 'bg-red-900/50 border-red-500';
     animationClass = 'animate-pulse-critical';
     content = (
      <div className="flex items-center gap-4">
         <CriticalIcon />
        <div>
          <h3 className="text-lg font-semibold font-orbitron text-red-400">Analysis Error</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
     )
  } else if (analysis) {
    content = (
      <div>
        <div className="flex items-center gap-4 mb-3">
            {analysis.status === FaultStatus.Healthy && <HealthyIcon />}
            {analysis.status === FaultStatus.Warning && <WarningIcon />}
            {analysis.status === FaultStatus.Critical && <CriticalIcon />}
          <h3 className="text-xl font-semibold font-orbitron">{analysis.status}</h3>
        </div>
        <div>
          <h4 className="font-semibold text-gray-300">AI Analysis:</h4>
          <p className="text-gray-400 mb-2">{analysis.analysis}</p>
          <h4 className="font-semibold text-gray-300">Recommendation:</h4>
          <p className="text-gray-400">{analysis.recommendation}</p>
        </div>
      </div>
    );
  } else {
    content = <p className="text-gray-400 text-center py-4">No analysis data available. Connect to a device to begin.</p>;
  }

  return (
    <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-3 text-cyan-glow font-orbitron">Gemini AI Diagnostics</h2>
        <div className={`${baseClasses} ${statusClasses} ${animationClass}`}>
            {content}
        </div>
    </div>
  );
};

export default AlertPanel;