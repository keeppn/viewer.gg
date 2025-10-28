import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { LiveStream } from '../types';
import { TwitchIcon, YouTubeIcon } from '../components/icons/Icons';

interface OutletContextType {
    liveStreams: LiveStream[];
}

const LiveStreamCard: React.FC<{ stream: LiveStream }> = ({ stream }) => {
    const PlatformIcon = stream.platform === 'Twitch' ? TwitchIcon : YouTubeIcon;

    return (
        <a href={stream.streamUrl} target="_blank" rel="noopener noreferrer" className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-sm transition-all duration-300 border border-white/10 hover:border-[#387B66]/80 hover:shadow-lg hover:shadow-[#387B66]/10 hover:-translate-y-1 block group">
            <div className="p-5">
                <div className="flex items-start space-x-4">
                    <img src={stream.avatarUrl} alt={stream.streamerName} className={`w-16 h-16 rounded-full border-2 border-white/20 group-hover:border-[#387B66] transition-colors`} />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <div>
                             <h3 className="text-xl font-bold text-white">{stream.streamerName}</h3>
                             <p className="text-gray-400 font-medium">{stream.game}</p>
                           </div>
                           <div className="flex items-center space-x-1 text-[#FFCB82]">
                                <PlatformIcon />
                                <span className="font-semibold text-sm">{stream.platform}</span>
                           </div>
                        </div>
                         <p className="text-gray-300 mt-2 text-sm truncate group-hover:text-white transition-colors">{stream.title}</p>
                    </div>
                </div>
            </div>
             <div className="p-4 bg-black/20 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-[#FFCB82] rounded-full animate-pulse"></div>
                    <span className="font-bold text-[#FFCB82] text-sm tracking-wider">LIVE</span>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-white">{stream.currentViewers.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 uppercase">Viewers</p>
                </div>
            </div>
        </a>
    )
}

const Live: React.FC = () => {
    const { liveStreams } = useOutletContext<OutletContextType>();
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Live Co-streamers</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveStreams.map(stream => (
                    <LiveStreamCard key={stream.id} stream={stream} />
                ))}
            </div>
        </div>
    )
}

export default Live;