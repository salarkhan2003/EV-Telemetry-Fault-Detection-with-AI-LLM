import React, { useEffect } from 'react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
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

    return (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
        >
            <div 
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-lg p-6 text-white relative animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
                <button 
                  onClick={onClose} 
                  className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white transition-colors"
                  aria-label="Close about modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 id="about-title" className="text-2xl font-bold font-orbitron text-cyan-glow mb-4">About This Application</h2>
                
                <div className="space-y-4 text-gray-300">
                    <p>
                        This app is designed to provide real-time monitoring and diagnostics for electric vehicle systems. By wirelessly collecting sensor data—such as battery, motor, and CAN bus parameters—from an ESP32 device, it empowers users to easily track their vehicle’s health.
                    </p>
                    <p>
                        The main goal is to help EV enthusiasts, DIY builders, and technicians to visualize live data and trends, receive AI-powered fault predictions and explanations from Google's Gemini API, and get actionable maintenance insights directly on their mobile device for improved safety and reliability.
                    </p>
                     <div className="border-t border-gray-700 pt-4">
                        <h3 className="font-semibold text-lg text-cyan-400 mb-2">How it Works</h3>
                        <ol className="list-decimal list-inside space-y-2">
                            <li><span className="font-bold">Connect Hardware:</span> Program an ESP32 microcontroller using the provided code snippets to broadcast sensor data over Bluetooth (BLE) or WiFi (WebSocket).</li>
                            <li><span className="font-bold">Establish Connection:</span> Use the 'Connect to Vehicle' button to link the app with your ESP32.</li>
                            <li><span className="font-bold">Monitor Live Data:</span> Watch real-time telemetry on the dashboard.</li>
                            <li><span className="font-bold">Get AI Insights:</span> The app periodically sends data to the Gemini API, which analyzes it for potential faults and provides actionable recommendations.</li>
                        </ol>
                    </div>
                </div>

                <div className="mt-8 flex justify-center sm:justify-end">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                    >
                        Close
                    </button>
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

export default AboutModal;