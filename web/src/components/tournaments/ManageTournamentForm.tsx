import React, { useState } from 'react';
import { Tournament, FormField } from '../../types';
import Button from '../common/Button';
import { BackIcon, PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, CopyIcon } from '../icons/Icons'; // Add CopyIcon

interface ManageTournamentFormProps {
    tournament: Tournament;
    onSave: (tournament: Tournament) => void;
    onBack: () => void;
}

const ManageTournamentForm: React.FC<ManageTournamentFormProps> = ({ tournament, onSave, onBack }) => {
    const [title, setTitle] = useState(tournament.title);
    const [game, setGame] = useState(tournament.game);
    const [startDate, setStartDate] = useState(tournament.start_date);
    const [formFields, setFormFields] = useState<FormField[]>(tournament.form_fields);

    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldType, setNewFieldType] = useState<'text' | 'url' | 'number'>('text');

    const publicFormUrl = `${window.location.origin}/apply/${tournament.id}`;

    const handleAddField = () => {
        if (!newFieldLabel) return;
        const newField: FormField = {
            id: `field-${Date.now()}`,
            label: newFieldLabel,
            type: newFieldType,
            required: true
        };
        setFormFields([...formFields, newField]);
        setNewFieldLabel('');
    };

    const handleRemoveField = (id: string) => {
        setFormFields(formFields.filter(field => field.id !== id));
    };
    
    const handleMoveField = (index: number, direction: 'up' | 'down') => {
        const newFields = [...formFields];
        const field = newFields[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if(swapIndex < 0 || swapIndex >= newFields.length) return;
        
        newFields[index] = newFields[swapIndex];
        newFields[swapIndex] = field;
        
        setFormFields(newFields);
    }

    const handleSave = () => {
        onSave({
            ...tournament,
            title,
            game,
            start_date: startDate,
            form_fields: formFields
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(publicFormUrl);
        // Optionally, show a "Copied!" message
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                     <Button variant="secondary" onClick={onBack} icon={<BackIcon/>}>Back</Button>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Manage Tournament</h2>
                        <p className="text-gray-400">Editing "{tournament.title}"</p>
                    </div>
                </div>
                <Button variant="success" onClick={handleSave} className="text-lg px-6 py-3">Save All Changes</Button>
            </div>

            <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-white/10">
                <h3 className="text-xl font-bold mb-6 text-white border-b border-white/20 pb-4">Public Form URL</h3>
                <div className="flex items-center space-x-4">
                    <input type="text" value={publicFormUrl} readOnly className="w-full bg-[#121212] text-gray-400 rounded-md p-3 border border-white/20" />
                    <Button onClick={handleCopy} icon={<CopyIcon />}>Copy</Button>
                </div>
            </div>

            <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-white/10">
                <h3 className="text-xl font-bold mb-6 text-white border-b border-white/20 pb-4">Tournament Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#121212] text-white rounded-md p-2 border border-white/20 focus:ring-2 focus:ring-[#387B66] focus:border-[#387B66] outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Game</label>
                        <input type="text" value={game} onChange={e => setGame(e.target.value)} className="w-full bg-[#121212] text-white rounded-md p-2 border border-white/20 focus:ring-2 focus:ring-[#387B66] focus:border-[#387B66] outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[#121212] text-white rounded-md p-2 border border-white/20 focus:ring-2 focus:ring-[#387B66] focus:border-[#387B66] outline-none" required />
                    </div>
                </div>
            </div>

            <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-white/10">
                <h3 className="text-xl font-bold mb-6 text-white border-b border-white/20 pb-4">Application Form Questions</h3>
                <div className="space-y-4">
                    {/* Current Fields */}
                    <div className="space-y-3">
                         {formFields.length > 0 ? formFields.map((field, index) => (
                            <div key={field.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg animate-fade-in border border-white/10">
                                <div className="flex items-center space-x-4">
                                    <div className="flex flex-col space-y-1">
                                        <button onClick={() => handleMoveField(index, 'up')} disabled={index === 0} className="disabled:opacity-20 text-gray-400 hover:text-white"><ArrowUpIcon/></button>
                                        <button onClick={() => handleMoveField(index, 'down')} disabled={index === formFields.length - 1} className="disabled:opacity-20 text-gray-400 hover:text-white"><ArrowDownIcon/></button>
                                    </div>
                                    <div>
                                      <p className="font-medium text-white">{field.label}</p>
                                      <span className="text-xs text-gray-300 uppercase bg-black/30 px-2 py-0.5 rounded">{field.type}</span>
                                    </div>
                                </div>
                                <Button variant="danger" onClick={() => handleRemoveField(field.id)} className="p-2 h-9 w-9 !space-x-0"><TrashIcon/></Button>
                            </div>
                        )) : <p className="text-gray-400 text-center py-8">No custom fields yet. Add one below!</p>}
                    </div>

                    {/* Add New Field */}
                    <div className="pt-6 border-t border-white/20">
                         <h4 className="text-lg font-semibold mb-3 text-gray-200">Add New Field</h4>
                         <div className="flex items-stretch gap-2 p-3 bg-black/20 rounded-lg">
                            <input 
                                type="text" 
                                placeholder="Field Label (e.g., Twitch URL)" 
                                value={newFieldLabel}
                                onChange={e => setNewFieldLabel(e.target.value)}
                                className="flex-grow bg-[#121212] text-white rounded-md p-2 border border-white/20 focus:ring-2 focus:ring-[#387B66] focus:border-[#387B66] outline-none"
                            />
                            <select value={newFieldType} onChange={e => setNewFieldType(e.target.value as any)} className="bg-[#121212] text-white rounded-md p-2 border border-white/20 focus:ring-2 focus:ring-[#387B66] focus:border-[#387B66] outline-none">
                                <option value="text">Text</option>
                                <option value="url">URL</option>
                                <option value="number">Number</option>
                            </select>
                            <Button onClick={handleAddField} icon={<PlusIcon />}>Add</Button>
                         </div>
                    </div>
                </div>
            </div>
            <style>{`
              @keyframes fade-in {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
              }
            `}</style>
        </div>
    )
}

export default ManageTournamentForm;