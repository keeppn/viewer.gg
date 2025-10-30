"use client";



import React, { useState } from 'react';
import Button from '@/components/common/Button';

const Settings: React.FC = () => {
    const [discordServerId, setDiscordServerId] = useState('');
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

    const handleConnect = () => {
        if (!discordServerId) return;
        setConnectionStatus('connecting');
        setTimeout(() => {
            setConnectionStatus('connected');
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-white/10">
                <h2 className="text-2xl font-bold mb-1 text-white">Discord Integration</h2>
                <p className="text-gray-400 mb-6">Connect the viewer.gg bot to your Discord server to automate role assignments and announcements for approved co-streamers.</p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="discordId" className="block text-sm font-medium text-gray-300 mb-1">Discord Server ID</label>
                        <input
                            type="text"
                            id="discordId"
                            value={discordServerId}
                            onChange={(e) => setDiscordServerId(e.target.value)}
                            placeholder="Enter your server ID"
                            className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20 focus:ring-2 focus:ring-[#387B66] focus:border-[#387B66] outline-none"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Button 
                            onClick={handleConnect} 
                            disabled={!discordServerId || connectionStatus !== 'disconnected'}
                            variant={connectionStatus === 'connected' ? 'success' : 'primary'}
                        >
                            {connectionStatus === 'disconnected' && 'Connect Bot'}
                            {connectionStatus === 'connecting' && 'Connecting...'}
                            {connectionStatus === 'connected' && 'Connected'}
                        </Button>
                        {connectionStatus === 'connected' && (
                            <span className="text-green-400 font-semibold">Successfully Connected!</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-white/10">
                <h2 className="text-2xl font-bold mb-4 text-white">Account Settings</h2>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                        <input type="text" value="Admin" disabled className="w-full bg-black/20 text-gray-400 rounded-md p-3 border border-white/20 cursor-not-allowed"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input type="email" value="admin@viewer.gg" disabled className="w-full bg-black/20 text-gray-400 rounded-md p-3 border border-white/20 cursor-not-allowed"/>
                    </div>
                    <Button variant="secondary">Change Password</Button>
                </div>
            </div>
        </div>
    );
};

export default Settings;