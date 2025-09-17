import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import Footer from './components/Footer';
import DashboardScreen from './screens/DashboardScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import DeviceScreen from './screens/DeviceScreen';
import ToastNotification from './components/ToastNotification';
import { type TelemetryData, type FaultAnalysis, ConnectionType } from './types';
import { analyzeTelemetry } from './services/geminiService';
import { bluetoothService } from './services/bluetoothService';
import { wifiService } from './services/wifiService';

const generateInitialTelemetry = (): TelemetryData => ({
  battery: { voltage: 0, temperature: 0, current: 0, soc: 0 },
  motor: { voltage: 0, temperature: 0, rpm: 0, current: 0 },
  vehicle: { speed: 0 },
  timestamp: Date.now(),
});

const MAX_HISTORY_LENGTH = 100;

const App: React.FC = () => {
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([generateInitialTelemetry()]);
  const [latestTelemetry, setLatestTelemetry] = useState<TelemetryData>(generateInitialTelemetry());
  const [analysis, setAnalysis] = useState<FaultAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>(ConnectionType.DISCONNECTED);
  const [connectionMethod, setConnectionMethod] = useState<'none' | 'bluetooth' | 'wifi'>('none');
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'analysis' | 'device'>('dashboard');
  const [toast, setToast] = useState<{ message: string, show: boolean }>({ message: '', show: false });

  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3000);
  };

  const onDataReceived = useCallback((data: Omit<TelemetryData, 'timestamp'>) => {
    const newPoint = { ...data, timestamp: Date.now() };
    setLatestTelemetry(newPoint);
    setTelemetryHistory(prevHistory => {
      const newHistory = [...prevHistory, newPoint];
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        return newHistory.slice(newHistory.length - MAX_HISTORY_LENGTH);
      }
      return newHistory;
    });
  }, []);

  const handleBluetoothConnect = async () => {
    if (connectionType === ConnectionType.CONNECTED || connectionType === ConnectionType.CONNECTING) return;
    setConnectionType(ConnectionType.CONNECTING);
    setConnectionMethod('bluetooth');
    setError(null);
    try {
      const deviceName = await bluetoothService.connect(onDataReceived);
      setConnectionType(ConnectionType.CONNECTED);
      setConnectedDeviceName(deviceName);
      setIsSettingsOpen(false);
      showToast('Device Connected!');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to connect via Bluetooth');
      setConnectionType(ConnectionType.DISCONNECTED);
      setConnectionMethod('none');
      setConnectedDeviceName(null);
    }
  };
  
  const handleWifiConnect = async (url: string) => {
    if (connectionType === ConnectionType.CONNECTED || connectionType === ConnectionType.CONNECTING) return;
    setConnectionType(ConnectionType.CONNECTING);
    setConnectionMethod('wifi');
    setError(null);
    try {
      await wifiService.connect(url, onDataReceived, () => handleDisconnect());
      setConnectionType(ConnectionType.CONNECTED);
      setConnectedDeviceName(url);
      setIsSettingsOpen(false);
      showToast('Device Connected!');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to connect via WiFi');
      setConnectionType(ConnectionType.DISCONNECTED);
      setConnectionMethod('none');
      setConnectedDeviceName(null);
    }
  };

  const handleDisconnect = useCallback(() => {
    if (connectionMethod === 'bluetooth') {
      bluetoothService.disconnect();
    } else if (connectionMethod === 'wifi') {
      wifiService.disconnect();
    }
    const initialData = generateInitialTelemetry();
    setConnectionType(ConnectionType.DISCONNECTED);
    setConnectionMethod('none');
    setConnectedDeviceName(null);
    setLatestTelemetry(initialData);
    setTelemetryHistory([initialData]);
    setAnalysis(null);
    if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
    }
    showToast('Device Disconnected.');
  }, [connectionMethod]);

  const runAnalysis = useCallback(async () => {
    if (isLoadingAnalysis || latestTelemetry.battery.voltage === 0) return;
    setIsLoadingAnalysis(true);
    setError(null);
    try {
      const result = await analyzeTelemetry(latestTelemetry);
      setAnalysis(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get analysis from Gemini API. ${errorMessage}`);
      setAnalysis(null);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [latestTelemetry, isLoadingAnalysis]);

  useEffect(() => {
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);

    if (connectionType === ConnectionType.CONNECTED) {
      runAnalysis();
      analysisIntervalRef.current = setInterval(runAnalysis, 10000);
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [connectionType, runAnalysis]);

  const isConnected = connectionType === ConnectionType.CONNECTED;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-7xl">
        <Header />
        <main className="pb-20 relative">
          {activeScreen === 'dashboard' && (
            <DashboardScreen
              telemetry={latestTelemetry}
              analysis={analysis}
              isLoadingAnalysis={isLoadingAnalysis}
              error={error}
              isConnected={isConnected}
              onNavigateToDevice={() => setActiveScreen('device')}
            />
          )}
          {activeScreen === 'analysis' && (
            <AnalysisScreen 
              telemetryHistory={telemetryHistory}
              latestTelemetry={latestTelemetry}
              isConnected={isConnected}
              onNavigateToDevice={() => setActiveScreen('device')}
            />
          )}
          {activeScreen === 'device' && (
            <DeviceScreen
              connectionType={connectionType}
              connectionMethod={connectionMethod}
              connectedDeviceName={connectedDeviceName}
              onConnect={() => setIsSettingsOpen(true)}
              onDisconnect={handleDisconnect}
              onOpenAbout={() => setIsAboutOpen(true)}
            />
          )}
        </main>
        <Footer activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
        {toast.show && <ToastNotification message={toast.message} onClose={() => setToast({ message: '', show: false })} />}
        <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => {
                setIsSettingsOpen(false);
                if (connectionType !== ConnectionType.CONNECTED) {
                  setConnectionMethod('none');
                  setConnectionType(ConnectionType.DISCONNECTED);
                }
                setError(null);
            }}
            connectionType={connectionType}
            onBluetoothConnect={handleBluetoothConnect}
            onWifiConnect={handleWifiConnect}
            error={error}
            onClearError={() => setError(null)}
        />
        <AboutModal
            isOpen={isAboutOpen}
            onClose={() => setIsAboutOpen(false)}
        />
      </div>
    </div>
  );
};

export default App;