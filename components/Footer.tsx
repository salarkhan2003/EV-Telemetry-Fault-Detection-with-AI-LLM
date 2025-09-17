import React from 'react';

interface FooterProps {
    activeScreen: 'dashboard' | 'analysis' | 'device';
    setActiveScreen: (screen: 'dashboard' | 'analysis' | 'device') => void;
}

const NavButton: React.FC<{
    label: string;
    icon: JSX.Element;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
            isActive ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-400'
        }`}
    >
        {icon}
        <span className="text-xs font-medium">{label}</span>
    </button>
);


const Footer: React.FC<FooterProps> = ({ activeScreen, setActiveScreen }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 h-16 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 z-40">
            <nav className="flex justify-around items-center h-full max-w-7xl mx-auto px-4">
                <NavButton
                    label="Dashboard"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    }
                    isActive={activeScreen === 'dashboard'}
                    onClick={() => setActiveScreen('dashboard')}
                />
                 <NavButton
                    label="AI Analysis"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                    }
                    isActive={activeScreen === 'analysis'}
                    onClick={() => setActiveScreen('analysis')}
                />
                 <NavButton
                    label="Device"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12V4m0 16v-2" />
                        </svg>
                    }
                    isActive={activeScreen === 'device'}
                    onClick={() => setActiveScreen('device')}
                />
            </nav>
        </footer>
    );
};

export default Footer;