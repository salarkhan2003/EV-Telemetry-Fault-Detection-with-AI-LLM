import React from 'react';

interface BatterySOCProps {
  soc: number; // State of Charge in percentage
}

const BatterySOC: React.FC<BatterySOCProps> = ({ soc }) => {
  const getStatusColor = () => {
    if (soc <= 20) return 'bg-red-500';
    if (soc <= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow-lg h-full flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Battery SOC</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="flex items-end gap-3 mt-2">
        <span className="text-5xl font-orbitron font-bold text-white leading-none">{soc}</span>
        <span className="text-2xl font-orbitron font-bold text-gray-400 leading-none">%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-3">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${getStatusColor()}`} 
          style={{ width: `${soc}%` }}
        ></div>
      </div>
    </div>
  );
};

export default BatterySOC;
