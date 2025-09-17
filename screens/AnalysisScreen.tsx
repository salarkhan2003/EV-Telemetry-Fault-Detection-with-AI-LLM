import React from 'react';
import { TelemetryData } from '../types';
import TimeSeriesChart from '../components/TimeSeriesChart';
import Chatbot from '../components/Chatbot';
import ConnectionBanner from '../components/ConnectionBanner';


interface AnalysisScreenProps {
    telemetryHistory: TelemetryData[];
    latestTelemetry: TelemetryData;
    isConnected: boolean;
    onNavigateToDevice: () => void;
}

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ telemetryHistory, latestTelemetry, isConnected, onNavigateToDevice }) => {
    return (
        <div className="space-y-6">
            {!isConnected && <ConnectionBanner onNavigate={onNavigateToDevice} />}
            <div>
                <h2 className="text-2xl font-bold font-orbitron text-white mb-4">Historical Data Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TimeSeriesChart 
                        data={telemetryHistory} 
                        dataKey="battery.voltage" 
                        label="Battery Voltage" 
                        unit="V"
                        color="#38bdf8"
                    />
                     <TimeSeriesChart 
                        data={telemetryHistory} 
                        dataKey="motor.voltage" 
                        label="Motor Voltage" 
                        unit="V"
                        color="#a78bfa"
                    />
                    <TimeSeriesChart 
                        data={telemetryHistory} 
                        dataKey="battery.temperature" 
                        label="Battery Temperature" 
                        unit="°C"
                        color="#facc15"
                    />
                    <TimeSeriesChart 
                        data={telemetryHistory} 
                        dataKey="motor.temperature" 
                        label="Motor Temperature" 
                        unit="°C"
                        color="#f87171"
                    />
                    <TimeSeriesChart 
                        data={telemetryHistory} 
                        dataKey="battery.current" 
                        label="Battery Current" 
                        unit="A"
                        color="#4ade80"
                    />
                     <TimeSeriesChart 
                        data={telemetryHistory} 
                        dataKey="motor.current" 
                        label="Motor Current" 
                        unit="A"
                        color="#fb923c"
                    />
                     <TimeSeriesChart 
                        data={telemetryHistory} 
                        dataKey="vehicle.speed" 
                        label="Vehicle Speed" 
                        unit="km/h"
                        color="#60a5fa"
                    />
                    <TimeSeriesChart 
                        data={telemetryHistory} 
                        dataKey="battery.soc" 
                        label="Battery SoC" 
                        unit="%"
                        color="#34d399"
                    />
                </div>
            </div>
            
            <Chatbot latestTelemetry={latestTelemetry} isConnected={isConnected} />

        </div>
    );
};

export default AnalysisScreen;