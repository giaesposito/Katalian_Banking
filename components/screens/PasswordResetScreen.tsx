
import React from 'react';
import { ViewType } from '../../types';
import Button from '../common/Button';

interface PasswordResetScreenProps {
    onNavigate: (view: ViewType) => void;
}

const PasswordResetScreen: React.FC<PasswordResetScreenProps> = ({ onNavigate }) => {
    return (
        <div className="flex justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg text-center">
                <h2 className="text-3xl font-extrabold text-white">Password Reset</h2>
                <p className="text-gray-400">
                    If an account with that email exists, we have sent password reset instructions.
                    (This is a simulated feature).
                </p>
                <Button onClick={() => onNavigate({ name: 'login' })} fullWidth>
                    Back to Login
                </Button>
            </div>
        </div>
    );
};

export default PasswordResetScreen;
