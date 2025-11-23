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
      bg: 'bg-[var(--semantic-success)]/10',
      border: 'border-[var(--semantic-success)]/30',
      text: 'text-[var(--semantic-success)]',
      label: 'Active',
    },
    completed: {
      bg: 'bg-white/5',
      border: 'border-white/20',
      text: 'text-white/70',
      label: 'Completed',
    },
    archived: {
      bg: 'bg-white/5',
      border: 'border-[var(--neutral-border)]',
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
    <div className="group relative bg-[var(--neutral-2-surface)] rounded-xl border border-[var(--neutral-border)] hover:border-white/20 transition-all duration-200 overflow-hidden">
      <div className="relative p-4 flex flex-col h-full">
        {/* Tournament icon */}
        <div className="w-12 h-12 mb-3 rounded-lg bg-white/5 flex items-center justify-center border border-[var(--neutral-border)] group-hover:border-white/20 transition-colors duration-200">
          <div className="w-6 h-6 text-white/90">
            <TournamentIcon />
          </div>
        </div>

        {/* Game tag */}
        <div className="inline-flex items-center mb-2">
          <span className="text-xs font-bold text-[var(--base)] uppercase tracking-wider">
            {tournament.game}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
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
            <span className="font-semibold text-white">{tournament.application_count || 0}</span>
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
              ? 'bg-[var(--semantic-success)]/10 text-[var(--semantic-success)]'
              : tournament.status === 'completed'
              ? 'bg-white/5 text-white/70'
              : 'bg-white/5 text-white/40'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              tournament.status === 'active'
                ? 'bg-[var(--semantic-success)] animate-pulse'
                : tournament.status === 'completed'
                ? 'bg-white/70'
                : 'bg-white/40'
            }`} />
            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
          </div>
        </div>

        {/* Manage button */}
        <Button
          onClick={() => onManage(tournament.id)}
          variant='secondary'
          className="w-full text-sm py-2"
        >
          Manage
        </Button>
      </div>
    </div>
  );
};

// List view row component
const TournamentListRow: React.FC<{ tournament: Tournament; onManage: (id: string) => void }> = ({ tournament, onManage }) => (
  <div className="group relative bg-[var(--neutral-2-surface)] rounded-xl border border-[var(--neutral-border)] hover:border-white/20 transition-all duration-200 overflow-hidden">
    <div className="relative p-5 flex items-center gap-6">
      {/* Tournament icon */}
      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center border border-[var(--neutral-border)] group-hover:border-white/20 transition-colors duration-200">
        <div className="w-7 h-7 text-white/90">
          <TournamentIcon />
        </div>
      </div>

      {/* Tournament info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-bold text-white truncate">
            {tournament.title}
          </h3>
          <span className="flex-shrink-0 text-xs font-bold text-[var(--base)] uppercase tracking-wider">
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
            <span className="font-semibold text-white">{tournament.application_count || 0}</span>
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
          <div className="flex items-center bg-[var(--neutral-1-bg)]/60 backdrop-blur-sm rounded-[10px] p-1 border border-[var(--neutral-border)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-[var(--base)]/10 text-[var(--base)]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
              title="Grid View"
            >
              <div className="w-5 h-5">
                <GridViewIcon />
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-[var(--base)]/10 text-[var(--base)]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
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
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--base)]/20 to-[#DAFF7C]/20 flex items-center justify-center border border-[var(--base)]/20">
            <div className="w-12 h-12 text-[var(--base)]/40">
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
