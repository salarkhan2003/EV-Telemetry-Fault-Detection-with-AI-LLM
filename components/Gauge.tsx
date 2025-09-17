import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface GaugeProps {
  label: string;
  value: number;
  maxValue: number;
  unit: string;
}

const Gauge: React.FC<GaugeProps> = ({ label, value, maxValue, unit }) => {
  const percentage = (value / maxValue) * 100;
  const color = percentage > 85 ? '#ef4444' : percentage > 60 ? '#f59e0b' : '#22c55e';
  
  // Ensure the value does not exceed the maxValue for the visual representation
  const displayValue = Math.min(value, maxValue);
  const data = [{ name: label, value: displayValue, fill: color }];

  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow-lg h-full flex flex-col items-center justify-center">
      <div className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">{label}</div>
      {/* Relative container for the chart and the centered text */}
      <div className="relative w-full" style={{ height: 120 }}>
        <ResponsiveContainer>
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            barSize={15}
            data={data}
            startAngle={180}
            endAngle={0}
            cy="100%"
          >
            <PolarAngleAxis
              type="number"
              domain={[0, maxValue]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: '#374151' }}
              dataKey="value"
              cornerRadius={10}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Absolutely positioned text, centered and moved up to sit inside the gauge arc */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ top: '75%', transform: 'translateX(-50%) translateY(-50%)' }}
        >
          <div className="text-center">
            <span className="text-3xl font-orbitron font-bold text-white">{value}</span>
            <span className="text-xl text-gray-400 ml-1">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gauge;