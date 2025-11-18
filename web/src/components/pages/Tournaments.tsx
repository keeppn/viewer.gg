"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import Link from 'next/link';
import { Tournament } from '@/types';
import Button from '@/components/common/Button';
import { PlusIcon, GridViewIcon, ListViewIcon, TournamentIcon, CalendarIcon, UsersIcon } from '@/components/icons/Icons';
import ManageTournamentForm from '@/components/tournaments/ManageTournamentForm';

interface OutletContextType {
  tournaments: Tournament[];
  addTournament: (tournament: Omit<Tournament, 'id' | 'applications' | 'formFields'>) => void;
  updateTournament: (tournament: Tournament) => void;
}

// Status badge component with color coding
const StatusBadge: React.FC<{ status: Tournament['status'] }> = ({ status }) => {
  const statusConfig = {
    draft: {
      bg: 'bg-white/5',
      border: 'border-white/20',
      text: 'text-white/60',
      label: 'Draft',
    },
    active: {
      bg: 'bg-gradient-to-r from-[#DAFF7C]/10 to-[#DAFF7C]/5',
      border: 'border-[#DAFF7C]/30',
      text: 'text-[#DAFF7C]',
      label: 'Active',
    },
    completed: {
      bg: 'bg-gradient-to-r from-[#9381FF]/10 to-[#9381FF]/5',
      border: 'border-[#9381FF]/30',
      text: 'text-[#9381FF]',
      label: 'Completed',
    },
    archived: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      text: 'text-white/40',
      label: 'Archived',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.border} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Grid view card component
const TournamentCard: React.FC<{ tournament: Tournament; onManage: (id: string) => void }> = ({ tournament, onManage }) => (
  <div className="group relative bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-[12px] border border-white/10 hover:border-[#9381FF]/40 transition-all duration-300 overflow-hidden">
    {/* Glowing gradient background effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#9381FF]/5 via-transparent to-[#DAFF7C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    {/* Glowing border effect on hover */}
    <div className="absolute inset-0 rounded-[12px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
         style={{ boxShadow: '0 0 30px rgba(147,129,255,0.15), inset 0 0 20px rgba(147,129,255,0.05)' }} />

    <div className="relative p-6 flex flex-col h-full">
      {/* Status badge - top right */}
      <div className="absolute top-4 right-4">
        <StatusBadge status={tournament.status} />
      </div>

      {/* Tournament icon with gradient background */}
      <div className="w-16 h-16 mb-4 rounded-[10px] bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 flex items-center justify-center border border-[#9381FF]/20 group-hover:border-[#9381FF]/40 transition-colors duration-300">
        <div className="w-8 h-8 text-[#9381FF]">
          <TournamentIcon />
        </div>
      </div>

      {/* Game tag */}
      <div className="inline-flex items-center mb-2">
        <span className="text-xs font-bold text-[#9381FF] uppercase tracking-wider">
          {tournament.game}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#DAFF7C] transition-colors duration-300">
        {tournament.title}
      </h3>

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-auto mb-4 text-sm">
        <div className="flex items-center gap-2 text-white/60">
          <div className="w-4 h-4">
            <CalendarIcon />
          </div>
          <span className="font-medium">{new Date(tournament.start_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <div className="w-4 h-4">
            <UsersIcon />
          </div>
          <span className="font-semibold text-[#DAFF7C]">{tournament.application_count}</span>
          <span>Apps</span>
        </div>
      </div>

      {/* Manage button */}
      <Button
        onClick={() => onManage(tournament.id)}
        variant='secondary'
        className="w-full bg-gradient-to-r from-[#9381FF]/10 to-[#9381FF]/5 hover:from-[#9381FF]/20 hover:to-[#9381FF]/10 border border-[#9381FF]/20 hover:border-[#9381FF]/40 text-white hover:text-[#DAFF7C]"
      >
        Manage Tournament
      </Button>
    </div>
  </div>
);

// List view row component
const TournamentListRow: React.FC<{ tournament: Tournament; onManage: (id: string) => void }> = ({ tournament, onManage }) => (
  <div className="group relative bg-gradient-to-r from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-[12px] border border-white/10 hover:border-[#9381FF]/40 transition-all duration-300 overflow-hidden">
    {/* Glowing effect on hover */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#9381FF]/5 via-transparent to-[#DAFF7C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <div className="relative p-5 flex items-center gap-6">
      {/* Tournament icon */}
      <div className="flex-shrink-0 w-14 h-14 rounded-[10px] bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 flex items-center justify-center border border-[#9381FF]/20 group-hover:border-[#9381FF]/40 transition-colors duration-300">
        <div className="w-7 h-7 text-[#9381FF]">
          <TournamentIcon />
        </div>
      </div>

      {/* Tournament info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-bold text-white truncate group-hover:text-[#DAFF7C] transition-colors duration-300">
            {tournament.title}
          </h3>
          <span className="flex-shrink-0 text-xs font-bold text-[#9381FF] uppercase tracking-wider">
            {tournament.game}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4">
              <CalendarIcon />
            </div>
            <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4">
              <UsersIcon />
            </div>
            <span className="font-semibold text-[#DAFF7C]">{tournament.application_count}</span>
            <span>Applications</span>
          </div>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex-shrink-0">
        <StatusBadge status={tournament.status} />
      </div>

      {/* Manage button */}
      <div className="flex-shrink-0">
        <Button
          onClick={() => onManage(tournament.id)}
          variant='secondary'
          className="bg-gradient-to-r from-[#9381FF]/10 to-[#9381FF]/5 hover:from-[#9381FF]/20 hover:to-[#9381FF]/10 border border-[#9381FF]/20 hover:border-[#9381FF]/40 text-white hover:text-[#DAFF7C]"
        >
          Manage
        </Button>
      </div>
    </div>
  </div>
);

// Main tournament list component
const TournamentList: React.FC<{ tournaments: Tournament[], onManage: (id: string) => void }> = ({ tournaments, onManage }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-6">
      {/* Header with view toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Tournaments</h2>
          <p className="text-white/60 text-sm">Manage your tournament events and applications</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-[#1F1F1F]/60 backdrop-blur-sm rounded-[10px] p-1 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-[8px] transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[#9381FF]/20 to-[#DAFF7C]/10 text-[#DAFF7C] shadow-lg shadow-[#9381FF]/10'
                  : 'text-white/40 hover:text-white/70'
              }`}
              title="Grid View"
            >
              <div className="w-5 h-5">
                <GridViewIcon />
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-[8px] transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-[#9381FF]/20 to-[#DAFF7C]/10 text-[#DAFF7C] shadow-lg shadow-[#9381FF]/10'
                  : 'text-white/40 hover:text-white/70'
              }`}
              title="List View"
            >
              <div className="w-5 h-5">
                <ListViewIcon />
              </div>
            </button>
          </div>

          {/* New tournament button */}
          <Link href="/dashboard/tournaments/new">
            <Button icon={<PlusIcon />} className="shadow-lg shadow-[#DAFF7C]/20">
              New Tournament
            </Button>
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {tournaments.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 flex items-center justify-center border border-[#9381FF]/20">
            <div className="w-12 h-12 text-[#9381FF]/40">
              <TournamentIcon />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Tournaments Yet</h3>
          <p className="text-white/60 mb-6">Create your first tournament to start managing applications</p>
          <Link href="/dashboard/tournaments/new">
            <Button icon={<PlusIcon />}>Create Tournament</Button>
          </Link>
        </div>
      )}

      {/* Tournament cards/list */}
      {tournaments.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map(t => (
                <TournamentCard key={t.id} tournament={t} onManage={onManage} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {tournaments.map(t => (
                <TournamentListRow key={t.id} tournament={t} onManage={onManage} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Main component
const Tournaments: React.FC = () => {
  const { tournaments, addTournament, updateTournament } = useAppStore();
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);

  const handleSaveTournament = async (tournament: Tournament) => {
    await updateTournament(tournament);
    setEditingTournamentId(null);
  }

  const selectedTournament = tournaments.find(t => t.id === editingTournamentId);

  if (selectedTournament) {
    return <ManageTournamentForm tournament={selectedTournament} onSave={handleSaveTournament} onBack={() => setEditingTournamentId(null)} />;
  }

  return (
    <>
      <TournamentList
        tournaments={tournaments}
        onManage={(id) => setEditingTournamentId(id)}
      />
    </>
  );
};

export default Tournaments;
