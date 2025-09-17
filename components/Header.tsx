import React from 'react';

const Header: React.FC = () => {
    
  return (
    <header className="mb-6 py-4">
        <div className="relative text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h1 className="text-2xl sm:text-4xl font-bold font-orbitron text-white tracking-wider">
                    EV Telemetry Fault Detection
                </h1>
            </div>
            <div className="flex justify-center items-center gap-3">
                <p className="text-sm sm:text-md text-gray-400">
                    Real-time system monitoring with AI-powered fault analysis
                </p>
            </div>
        </div>
    </header>
  );
};

export default Header;