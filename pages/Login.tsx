import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon, DiscordIcon, TwitchIcon } from '../components/icons/Icons';

const Login: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/dashboard'); // Navigate to dashboard after "login"
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
            {/* Animated Wave Background */}
            <div className="wave-container">
                <div className="wave wave-1"></div>
                <div className="wave wave-2"></div>
                <div className="wave wave-3"></div>
                <div className="wave wave-4"></div>
            </div>

            {/* Gradient Particles */}
            <div className="gradient-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="card-glow"></div>
                    <div className="login-header">
                        <div className="gradient-icon">
                            <div className="icon-wave"></div>
                            {/* Placeholder for a logo icon, e.g., a custom SVG or a generic one */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3.75v3.75m-3.75-3.75v3.75m-3.75-3.75h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                            </svg>
                        </div>
                        <h2>VIEWER.GG</h2>
                        <p>Welcome back! Please select your role to continue.</p>
                    </div>

                    {/* Admin Login */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-white mb-4 text-center">Login as Admin</h3>
                        <div className="space-y-4">
                            <button className="gradient-button" onClick={handleLogin}>
                                <div className="button-bg"></div>
                                <span className="button-content">
                                    <GoogleIcon className="mr-2 w-5 h-5" /> Login with Google
                                </span>
                            </button>
                            <button className="gradient-button" onClick={handleLogin}>
                                <div className="button-bg"></div>
                                <span className="button-content">
                                    <DiscordIcon className="mr-2 w-5 h-5" /> Login with Discord
                                </span>
                            </button>
                            <button className="gradient-button" onClick={handleLogin}>
                                <div className="button-bg"></div>
                                <span className="button-content">
                                    Create Account
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="divider">
                        <div className="divider-line"><div className="line-gradient"></div></div>
                        <span>OR</span>
                        <div className="divider-line"><div className="line-gradient"></div></div>
                    </div>

                    {/* Streamer Login */}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-white mb-4 text-center">Login as Streamer</h3>
                        <div className="space-y-4">
                            <button className="gradient-button" onClick={handleLogin}>
                                <div className="button-bg"></div>
                                <span className="button-content">
                                    <DiscordIcon className="mr-2 w-5 h-5" /> Login with Discord
                                </span>
                            </button>
                            <button className="gradient-button" onClick={handleLogin}>
                                <div className="button-bg"></div>
                                <span className="button-content">
                                    <TwitchIcon className="mr-2 w-5 h-5" /> Login with Twitch
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
