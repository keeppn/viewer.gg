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
        <a href={stream.stream_url} target="_blank" rel="noopener noreferrer" className="bg-[var(--neutral-2-surface)] rounded-2xl overflow-hidden transition-all duration-200 border border-[var(--neutral-border)] hover:border-white/20 block group hover:-translate-y-1">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <img src={stream.avatar_url} alt={stream.streamer_name} className="w-16 h-16 rounded-full border-2 border-white/20 group-hover:border-white/30 transition-colors" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <div>
                             <h3 className="text-xl font-bold text-white">{stream.streamer_name}</h3>
                             <p className="text-white/70 font-medium">{stream.game}</p>
                           </div>
                           <div className="flex items-center gap-2 text-white/70">
                                <PlatformIcon />
                                <span className="font-semibold text-sm">{stream.platform}</span>
                           </div>
                        </div>
                         <p className="text-white/70 mt-2 text-sm truncate group-hover:text-white transition-colors">{stream.title}</p>
                    </div>
                </div>
            </div>
             <div className="p-4 bg-[var(--neutral-1-bg)] border-t border-[var(--neutral-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--semantic-success)] rounded-full animate-pulse"></div>
                    <span className="font-bold text-[var(--semantic-success)] text-sm tracking-wider">LIVE</span>
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
        <div className="space-y-6">
             <p className="text-sm text-white/60">View all currently live co-streamers for your tournaments</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveStreams.map(stream => (
                    <LiveStreamCard key={stream.id} stream={stream} />
                ))}
            </div>
        </div>
    )
}

export default Live;