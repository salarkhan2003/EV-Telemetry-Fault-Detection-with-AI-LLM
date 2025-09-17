
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  status?: 'normal' | 'warning' | 'critical';
}

const statusClasses = {
  normal: 'border-l-4 border-green-500',
  warning: 'border-l-4 border-yellow-400',
  critical: 'border-l-4 border-red-500',
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, status = 'normal' }) => {
  return (
    <div className={`bg-gray-800 p-5 rounded-lg shadow-lg flex flex-col justify-between transition-all duration-300 ${statusClasses[status]}`}>
      <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-3xl sm:text-4xl font-orbitron font-bold text-white mt-2">{value}</div>
    </div>
  );
};

export default MetricCard;