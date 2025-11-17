"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import Link from 'next/link';
import { Tournament } from '@/types';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { PlusIcon } from '@/components/icons/Icons';
import ManageTournamentForm from '@/components/tournaments/ManageTournamentForm';

interface OutletContextType {
  tournaments: Tournament[];
  addTournament: (tournament: Omit<Tournament, 'id' | 'applications' | 'formFields'>) => void;
  updateTournament: (tournament: Tournament) => void;
}

const TournamentList: React.FC<{ tournaments: Tournament[], onManage: (id: string) => void }> = ({ tournaments, onManage }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Tournaments</h2>
            <Link href="/dashboard/tournaments/new">
              <Button icon={<PlusIcon />}>New Tournament</Button>
            </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map(t => (
                <div key={t.id} className="bg-[#2A2A2A] rounded-[10px] overflow-hidden border border-white/10 hover:border-[#DAFF7C]/30 transition-all duration-200 flex flex-col">
                    <img src={t.banner_url} alt={t.title} className="w-full h-36 object-cover"/>
                    <div className="p-5 flex-grow">
                        <p className="text-sm font-semibold text-[#9381FF]">{t.game}</p>
                        <h3 className="text-xl font-bold text-white truncate mt-1">{t.title}</h3>
                        <div className="mt-4 flex justify-between items-center text-sm">
                            <span className="text-white/70 bg-[#1F1F1F] px-3 py-1 rounded-full font-medium">{t.start_date}</span>
                            <span className="font-semibold text-white/70">{t.application_count} Apps</span>
                        </div>
                    </div>
                     <div className="p-4 bg-[#1F1F1F] border-t border-white/10">
                        <Button onClick={() => onManage(t.id)} variant='secondary' className="w-full">Manage</Button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


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
