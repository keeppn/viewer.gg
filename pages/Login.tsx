import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { signInWithProvider } from '../lib/supabase';
import { TwitchIcon, GoogleIcon, DiscordIcon } from '../components/icons/Icons';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, initialized, initialize } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleProviderLogin = async (provider: 'twitch' | 'google' | 'discord') => {
    try {
      await signInWithProvider(provider);
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-[#387B66] to-[#2a5f50] rounded-2xl mb-4">
            <h1 className="text-4xl font-bold text-white tracking-tight">viewer.gg</h1>
          </div>
          <p className="text-gray-400 text-lg">Co-streaming Management Platform</p>
          <p className="text-gray-500 text-sm mt-2">Streamline your tournament co-streamer operations</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1E1E1E] border border-white/10 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Welcome Back</h2>
          <p className="text-gray-400 text-center mb-8">Sign in with your preferred platform</p>

          <div className="space-y-4">
            {/* Twitch Login */}
            <button
              onClick={() => handleProviderLogin('twitch')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#9146FF] hover:bg-[#7d3dd9] text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-[#9146FF]/20"
            >
              <TwitchIcon className="w-6 h-6" />
              <span>Continue with Twitch</span>
            </button>

            {/* Google Login */}
            <button
              onClick={() => handleProviderLogin('google')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <GoogleIcon className="w-6 h-6" />
              <span>Continue with Google</span>
            </button>

            {/* Discord Login */}
            <button
              onClick={() => handleProviderLogin('discord')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-[#5865F2]/20"
            >
              <DiscordIcon className="w-6 h-6" />
              <span>Continue with Discord</span>
            </button>
          </div>

          <p className="text-gray-500 text-xs text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-[#1E1E1E]/50 border border-white/5 rounded-xl p-4">
            <div className="text-[#FFCB82] text-2xl font-bold mb-1">∞</div>
            <div className="text-gray-400 text-xs">Applications</div>
          </div>
          <div className="bg-[#1E1E1E]/50 border border-white/5 rounded-xl p-4">
            <div className="text-[#387B66] text-2xl font-bold mb-1">📊</div>
            <div className="text-gray-400 text-xs">Analytics</div>
          </div>
          <div className="bg-[#1E1E1E]/50 border border-white/5 rounded-xl p-4">
            <div className="text-[#CBD83B] text-2xl font-bold mb-1">🤖</div>
            <div className="text-gray-400 text-xs">Discord Bot</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
