import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';

interface LoginScreenProps {
    onLogin: (username: string, password: string) => 'success' | 'locked' | 'invalid';
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const result = onLogin(username, password);
        if (result === 'invalid') {
            setError('Invalid username or password.');
        } else if (result === 'locked') {
            setError('Your account is locked. Please use your reset password to log in or reset your password.');
        }
    };

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-white">Sign in to your account</h2>
                    <p className="mt-2 text-sm text-gray-400">Welcome back to Katalian Bank</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
                    <div className="rounded-md shadow-sm -space-y-px flex flex-col gap-4">
                        <Input
                            id="username"
                            label="Username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <Link to="/reset-password" className="font-medium text-teal-400 hover:text-teal-300">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <Button type="submit" fullWidth>
                            Sign in
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;