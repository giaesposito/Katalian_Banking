
import React, { useState, useEffect, useRef } from 'react';
import { ViewType } from '../../types';
import Button from '../common/Button';

interface ContactScreenProps {
    onNavigate: (view: ViewType) => void;
}

const ContactScreen: React.FC<ContactScreenProps> = ({ onNavigate }) => {
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
        { role: 'ai', text: 'Hello! I am your Katalian Support Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');

        // Simulate AI response
        setTimeout(() => {
            let response = "I'm sorry, I'm just a simulated assistant. Please call our support line for complex queries.";
            if (userMsg.toLowerCase().includes('card')) response = "If you lost your card, please click the 'Report Lost/Stolen Card' button in the Emergency Services section.";
            if (userMsg.toLowerCase().includes('loan')) response = "You can explore our lending products in the 'Loans' section of your dashboard.";
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
        }, 1000);
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Information */}
                <div className="space-y-8">
                    <h2 className="text-4xl font-bold text-white">Get in Touch</h2>
                    <p className="text-gray-400">Our dedicated support team is available 24/7 to assist you with any questions or concerns.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <ContactCard icon="📞" title="General Support" info="1-800-KATALIAN" sub="Available 24/7" />
                        <ContactCard icon="📧" title="Email Us" info="support@katalian.com" sub="Response in 24h" />
                        <ContactCard icon="🏢" title="Headquarters" info="1200 Financial Plaza" sub="New York, NY 10004" />
                        <ContactCard icon="🕒" title="Branch Hours" info="9:00 AM - 5:00 PM" sub="Monday - Friday" />
                    </div>

                    <div className="bg-red-950/20 border border-red-500/30 p-8 rounded-2xl space-y-4">
                        <h3 className="text-red-400 font-bold flex items-center gap-2">
                            <span className="text-xl">⚠️</span> Emergency Services
                        </h3>
                        <p className="text-gray-400 text-sm">Use these options if your account security has been compromised or you've lost access to your cards.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button variant="danger" fullWidth>Report Lost/Stolen Card</Button>
                            <Button variant="danger" fullWidth className="bg-red-800/50 hover:bg-red-800">Fraud Reporting</Button>
                        </div>
                    </div>
                </div>

                {/* Simulated Live Chat */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden flex flex-col h-[600px] shadow-2xl">
                    <div className="bg-teal-600 p-4 flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <h3 className="text-white font-bold">Katalian Live Chat</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900/50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                    m.role === 'user' ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-gray-700 text-gray-200 rounded-tl-none'
                                }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Type your message..." 
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm outline-none focus:ring-1 focus:ring-teal-500"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <Button type="submit" className="p-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </Button>
                    </form>
                </div>
            </div>
            
            <div className="text-center">
                <Button variant="secondary" onClick={() => onNavigate({name:'dashboard'})}>Back to Dashboard</Button>
            </div>
        </div>
    );
};

const ContactCard: React.FC<{icon: string, title: string, info: string, sub: string}> = ({ icon, title, info, sub }) => (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-teal-500/50 transition-all">
        <span className="text-3xl mb-2 block">{icon}</span>
        <h4 className="text-white font-bold">{title}</h4>
        <p className="text-teal-400 font-mono mt-1">{info}</p>
        <p className="text-xs text-gray-500">{sub}</p>
    </div>
);

export default ContactScreen;
