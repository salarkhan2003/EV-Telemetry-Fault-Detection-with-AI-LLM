import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TelemetryData } from '../types';

interface TimeSeriesChartProps {
    data: TelemetryData[];
    // FIX: Widen the type for `dataKey` to include all valid telemetry paths used for charting.
    dataKey: 'battery.voltage' | 'battery.temperature' | 'battery.current' | 'battery.soc' | 'motor.voltage' | 'motor.temperature' | 'motor.current' | 'vehicle.speed';
    label: string;
    unit: string;
    color: string;
}

// Helper to access nested properties
const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, dataKey, label, unit, color }) => {
    const formattedData = data.map(d => ({
        ...d,
        value: getNestedValue(d, dataKey)
    }));
    
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg h-64 border border-gray-700">
            <h3 className="text-md font-semibold text-gray-300 mb-2">{label}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                    <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString()} 
                        stroke="#a0aec0"
                        fontSize={12}
                    />
                    <YAxis stroke="#a0aec0" fontSize={12} unit={unit} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' }}
                        labelStyle={{ color: '#cbd5e0' }}
                        formatter={(value) => [`${value} ${unit}`, label]}
                    />
                    <Line type="monotone" dataKey="value" name={label} stroke={color} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TimeSeriesChart;
