import React from 'react';
import Dashboard from '../components/Dashboard';
import AlertPanel from '../components/AlertPanel';
import ConnectionBanner from '../components/ConnectionBanner';
import { type TelemetryData, type FaultAnalysis } from '../types';

interface DashboardScreenProps {
    telemetry: TelemetryData;
    analysis: FaultAnalysis | null;
    isLoadingAnalysis: boolean;
    error: string | null;
    isConnected: boolean;
    onNavigateToDevice: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
    telemetry,
    analysis,
    isLoadingAnalysis,
    error,
    isConnected,
    onNavigateToDevice,
}) => {
    return (
        <div className="space-y-6">
            {!isConnected && <ConnectionBanner onNavigate={onNavigateToDevice} />}
            <Dashboard telemetry={telemetry} />
            <AlertPanel analysis={analysis} isLoading={isLoadingAnalysis} error={error} />
        </div>
    );
};

export default DashboardScreen;