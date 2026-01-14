
import React, { useState, useEffect, useRef } from 'react';
import { ViewType } from '../../types';
import Button from '../common/Button';

interface ContactScreenProps {
    onNavigate: (view: ViewType) => void;
}

const ContactScreen: React.FC<ContactScreenProps> = ({ onNavigate }) => {
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
        { role: 'ai', text: 'Welcome to Katalian Support. I am your personal concierge assistant. How may I facilitate your request today?' }
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

        setTimeout(() => {
            let response = "I have noted your inquiry. A representative from our Private Banking division will be assigned to your case momentarily.";
            if (userMsg.toLowerCase().includes('card')) response = "Understood. For immediate card security, please use the Emergency Freeze options located in your Security dashboard or call 1-800-KATALIAN.";
            if (userMsg.toLowerCase().includes('loan')) response = "Our lending products are currently offering competitive rates. I can initiate a consultation request for you immediately.";
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
        }, 1000);
    };

    return (
        <div className="space-y-16 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Contact Information */}
                <div className="lg:col-span-7 space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-5xl font-black text-white tracking-tighter">Global Support</h2>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">Our concierge team is available around the clock to assist with your private wealth requirements.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <ContactCard icon="📞" title="Private Line" info="1-800-KATALIAN" sub="Priority Concierge 24/7" />
                        <ContactCard icon="📧" title="Secure Email" info="wealth@katalian.com" sub="Encrypted Communication" />
                        <ContactCard icon="🏢" title="Global HQ" info="1200 Financial Plaza" sub="New York, NY 10004" />
                        <ContactCard icon="🕒" title="Market Hours" info="9:00 AM - 5:00 PM" sub="EST (Monday - Friday)" />
                    </div>

                    <div className="bg-red-500/5 border border-red-500/20 p-10 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">⚠️</span>
                            <div>
                                <h3 className="text-red-400 text-xl font-black tracking-tight">Security Incident</h3>
                                <p className="text-slate-500 text-sm font-medium">Immediate actions for compromised accounts or stolen assets.</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={() => onNavigate({ name: 'security', action: 'report' })} variant="danger" fullWidth className="py-4 shadow-none border border-red-500/20">Report Stolen Asset</Button>
                            <Button onClick={() => onNavigate({ name: 'security', action: 'lockdown' })} variant="danger" fullWidth className="bg-red-900/20 hover:bg-red-900/40 border border-red-500/20 py-4 shadow-none">Account Lockdown</Button>
                        </div>
                    </div>
                </div>

                {/* Simulated Live Chat */}
                <div className="lg:col-span-5 bg-slate-900/50 rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col h-[650px] shadow-2xl">
                    <div className="bg-slate-950/50 backdrop-blur-md p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <h3 className="text-white font-black text-sm uppercase tracking-widest">Wealth Concierge</h3>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-950/20">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${
                                    m.role === 'user' ? 'bg-emerald-500 text-slate-950 rounded-tr-none' : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'
                                }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-6 bg-slate-950/50 border-t border-white/5 flex gap-3">
                        <input 
                            type="text" 
                            placeholder="Message Concierge..." 
                            className="flex-1 bg-slate-950 border border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:border-emerald-500/30 transition-all font-medium"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" className="p-4 bg-emerald-500 text-slate-950 rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                    </form>
                </div>
            </div>
            
            <div className="text-center pt-8">
                <Button variant="ghost" onClick={() => onNavigate({name:'dashboard'})} className="text-slate-500 hover:text-white">Return to Secure Dashboard</Button>
            </div>
        </div>
    );
};

const ContactCard: React.FC<{icon: string, title: string, info: string, sub: string}> = ({ icon, title, info, sub }) => (
    <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 hover:border-emerald-500/20 transition-all group shadow-sm">
        <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform origin-left">{icon}</span>
        <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">{title}</h4>
        <p className="text-emerald-500 font-mono text-lg font-bold tracking-tight">{info}</p>
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-2">{sub}</p>
    </div>
);

export default ContactScreen;
