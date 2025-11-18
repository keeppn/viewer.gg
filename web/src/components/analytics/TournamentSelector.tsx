import React from 'react';
import { Tournament } from '@/types';

interface TournamentSelectorProps {
  tournaments: Tournament[];
  selectedTournamentId: string | null;
  onSelect: (tournamentId: string) => void;
}

const TournamentSelector: React.FC<TournamentSelectorProps> = ({
  tournaments,
  selectedTournamentId,
  onSelect
}) => {
  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white/70 mb-2">
        Tournament
      </label>
      <div className="relative">
        <select
          value={selectedTournamentId || ''}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full appearance-none bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl text-white rounded-lg px-4 py-3 pr-10 border border-white/20 focus:border-[#9381FF] focus:ring-2 focus:ring-[#9381FF]/20 outline-none transition-all cursor-pointer"
        >
          <option value="" disabled>Select a tournament</option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id} className="bg-[#1F1F1F] text-white">
              {tournament.title} - {tournament.game}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Selected tournament info */}
      {selectedTournament && (
        <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-white/60">Status:</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                selectedTournament.status === 'active'
                  ? 'bg-[#DAFF7C]/10 text-[#DAFF7C]'
                  : selectedTournament.status === 'completed'
                  ? 'bg-[#9381FF]/10 text-[#9381FF]'
                  : 'bg-white/10 text-white/60'
              }`}>
                {selectedTournament.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60">Applications:</span>
              <span className="text-[#DAFF7C] font-semibold">
                {selectedTournament.application_count || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentSelector;
