import React, { useEffect, useState } from 'react';
import { ConnectionType } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    connectionType: ConnectionType;
    onBluetoothConnect: () => void;
    onWifiConnect: (url: string) => void;
    error: string | null;
    onClearError: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, connectionType, onBluetoothConnect, onWifiConnect, error, onClearError }) => {
    const [wifiUrl, setWifiUrl] = useState('ws://192.168.4.1'); // Default for ESP32 AP mode

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    const renderButtonContent = (method: 'bluetooth' | 'wifi') => {
        if (connectionType === ConnectionType.CONNECTING) {
            return (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connecting...
                </>
            );
        }
        return method === 'bluetooth' ? 'Connect via Bluetooth' : 'Connect via WiFi';
    };
    
    const handleWifiSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onClearError();
      onWifiConnect(wifiUrl);
    }
    
    const handleBluetoothClick = () => {
        onClearError();
        onBluetoothConnect();
    }

    return (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
            <div 
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md p-6 text-white relative animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
                <button 
                  onClick={onClose} 
                  className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white transition-colors"
                  aria-label="Close settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 id="settings-title" className="text-2xl font-bold font-orbitron text-cyan-glow mb-2">Connect to Vehicle</h2>
                <p className="text-gray-400 mb-6">Choose a method to stream live telemetry data from your device.</p>
                
                {error && (
                    <div className="bg-red-900/70 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
                        <p className="font-bold">Connection Failed</p>
                        <p>{error}</p>
                    </div>
                )}
                
                <div className="space-y-4">
                    <div className="border border-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-2 text-cyan-400">Bluetooth Low Energy (BLE)</h3>
                        <p className="text-sm text-gray-400 mb-4">Recommended for mobile. Allows direct data streaming from your device.</p>
                        <button 
                            onClick={handleBluetoothClick} 
                            disabled={connectionType === ConnectionType.CONNECTING}
                            className="w-full flex items-center justify-center px-4 py-2 font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800/50 disabled:cursor-not-allowed"
                        >
                            {renderButtonContent('bluetooth')}
                        </button>
                    </div>

                     <form onSubmit={handleWifiSubmit} className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                        <h3 className="font-semibold text-lg mb-2 text-cyan-400">WiFi (WebSocket)</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Connect to your device by entering its WebSocket URL. Your ESP32 must be running a WebSocket server.
                        </p>
                        <input
                            type="text"
                            value={wifiUrl}
                            onChange={(e) => setWifiUrl(e.target.value)}
                            placeholder="e.g., ws://192.168.4.1"
                            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 mb-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                        <button 
                            type="submit"
                            disabled={connectionType === ConnectionType.CONNECTING}
                            className="w-full flex items-center justify-center px-4 py-2 font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800/50 disabled:cursor-not-allowed"
                        >
                            {renderButtonContent('wifi')}
                        </button>
                    </form>
                </div>

            </div>
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default SettingsModal;