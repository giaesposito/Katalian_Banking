
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { User } from '../../types';
import Button from './Button';
import Spinner from './Spinner';

interface AiAssistantProps {
    allUsers: User[];
}

const AiAssistant: React.FC<AiAssistantProps> = ({ allUsers }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleAskAi = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setResponse(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                You are a senior financial analyst and database assistant for Katalian Bank.
                Below is the current state of the bank's user database in JSON format.
                
                DATABASE:
                ${JSON.stringify(allUsers, null, 2)}

                USER QUERY:
                "${query}"

                INSTRUCTIONS:
                - Answer the user's query accurately based on the provided data.
                - Use professional, helpful banking tone.
                - Format your answer in clear Markdown.
                - If asked about balances, format them as currency.
                - If the information is not in the data, state it politely.
            `;

            const result = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
            });

            setResponse(result.text || "I'm sorry, I couldn't process that query.");
        } catch (error) {
            console.error("AI Assistant Error:", error);
            setResponse("Error: Unable to connect to the financial intelligence engine.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 bg-teal-500 hover:bg-teal-400 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-50 flex items-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-bold pr-2">Ask AI Assistant</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-8 right-8 w-full max-w-md bg-gray-800 border border-teal-500/30 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="bg-teal-600 p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold text-white">Katalian Financial AI</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-teal-100 hover:text-white">&times;</button>
            </div>
            
            <div className="p-4 max-h-[400px] overflow-y-auto bg-gray-900/50">
                {!response && !isLoading && (
                    <p className="text-gray-400 text-sm text-center py-8 italic">
                        Ask me anything about user accounts, total balances, or financial trends in the current system.
                    </p>
                )}
                
                {isLoading && (
                    <div className="py-8">
                        <Spinner />
                        <p className="text-center text-xs text-teal-500 mt-4 animate-pulse">Analyzing bank data...</p>
                    </div>
                )}
                
                {response && !isLoading && (
                    <div className="prose prose-invert prose-sm max-w-none text-gray-200">
                        {response.split('\n').map((line, i) => (
                            <p key={i} className="mb-2">{line}</p>
                        ))}
                    </div>
                )}
            </div>

            <form onSubmit={handleAskAi} className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2">
                <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search accounts or ask a question..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <Button type="submit" disabled={isLoading || !query.trim()} className="px-3 py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                </Button>
            </form>
        </div>
    );
};

export default AiAssistant;
