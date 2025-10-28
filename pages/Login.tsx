import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon, DiscordIcon, TwitchIcon } from '../components/icons/Icons';
import styles from './Login.module.css'; // Import the CSS module

const Login: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/dashboard'); // Navigate to dashboard after "login"
    };

    return (
        <div className={`${styles.loginBody} flex flex-col md:flex-row min-h-screen items-center justify-center p-5 relative overflow-hidden`}>
            {/* Animated Wave Background */}
            <div className={styles.waveContainer}>
                <div className={`${styles.wave} ${styles.wave1}`}></div>
                <div className={`${styles.wave} ${styles.wave2}`}></div>
                <div className={`${styles.wave} ${styles.wave3}`}></div>
                <div className={`${styles.wave} ${styles.wave4}`}></div>
            </div>

            {/* Gradient Particles */}
            <div className={styles.gradientParticles}>
                <div className={styles.particle}></div>
                <div className={styles.particle}></div>
                <div className={styles.particle}></div>
                <div className={styles.particle}></div>
                <div className={styles.particle}></div>
                <div className={styles.particle}></div>
            </div>

            {/* Left Section - Logo */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 z-10">
                <div className="text-center md:text-left">
                    <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight">VIEWER.GG</h1>
                    <p className="mt-4 text-xl text-gray-300">Your ultimate co-streaming dashboard.</p>
                </div>
            </div>

            {/* Right Section - Login Forms */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 z-10">
                <div className={styles.loginContainer}>
                    <div className={styles.loginCard}>
                        <div className={styles.cardGlow}></div>
                        <div className={styles.loginHeader}>
                            <h2>Welcome Back!</h2>
                            <p>Please select your role to continue.</p>
                        </div>

                        {/* Admin Login */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-white mb-4 text-center">Login as Admin</h3>
                            <div className="space-y-4">
                                <button className={styles.gradientButton} onClick={handleLogin}>
                                    <div className={styles.buttonBg}></div>
                                    <span className={styles.buttonContent}>
                                        <GoogleIcon className="mr-2 w-5 h-5" /> Login with Google
                                    </span>
                                </button>
                                <button className={styles.gradientButton} onClick={handleLogin}>
                                    <div className={styles.buttonBg}></div>
                                    <span className={styles.buttonContent}>
                                        <DiscordIcon className="mr-2 w-5 h-5" /> Login with Discord
                                    </span>
                                </button>
                                <button className={styles.gradientButton} onClick={handleLogin}>
                                    <div className={styles.buttonBg}></div>
                                    <span className={styles.buttonContent}>
                                        Create Account
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className={styles.divider}>
                            <div className={styles.dividerLine}><div className={styles.lineGradient}></div></div>
                            <span>OR</span>
                            <div className={styles.dividerLine}><div className={styles.lineGradient}></div></div>
                        </div>

                        {/* Streamer Login */}
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-white mb-4 text-center">Login as Streamer</h3>
                            <div className="space-y-4">
                                <button className={styles.gradientButton} onClick={handleLogin}>
                                    <div className={styles.buttonBg}></div>
                                    <span className={styles.buttonContent}>
                                        <DiscordIcon className="mr-2 w-5 h-5" /> Login with Discord
                                    </span>
                                </button>
                                <button className={styles.gradientButton} onClick={handleLogin}>
                                    <div className={styles.buttonBg}></div>
                                    <span className={styles.buttonContent}>
                                        <TwitchIcon className="mr-2 w-5 h-5" /> Login with Twitch
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
