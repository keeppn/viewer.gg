import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Tournament } from '../types';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { PlusIcon } from '../components/icons/Icons';
import ManageTournamentForm from '../components/tournaments/ManageTournamentForm';

interface OutletContextType {
  tournaments: Tournament[];
  addTournament: (tournament: Omit<Tournament, 'id' | 'applications' | 'formFields'>) => void;
  updateTournament: (tournament: Tournament) => void;
}

const TournamentList: React.FC<{ tournaments: Tournament[], onManage: (id: number) => void }> = ({ tournaments, onManage }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">Tournaments</h2>
            <Link to="/tournaments/new">
              <Button icon={<PlusIcon />}>New Tournament</Button>
            </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map(t => (
                <div key={t.id} className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-sm transition-all duration-300 border border-white/10 group flex flex-col">
                    <img src={t.bannerUrl} alt={t.title} className="w-full h-36 object-cover"/>
                    <div className="p-5 flex-grow">
                        <p className="text-sm font-semibold text-[#FFCB82]">{t.game}</p>
                        <h3 className="text-xl font-bold text-white truncate mt-1">{t.title}</h3>
                        <div className="mt-4 flex justify-between items-center text-sm">
                            <span className="text-gray-300 bg-black/20 px-2 py-1 rounded-md font-medium">{t.date}</span>
                            <span className="font-semibold text-gray-300">{t.applications} Applications</span>
                        </div>
                    </div>
                     <div className="p-4 bg-black/20 border-t border-white/10">
                        <Button onClick={() => onManage(t.id)} variant='secondary' className="w-full">Manage Tournament</Button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


const Tournaments: React.FC = () => {
  const { tournaments, addTournament, updateTournament } = useOutletContext<OutletContextType>();
  const [editingTournamentId, setEditingTournamentId] = useState<number | null>(null);
  
  const handleSaveTournament = (tournament: Tournament) => {
    updateTournament(tournament);
    setEditingTournamentId(null);
  }

  const selectedTournament = tournaments.find(t => t.id === editingTournamentId);

  if (selectedTournament) {
    return <ManageTournamentForm tournament={selectedTournament} onSave={handleSaveTournament} onBack={() => setEditingTournamentId(null)} />;}
  
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