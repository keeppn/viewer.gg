import React, { useState } from 'react';
import { Tournament, FormField } from '../../types';
import Button from '../common/Button';
import { BackIcon, PlusIcon, TrashIcon, CopyIcon } from '../icons/Icons';

interface ManageTournamentFormProps {
    tournament: Tournament;
    onSave: (tournament: Tournament) => void;
    onBack: () => void;
}

// Field type options with icons and descriptions
const FIELD_TYPES = [
    { value: 'text', label: 'Short Text', icon: '📝', description: 'Single line text input' },
    { value: 'textarea', label: 'Long Text', icon: '📄', description: 'Multi-line text area' },
    { value: 'email', label: 'Email', icon: '📧', description: 'Email address' },
    { value: 'url', label: 'URL', icon: '🔗', description: 'Website or social media link' },
    { value: 'number', label: 'Number', icon: '🔢', description: 'Numeric value' },
    { value: 'phone', label: 'Phone', icon: '📱', description: 'Phone number' },
    { value: 'date', label: 'Date', icon: '📅', description: 'Date picker' },
    { value: 'select', label: 'Dropdown', icon: '📋', description: 'Single choice from list' },
    { value: 'radio', label: 'Multiple Choice', icon: '⭕', description: 'Select one option' },
    { value: 'checkbox', label: 'Checkboxes', icon: '☑️', description: 'Select multiple options' },
] as const;

type FieldType = typeof FIELD_TYPES[number]['value'];

