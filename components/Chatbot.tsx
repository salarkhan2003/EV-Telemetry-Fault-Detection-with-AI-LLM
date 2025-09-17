import React, { useState, useRef, useEffect } from 'react';
import { TelemetryData } from '../types';
import { getChatbotResponse } from '../services/geminiService';

interface ChatbotProps {
    latestTelemetry: TelemetryData;
    isConnected: boolean;
}

interface Message {
    text: string;
    sender: 'user' | 'ai';
}

const suggestionQuestions = [
    "Is the battery temperature normal?",
    "What is the current motor RPM?",
    "Compare battery and motor voltage.",
    "Are there any immediate concerns?"
];

const Chatbot: React.FC<ChatbotProps> = ({ latestTelemetry, isConnected }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    const handleSend = async (question: string) => {
        if (!question.trim() || isLoading || !isConnected) return;

        const userMessage: Message = { text: question, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await getChatbotResponse(question, latestTelemetry);
            const aiMessage: Message = { text: aiResponse, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = { 
                text: error instanceof Error ? error.message : "Sorry, I couldn't get a response.", 
                sender: 'ai' 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend(input);
    };

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 p-4 flex flex-col h-[65vh]">
            <h2 className="text-lg font-semibold mb-3 text-cyan-glow font-orbitron">AI Vehicle Assistant</h2>
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4">
                {messages.length === 0 && (
                     <div className="text-center text-gray-400 p-4">
                        {isConnected 
                          ? "Ask me anything about the current vehicle data. Try one of the suggestions!"
                          : "Please connect to a device to activate the AI Assistant."}
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                            msg.sender === 'user' 
                                ? 'bg-cyan-600 text-white rounded-br-none' 
                                : 'bg-gray-700 text-gray-200 rounded-bl-none'
                        }`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg bg-gray-700 text-gray-200 rounded-bl-none">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
                {suggestionQuestions.map(q => (
                    <button 
                        key={q}
                        onClick={() => handleSend(q)}
                        disabled={isLoading || !isConnected}
                        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {q}
                    </button>
                ))}
            </div>
            <form onSubmit={handleFormSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isConnected ? "Ask about vehicle status..." : "Connect device to chat"}
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                    disabled={isLoading || !isConnected}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim() || !isConnected}
                    className="px-4 py-2 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-cyan-800/50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chatbot;