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
  return (
    <div className="relative">
      <div className="relative">
        <select
          value={selectedTournamentId || ''}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full appearance-none bg-gradient-to-br from-[var(--neutral-1-bg)]/90 to-[var(--neutral-2-surface)]/90 backdrop-blur-xl text-white rounded-lg px-4 py-2.5 pr-10 border border-white/20 focus:border-[var(--base)] focus:ring-2 focus:ring-[var(--base)]/20 outline-none transition-all cursor-pointer text-sm"
        >
          <option value="" disabled>Select Tournament</option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id} className="bg-[var(--neutral-1-bg)] text-white">
              {tournament.title} - {tournament.game}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TournamentSelector;
