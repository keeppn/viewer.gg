import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { GoogleIcon, DiscordIcon, TwitchIcon } from '../components/icons/Icons'; // Assuming these icons exist or will be created

const Login: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/dashboard'); // Navigate to dashboard after "login"
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Left Section - Logo */}
            <div className="w-1/2 flex items-center justify-center bg-[#1E1E1E] border-r border-white/10">
                <h1 className="text-6xl font-bold text-[#FFCB82]">VIEWER.GG</h1>
            </div>

            {/* Right Section - Login Forms */}
            <div className="w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full space-y-8">
                    <h2 className="text-4xl font-bold text-center">Welcome Back!</h2>

                    {/* Admin Login */}
                    <div className="bg-[#121212] p-6 rounded-lg shadow-lg border border-white/10">
                        <h3 className="text-2xl font-semibold mb-4">Login as Admin</h3>
                        <div className="space-y-4">
                            <Button variant="secondary" onClick={handleLogin} className="w-full justify-center">
                                <GoogleIcon className="mr-2"/> Login with Google
                            </Button>
                            <Button variant="secondary" onClick={handleLogin} className="w-full justify-center">
                                <DiscordIcon className="mr-2"/> Login with Discord
                            </Button>
                            <Button variant="secondary" onClick={handleLogin} className="w-full justify-center">
                                Create Account
                            </Button>
                        </div>
                    </div>

                    {/* Streamer Login */}
                    <div className="bg-[#121212] p-6 rounded-lg shadow-lg border border-white/10">
                        <h3 className="text-2xl font-semibold mb-4">Login as Streamer</h3>
                        <div className="space-y-4">
                            <Button variant="secondary" onClick={handleLogin} className="w-full justify-center">
                                <DiscordIcon className="mr-2"/> Login with Discord
                            </Button>
                            <Button variant="secondary" onClick={handleLogin} className="w-full justify-center">
                                <TwitchIcon className="mr-2"/> Login with Twitch
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
