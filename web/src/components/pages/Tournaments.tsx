"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Tournament } from '@/types';
import Button from '@/components/common/Button';
import { PlusIcon, GridViewIcon, ListViewIcon, TournamentIcon, CalendarIcon, DocumentIcon } from '@/components/icons/Icons';
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
const TournamentCard: React.FC<{ tournament: Tournament; onManage: (id: string) => void }> = ({ tournament, onManage }) => {
  // Calculate form field count
  const formFieldCount = tournament.form_fields?.length || 0;

  return (
    <div className="group relative bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-[12px] border border-white/10 hover:border-[#9381FF]/40 transition-all duration-300 overflow-hidden">
      {/* Glowing gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#9381FF]/5 via-transparent to-[#DAFF7C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Glowing border effect on hover */}
      <div className="absolute inset-0 rounded-[12px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
           style={{ boxShadow: '0 0 30px rgba(147,129,255,0.15), inset 0 0 20px rgba(147,129,255,0.05)' }} />

      <div className="relative p-4 flex flex-col h-full">
        {/* Tournament icon with gradient background */}
        <div className="w-12 h-12 mb-3 rounded-[10px] bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 flex items-center justify-center border border-[#9381FF]/20 group-hover:border-[#9381FF]/40 transition-colors duration-300">
          <div className="w-6 h-6 text-[#9381FF]">
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
        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-[#DAFF7C] transition-colors duration-300">
          {tournament.title}
        </h3>

        {/* Stats rows */}
        <div className="space-y-2 mt-auto mb-3 text-sm">
          {/* Date range */}
          <div className="flex items-center gap-2 text-white/60">
            <div className="w-4 h-4">
              <CalendarIcon />
            </div>
            <span className="font-medium text-xs">
              {new Date(tournament.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {tournament.end_date && ` - ${new Date(tournament.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </span>
          </div>

          {/* Applications count */}
          <div className="flex items-center gap-2 text-white/60">
            <div className="w-4 h-4">
              <DocumentIcon />
            </div>
            <span className="font-semibold text-[#DAFF7C]">{tournament.application_count || 0}</span>
            <span className="text-xs">Applications</span>
          </div>

          {/* Form fields count */}
          {formFieldCount > 0 && (
            <div className="flex items-center gap-2 text-white/60">
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <span className="text-xs">{formFieldCount} form {formFieldCount === 1 ? 'field' : 'fields'}</span>
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="mb-3">
          <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${
            tournament.status === 'active'
              ? 'bg-[#DAFF7C]/10 text-[#DAFF7C]'
              : tournament.status === 'completed'
              ? 'bg-[#9381FF]/10 text-[#9381FF]'
              : 'bg-white/5 text-white/40'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              tournament.status === 'active'
                ? 'bg-[#DAFF7C] animate-pulse'
                : tournament.status === 'completed'
                ? 'bg-[#9381FF]'
                : 'bg-white/40'
            }`} />
            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
          </div>
        </div>

        {/* Manage button */}
        <Button
          onClick={() => onManage(tournament.id)}
          variant='secondary'
          className="w-full bg-gradient-to-r from-[#9381FF]/10 to-[#9381FF]/5 hover:from-[#9381FF]/20 hover:to-[#9381FF]/10 border border-[#9381FF]/20 hover:border-[#9381FF]/40 text-white hover:text-[#DAFF7C] text-sm py-2"
        >
          Manage
        </Button>
      </div>
    </div>
  );
};

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
              <DocumentIcon />
            </div>
            <span className="font-semibold text-[#DAFF7C]">{tournament.application_count || 0}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
  const { tournaments, addTournament, updateTournament, fetchTournaments } = useAppStore();
  const { organization } = useAuthStore();
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);

  // Fetch tournaments when component mounts or when organization changes
  React.useEffect(() => {
    if (organization?.id) {
      console.log('[Tournaments] Fetching tournaments for organization:', organization.id);
      fetchTournaments(organization.id);
    }
  }, [organization?.id]); // Refetch when organization changes

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
