"use client";

import React from 'react';
import { useAppStore } from '@/store/appStore';

import { LiveStream } from '@/types';
import { TwitchIcon, YouTubeIcon } from '@/components/icons/Icons';

interface OutletContextType {
    liveStreams: LiveStream[];
}

const LiveStreamCard: React.FC<{ stream: LiveStream }> = ({ stream }) => {
    const PlatformIcon = stream.platform === 'Twitch' ? TwitchIcon : YouTubeIcon;

    return (
        <a href={stream.stream_url} target="_blank" rel="noopener noreferrer" className="bg-[#2A2A2A] rounded-xl overflow-hidden transition-all duration-200 border border-white/10 hover:border-white/20 block group">
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <img src={stream.avatar_url} alt={stream.streamer_name} className="w-16 h-16 rounded-full border-2 border-white/20 group-hover:border-white/30 transition-colors" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <div>
                             <h3 className="text-xl font-bold text-white">{stream.streamer_name}</h3>
                             <p className="text-white/70 font-medium">{stream.game}</p>
                           </div>
                           <div className="flex items-center gap-1 text-white/70">
                                <PlatformIcon />
                                <span className="font-semibold text-sm">{stream.platform}</span>
                           </div>
                        </div>
                         <p className="text-white/70 mt-2 text-sm truncate group-hover:text-white transition-colors">{stream.title}</p>
                    </div>
                </div>
            </div>
             <div className="p-4 bg-[#1F1F1F] border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-[#22C55E] rounded-full animate-pulse"></div>
                    <span className="font-bold text-[#22C55E] text-sm tracking-wider">LIVE</span>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-white">{stream.current_viewers.toLocaleString()}</p>
                    <p className="text-xs text-white/70 uppercase">Viewers</p>
                </div>
            </div>
        </a>
    )
}

const Live: React.FC = () => {
    const { liveStreams } = useAppStore();
    return (
        <div className="space-y-5">
             <p className="text-sm text-white/60">View all currently live co-streamers for your tournaments</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {liveStreams.map(stream => (
                    <LiveStreamCard key={stream.id} stream={stream} />
                ))}
            </div>
        </div>
    )
}

export default Live;