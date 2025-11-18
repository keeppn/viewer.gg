import React, { useState } from 'react';
import { LiveStream } from '@/types';

interface StreamerLeaderboardProps {
  streams: LiveStream[];
}

const StreamerLeaderboard: React.FC<StreamerLeaderboardProps> = ({ streams }) => {
  const [sortBy, setSortBy] = useState<'peak' | 'average' | 'current'>('peak');

  const sortedStreams = [...streams].sort((a, b) => {
    switch (sortBy) {
      case 'peak':
        return b.peak_viewers - a.peak_viewers;
      case 'average':
        return b.average_viewers - a.average_viewers;
      case 'current':
        return b.current_viewers - a.current_viewers;
      default:
        return 0;
    }
  }).slice(0, 10);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return null;
    }
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitch':
        return 'bg-[#9146FF]/20 text-[#9146FF] border-[#9146FF]/30';
      case 'youtube':
        return 'bg-[#FF0000]/20 text-[#FF0000] border-[#FF0000]/30';
      case 'kick':
        return 'bg-[#53FC18]/20 text-[#53FC18] border-[#53FC18]/30';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const hours = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60));
    const minutes = Math.floor(((now.getTime() - start.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fd934e]" />
              Top Performers
            </h3>
            <p className="text-sm text-white/60 mt-1">Leaderboard of highest performing streamers</p>
          </div>

          {/* Sort buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 mr-2">Sort by:</span>
            <button
              onClick={() => setSortBy('peak')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'peak'
                  ? 'bg-[#9381FF]/20 text-[#9381FF] border border-[#9381FF]/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Peak
            </button>
            <button
              onClick={() => setSortBy('average')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'average'
                  ? 'bg-[#9381FF]/20 text-[#9381FF] border border-[#9381FF]/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Average
            </button>
            <button
              onClick={() => setSortBy('current')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'current'
                  ? 'bg-[#9381FF]/20 text-[#9381FF] border border-[#9381FF]/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Current
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="divide-y divide-white/5">
        {sortedStreams.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 flex items-center justify-center">
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-white/60 mb-2">No live streamers yet</p>
            <p className="text-sm text-white/40">Streamers will appear here when they go live</p>
          </div>
        ) : (
          sortedStreams.map((stream, index) => (
            <div
              key={stream.id}
              className="group p-4 hover:bg-white/5 transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                {/* Rank & Medal */}
                <div className="flex-shrink-0 w-12 text-center">
                  {getMedalIcon(index) ? (
                    <span className="text-3xl">{getMedalIcon(index)}</span>
                  ) : (
                    <span className="text-xl font-bold text-white/40">#{index + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 flex items-center justify-center border border-white/10">
                    {stream.avatar_url ? (
                      <img
                        src={stream.avatar_url}
                        alt={stream.streamer_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white/60 font-bold text-lg">
                        {stream.streamer_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Streamer Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white truncate">{stream.streamer_name}</h4>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getPlatformBadgeColor(stream.platform)}`}>
                      {stream.platform}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span>{stream.game}</span>
                    <span>•</span>
                    <span>{formatDuration(stream.stream_start)}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{stream.title}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-lg font-bold text-[#DAFF7C]">
                      {stream.peak_viewers.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/60">Peak</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[#9381FF]">
                      {stream.average_viewers.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/60">Average</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      {stream.current_viewers.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/60">Current</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StreamerLeaderboard;
