import React from 'react';

interface ConnectionBannerProps {
    onNavigate: () => void;
}

const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ onNavigate }) => {
    return (
        <div className="bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-200 p-4 rounded-lg flex items-center justify-between shadow-lg mb-6">
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                    <p className="font-bold">Device Not Connected</p>
                    <p className="text-sm text-yellow-300">Live data is not available. Connect to your vehicle to begin.</p>
                </div>
            </div>
            <button
                onClick={onNavigate}
                className="px-4 py-2 bg-yellow-600 text-white text-sm font-semibold rounded-md hover:bg-yellow-500 transition-colors whitespace-nowrap"
            >
                Connect Device
            </button>
        </div>
    );
};

export default ConnectionBanner;