// Field preview components for the live preview
const FieldPreview: React.FC<{ field: FormField; isSelected: boolean; onClick: () => void }> = ({ field, isSelected, onClick }) => {
    const renderInput = () => {
        switch (field.type) {
            case 'textarea':
                return <textarea placeholder="Your answer here..." className="w-full bg-white/5 text-white rounded-lg p-3 border border-white/20 focus:border-[#9381FF] focus:ring-2 focus:ring-[#9381FF]/20 outline-none resize-none" rows={4} />;
            case 'select':
                return (
                    <select className="w-full bg-white/5 text-white rounded-lg p-3 border border-white/20 focus:border-[#9381FF] outline-none">
                        <option value="">Choose an option...</option>
                        {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                );
            case 'radio':
                return (
                    <div className="space-y-2">
                        {field.options?.map((opt, i) => (
                            <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                <input type="radio" name={field.id} className="w-4 h-4 text-[#9381FF] border-white/20 focus:ring-[#9381FF]" />
                                <span className="text-white/80">{opt}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'checkbox':
                return (
                    <div className="space-y-2">
                        {field.options?.map((opt, i) => (
                            <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                <input type="checkbox" className="w-4 h-4 text-[#9381FF] border-white/20 rounded focus:ring-[#9381FF]" />
                                <span className="text-white/80">{opt}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'date':
                return <input type="date" className="w-full bg-white/5 text-white rounded-lg p-3 border border-white/20 focus:border-[#9381FF] focus:ring-2 focus:ring-[#9381FF]/20 outline-none" />;
            case 'email':
            case 'phone':
            case 'url':
            case 'number':
            case 'text':
            default:
                return <input type={field.type === 'text' ? 'text' : field.type} placeholder="Your answer here..." className="w-full bg-white/5 text-white rounded-lg p-3 border border-white/20 focus:border-[#9381FF] focus:ring-2 focus:ring-[#9381FF]/20 outline-none" />;
        }
    };

    return (
        <div
            onClick={onClick}
            className={`group p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                isSelected
                    ? 'border-[#9381FF] bg-gradient-to-br from-[#9381FF]/10 to-transparent shadow-lg shadow-[#9381FF]/20'
                    : 'border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-[#9381FF]/50'
            }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <label className="block text-white font-medium mb-1">
                        {field.label}
                        {field.required && <span className="text-[#fd934e] ml-1">*</span>}
                    </label>
                    {field.description && (
                        <p className="text-sm text-white/60 mb-3">{field.description}</p>
                    )}
                </div>
                {isSelected && (
                    <span className="text-xs font-semibold text-[#9381FF] bg-[#9381FF]/10 px-2 py-1 rounded-full">
                        Selected
                    </span>
                )}
            </div>
            {renderInput()}
        </div>
    );
};

const ManageTournamentForm: React.FC<ManageTournamentFormProps> = ({ tournament, onSave, onBack }) => {
    const [title, setTitle] = useState(tournament.title);
    const [game, setGame] = useState(tournament.game);
    const [startDate, setStartDate] = useState(tournament.start_date);
    const [formFields, setFormFields] = useState<FormField[]>(tournament.form_fields || []);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [showAddField, setShowAddField] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const publicFormUrl = `${window.location.origin}/apply/${tournament.id}`;
    const selectedField = formFields.find(f => f.id === selectedFieldId);

    const handleAddField = (type: FieldType) => {
        const typeConfig = FIELD_TYPES.find(t => t.value === type);
        const newField: FormField = {
            id: `field-${Date.now()}`,
            label: `${typeConfig?.label || 'New Field'}`,
            type: type as any,
            required: true,
            description: '',
            options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
        };
        setFormFields([...formFields, newField]);
        setSelectedFieldId(newField.id);
        setShowAddField(false);
    };

    const handleUpdateField = (id: string, updates: Partial<FormField>) => {
        setFormFields(formFields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleDuplicateField = (field: FormField) => {
        const newField = { ...field, id: `field-${Date.now()}`, label: `${field.label} (Copy)` };
        const index = formFields.findIndex(f => f.id === field.id);
        const newFields = [...formFields];
        newFields.splice(index + 1, 0, newField);
        setFormFields(newFields);
        setSelectedFieldId(newField.id);
    };

    const handleRemoveField = (id: string) => {
        setFormFields(formFields.filter(field => field.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newFields = [...formFields];
        const draggedField = newFields[draggedIndex];
        newFields.splice(draggedIndex, 1);
        newFields.splice(index, 0, draggedField);

        setFormFields(newFields);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSave = async () => {
        try {
            const updatedTournament = {
                ...tournament,
                title,
                game,
                start_date: startDate,
                form_fields: formFields
            };

            await onSave(updatedTournament);
            alert('Tournament saved successfully!');
        } catch (error) {
            console.error('Error saving tournament:', error);
            alert('Failed to save tournament. Please try again.');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(publicFormUrl);
        alert('Form URL copied to clipboard!');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="secondary" onClick={onBack} icon={<BackIcon />}>Back</Button>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Manage Tournament</h2>
                        <p className="text-white/60 text-sm">Build your custom application form</p>
                    </div>
                </div>
                <Button onClick={handleSave} className="shadow-lg shadow-[#DAFF7C]/20">
                    Save All Changes
                </Button>
            </div>

            {/* Tournament Details */}
            <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9381FF]" />
                    Tournament Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-white/5 text-white rounded-lg p-3 border border-white/20 focus:border-[#9381FF] focus:ring-2 focus:ring-[#9381FF]/20 outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Game</label>
                        <input
                            type="text"
                            value={game}
                            onChange={e => setGame(e.target.value)}
                            className="w-full bg-white/5 text-white rounded-lg p-3 border border-white/20 focus:border-[#9381FF] focus:ring-2 focus:ring-[#9381FF]/20 outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full bg-white/5 text-white rounded-lg p-3 border border-white/20 focus:border-[#9381FF] focus:ring-2 focus:ring-[#9381FF]/20 outline-none transition-all"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Form URL */}
            <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DAFF7C]" />
                    Public Application URL
                </h3>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={publicFormUrl}
                        readOnly
                        className="flex-1 bg-white/5 text-white/80 rounded-lg p-3 border border-white/20 font-mono text-sm"
                    />
                    <Button onClick={handleCopy} icon={<CopyIcon />} variant="secondary">
                        Copy
                    </Button>
                </div>
            </div>

            {/* Form Builder - Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Field List & Editor */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#fd934e]" />
                                    Form Fields ({formFields.length})
                                </h3>
                                <Button
                                    onClick={() => setShowAddField(!showAddField)}
                                    icon={<PlusIcon />}
                                    className="shadow-lg shadow-[#DAFF7C]/20"
                                >
                                    Add Field
                                </Button>
                            </div>
                        </div>

                        {/* Add Field Type Selector */}
                        {showAddField && (
                            <div className="p-6 bg-gradient-to-br from-[#9381FF]/5 to-transparent border-b border-white/10">
                                <p className="text-sm text-white/70 mb-3">Select field type:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {FIELD_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => handleAddField(type.value)}
                                            className="group flex items-start gap-3 p-3 rounded-lg border border-white/10 hover:border-[#9381FF]/50 bg-white/5 hover:bg-[#9381FF]/10 transition-all text-left"
                                        >
                                            <span className="text-2xl flex-shrink-0">{type.icon}</span>
                                            <div className="min-w-0">
                                                <div className="font-medium text-white text-sm group-hover:text-[#DAFF7C] transition-colors">{type.label}</div>
                                                <div className="text-xs text-white/50 truncate">{type.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Field List */}
                        <div className="p-6 space-y-3 max-h-[600px] overflow-y-auto">
                            {formFields.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 flex items-center justify-center">
                                        <span className="text-3xl">📝</span>
                                    </div>
                                    <p className="text-white/60 mb-2">No fields yet</p>
                                    <p className="text-sm text-white/40">Click "Add Field" to create your first question</p>
                                </div>
                            ) : (
                                formFields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => setSelectedFieldId(field.id)}
                                        className={`group relative p-4 rounded-lg border-2 transition-all duration-200 cursor-move ${
                                            selectedFieldId === field.id
                                                ? 'border-[#9381FF] bg-gradient-to-br from-[#9381FF]/10 to-transparent shadow-lg shadow-[#9381FF]/10'
                                                : 'border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-[#9381FF]/50'
                                        } ${draggedIndex === index ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-lg">
                                                        {FIELD_TYPES.find(t => t.value === field.type)?.icon || '📝'}
                                                    </span>
                                                    <h4 className="font-medium text-white truncate">{field.label}</h4>
                                                    {field.required && <span className="text-xs text-[#fd934e]">*</span>}
                                                </div>
                                                <p className="text-xs text-white/50">
                                                    {FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDuplicateField(field); }}
                                                    className="p-1.5 rounded-md hover:bg-[#9381FF]/20 text-white/60 hover:text-[#9381FF] transition-colors"
                                                    title="Duplicate"
                                                >
                                                    <CopyIcon />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveField(field.id); }}
                                                    className="p-1.5 rounded-md hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Field Settings Panel */}
                    {selectedField && (
                        <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#9381FF]" />
                                Field Settings
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Question Label</label>
                                    <input
                                        type="text"
                                        value={selectedField.label}
                                        onChange={(e) => handleUpdateField(selectedField.id, { label: e.target.value })}
                                        className="w-full bg-white/5 text-white rounded-lg p-3 border border-white/20 focus:border-[#9381FF] focus:ring-2 focus:ring-[#9381FF]/20 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Description (Optional)</label>
                                    <textarea
                                        value={selectedField.description || ''}
                                        onChange={(e) => handleUpdateField(selectedField.id, { description: e.target.value })}
                                        className="w-full bg-white/5 text-white rounded-lg p-3 border border-white/20 focus:border-[#9381FF] focus:ring-2 focus:ring-[#9381FF]/20 outline-none transition-all resize-none"
                                        rows={2}
                                        placeholder="Add helpful text..."
                                    />
                                </div>
                                {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Options (one per line)</label>
                                        <textarea
                                            value={selectedField.options?.join('\n') || ''}
                                            onChange={(e) => handleUpdateField(selectedField.id, { options: e.target.value.split('\n').filter(o => o.trim()) })}
                                            className="w-full bg-white/5 text-white rounded-lg p-3 border border-white/20 focus:border-[#9381FF] focus:ring-2 focus:ring-[#9381FF]/20 outline-none transition-all resize-none font-mono text-sm"
                                            rows={4}
                                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                                        />
                                    </div>
                                )}
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                    <div>
                                        <p className="font-medium text-white text-sm">Required Field</p>
                                        <p className="text-xs text-white/50">Applicants must answer this question</p>
                                    </div>
                                    <button
                                        onClick={() => handleUpdateField(selectedField.id, { required: !selectedField.required })}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            selectedField.required ? 'bg-[#9381FF]' : 'bg-white/20'
                                        }`}
                                    >
                                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                            selectedField.required ? 'translate-x-6' : ''
                                        }`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Live Preview */}
                <div className="lg:sticky lg:top-6 lg:self-start">
                    <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#DAFF7C]" />
                                Live Preview
                            </h3>
                            <p className="text-sm text-white/60 mt-1">How applicants will see your form</p>
                        </div>
                        <div className="p-6 space-y-6 max-h-[700px] overflow-y-auto">
                            {/* Form Header */}
                            <div className="pb-6 border-b border-white/10">
                                <h2 className="text-2xl font-bold text-white mb-2">{title || 'Tournament Title'}</h2>
                                <p className="text-white/60">{game || 'Game Name'} Tournament Application</p>
                            </div>

                            {/* Custom Fields */}
                            {formFields.length > 0 ? (
                                formFields.map(field => (
                                    <FieldPreview
                                        key={field.id}
                                        field={field}
                                        isSelected={selectedFieldId === field.id}
                                        onClick={() => setSelectedFieldId(field.id)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-white/40">
                                    <p className="text-sm">Your custom fields will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageTournamentForm;
