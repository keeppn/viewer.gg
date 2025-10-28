import React, { useState } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { Tournament, Application } from '../types';
import Button from '../components/common/Button';

interface OutletContextType {
  tournaments: Tournament[];
  addApplication: (application: Omit<Application, 'id'>) => void;
}

const Apply: React.FC = () => {
  const { tournaments, addApplication } = useOutletContext<OutletContextType>();
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const tournament = tournaments.find(t => t.id === parseInt(tournamentId || ''));

  const [formData, setFormData] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

    const newApplication: Omit<Application, 'id'> = {
      streamer: {
        name: formData.streamerName,
        followers: 0, // Mock data, as we are not fetching this from the form
      },
      tournament: tournament.title,
      language: 'English', // Mock data
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };

    addApplication(newApplication);
    navigate('/applications');
  };

  if (!tournament) {
    return <div>Tournament not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-white/10">
      <img src={tournament.bannerUrl} alt={tournament.title} className="w-full h-48 object-cover rounded-t-lg"/>
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-2 text-white">{tournament.title}</h2>
        <p className="text-lg text-gray-400 mb-6">{tournament.game}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Standard Fields */}
          <h3 className="text-xl font-semibold text-white border-t border-white/20 pt-6 mt-6">Your Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Streamer Name</label>
            <input type="text" name="streamerName" onChange={handleChange} className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="email" name="email" onChange={handleChange} className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20" required />
          </div>

          {/* Custom Fields */}
          {tournament.formFields.length > 0 && (
            <h3 className="text-xl font-semibold text-white border-t border-white/20 pt-6 mt-6">Tournament Questions</h3>
          )}
          {tournament.formFields.map(field => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-300 mb-1">{field.label}{field.required && '*'}</label>
              <input 
                type={field.type} 
                name={field.id} 
                onChange={handleChange} 
                className="w-full bg-[#121212] text-white rounded-md p-3 border border-white/20" 
                required={field.required} 
              />
            </div>
          ))}

          <div className="pt-6">
            <Button type="submit" variant="primary" className="w-full text-lg py-3">Submit Application</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Apply;
