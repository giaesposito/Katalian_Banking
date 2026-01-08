
import React from 'react';

const ApiDocs: React.FC = () => {
    const endpoints = [
        {
            method: 'GET',
            path: '/api/users',
            desc: 'Retrieve all users and their basic profiles.',
            body: null,
            response: 'Array<User>'
        },
        {
            method: 'GET',
            path: '/api/users/:id',
            desc: 'Retrieve a single user by their unique ID.',
            body: null,
            response: 'User | null'
        },
        {
            method: 'POST',
            path: '/api/transfers',
            desc: 'Move funds between two existing deposit accounts.',
            body: {
                fromAccountId: 'string',
                toAccountId: 'string',
                amount: 'number (float)'
            },
            response: '{ success: boolean }'
        },
        {
            method: 'POST',
            path: '/api/applications',
            desc: 'Submit a new account application (Checking, Savings, or Credit).',
            body: {
                accountType: 'Checking | Savings | Credit Card | Platinum Credit Card',
                applicationData: {
                    firstName: 'string',
                    lastName: 'string',
                    dob: 'string (ISO)',
                    initialDeposit: 'number (optional)'
                }
            },
            response: 'Account (with Pending status for cards)'
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
                <div className="bg-gray-700/50 p-4 border-b border-gray-600">
                    <h3 className="text-lg font-bold text-teal-400">Developer API Reference</h3>
                    <p className="text-xs text-gray-400">Mock endpoints for automated testing and integration simulation.</p>
                </div>
                <div className="divide-y divide-gray-700">
                    {endpoints.map((ep, i) => (
                        <div key={i} className="p-6 hover:bg-gray-700/20 transition-colors">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    ep.method === 'GET' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'
                                }`}>
                                    {ep.method}
                                </span>
                                <code className="text-white font-mono bg-black/30 px-2 py-1 rounded text-sm">
                                    {ep.path}
                                </code>
                            </div>
                            <p className="text-gray-300 text-sm mb-4">{ep.desc}</p>
                            
                            {ep.body && (
                                <div className="mb-4">
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Request Body (JSON)</p>
                                    <pre className="bg-black/40 p-3 rounded-lg text-teal-300 text-xs font-mono overflow-x-auto">
                                        {JSON.stringify(ep.body, null, 2)}
                                    </pre>
                                </div>
                            )}
                            
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Response Type</p>
                                <code className="text-purple-400 text-xs font-mono">{ep.response}</code>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ApiDocs;
