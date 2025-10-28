import React, { useState } from 'react';
import Button from '../components/common/Button';
import { Tournament } from '../types';
import { useOutletContext, useNavigate } from 'react-router-dom';

interface OutletContextType {
  addTournament: (tournament: Omit<Tournament, 'id' | 'applications' | 'formFields'>) => void;
}

const NewTournament: React.FC = () => {
  const { addTournament } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    game: '',
    date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.game || !formData.date) return;
    const bannerUrl = `https://picsum.photos/seed/${formData.game.replace(/\s/g, '-')}${Date.now()}/800/200`;
    addTournament({ ...formData, bannerUrl });
    navigate('/tournaments');
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-white/10">
      <h2 className="text-2xl font-bold mb-6 text-white">Create New Tournament</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Tournament Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20 focus:ring-2 focus:ring-[#387B66] focus:border-[#387B66] outline-none"
            required
          />
        </div>
        <div>
          <label htmlFor="game" className="block text-sm font-medium text-gray-300 mb-1">Game</label>
          <input
            type="text"
            id="game"
            name="game"
            value={formData.game}
            onChange={handleChange}
            className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20 focus:ring-2 focus:ring-[#387B66] focus:border-[#387B66] outline-none"
            required
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20 focus:ring-2 focus:ring-[#387B66] focus:border-[#387B66] outline-none"
            required
          />
        </div>
        {/* Add fields for description, start/end dates, and branding later */}
        <div className="flex justify-end pt-4 space-x-2">
          <Button type="button" variant="secondary" onClick={() => navigate('/tournaments')}>Cancel</Button>
          <Button type="submit">Create Tournament</Button>
        </div>
      </form>
    </div>
  );
};

export default NewTournament;
