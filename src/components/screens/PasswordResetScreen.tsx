import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const PasswordResetScreen: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="flex justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg text-center">
                <h2 className="text-3xl font-extrabold text-white">Password Reset</h2>
                <p className="text-gray-400">
                    If an account with that email exists, we have sent password reset instructions.
                    (This is a simulated feature).
                </p>
                <Button onClick={() => navigate('/login')} fullWidth>
                    Back to Login
                </Button>
            </div>
        </div>
    );
};

export default PasswordResetScreen;