import React from 'react';
import { ConnectionType } from '../types';

interface DeviceScreenProps {
    connectionType: ConnectionType;
    connectionMethod: 'none' | 'bluetooth' | 'wifi';
    connectedDeviceName: string | null;
    onConnect: () => void;
    onDisconnect: () => void;
    onOpenAbout: () => void;
}

const DeviceScreen: React.FC<DeviceScreenProps> = ({
    connectionType,
    connectionMethod,
    connectedDeviceName,
    onConnect,
    onDisconnect,
    onOpenAbout
}) => {

    const getStatusInfo = () => {
        switch (connectionType) {
            case ConnectionType.CONNECTED:
                return {
                    text: 'Connected',
                    color: 'text-green-400',
                    description: `Actively receiving real-time data from your device.`
                };
            case ConnectionType.CONNECTING:
                return {
                    text: 'Connecting...',
                    color: 'text-yellow-400 animate-pulse',
                    description: 'Attempting to establish a connection. Please approve any requests.'
                };
            case ConnectionType.DISCONNECTED:
            default:
                return {
                    text: 'Offline',
                    color: 'text-red-500',
                    description: 'Not connected to a telemetry device. Tap below to start.'
                };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="w-full max-w-md bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 p-6 sm:p-8">
                <h2 className="text-2xl font-bold font-orbitron text-white mb-4">Device Connection</h2>

                <div className="mb-6">
                    <p className="text-gray-400 mb-2">Status</p>
                    <p className={`text-3xl font-orbitron font-bold ${statusInfo.color}`}>{statusInfo.text}</p>
                    <p className="text-sm text-gray-500 mt-2 h-10">{statusInfo.description}</p>
                </div>

                {connectionType === ConnectionType.CONNECTED && connectedDeviceName && (
                    <div className="mb-8 w-full bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                        <p className="text-sm text-gray-400 uppercase tracking-wider">Connected To</p>
                        <p className="text-lg font-semibold text-cyan-400 break-words">
                            {connectedDeviceName}
                        </p>
                         <p className="text-xs text-gray-500 mt-1">
                            (via {connectionMethod === 'wifi' ? 'WiFi' : 'Bluetooth'})
                        </p>
                    </div>
                )}
                
                <button
                    onClick={connectionType === ConnectionType.CONNECTED ? onDisconnect : onConnect}
                    disabled={connectionType === ConnectionType.CONNECTING}
                    className={`text-white font-bold py-4 px-10 w-full rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-wait disabled:scale-100 ${
                        connectionType === ConnectionType.CONNECTED 
                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/50' 
                        : 'bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-500/50'
                    }`}
                    style={{
                        textShadow: '0px 1px 3px rgba(0, 0, 0, 0.3)',
                        boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1), inset 0 -3px 0px rgba(0,0,0,0.2)`
                    }}
                >
                    {connectionType === ConnectionType.CONNECTING ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            <span>Connecting...</span>
                        </div>
                    ) : (
                        connectionType === ConnectionType.CONNECTED ? 'Disconnect' : 'Connect to Vehicle'
                    )}
                </button>

                <div className="mt-8">
                     <button 
                        onClick={onOpenAbout} 
                        className="text-gray-400 hover:text-cyan-400 transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        About This App
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeviceScreen;