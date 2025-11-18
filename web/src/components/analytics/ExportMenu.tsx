import React, { useState } from 'react';

interface ExportMenuProps {
  tournamentName: string;
  onExport: (format: 'pdf' | 'csv' | 'json') => void;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ tournamentName, onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'csv' | 'json') => {
    setIsExporting(true);
    try {
      await onExport(format);
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      format: 'pdf' as const,
      icon: '📄',
      title: 'Export as PDF',
      description: 'Sponsor-ready report with charts',
      color: 'text-[#ef4444]'
    },
    {
      format: 'csv' as const,
      icon: '📊',
      title: 'Export as CSV',
      description: 'Raw data for spreadsheets',
      color: 'text-[#10b981]'
    },
    {
      format: 'json' as const,
      icon: '💾',
      title: 'Export as JSON',
      description: 'Machine-readable format',
      color: 'text-[#3b82f6]'
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#9381FF]/20 to-[#DAFF7C]/10 hover:from-[#9381FF]/30 hover:to-[#DAFF7C]/20 border border-[#9381FF]/30 hover:border-[#DAFF7C]/50 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-[#DAFF7C]/20"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="font-semibold">Export Report</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-gradient-to-br from-[#1F1F1F]/95 to-[#2A2A2A]/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl z-20 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h4 className="text-sm font-semibold text-white">Export Analytics Report</h4>
              <p className="text-xs text-white/60 mt-1">{tournamentName}</p>
            </div>

            <div className="p-2">
              {exportOptions.map((option) => (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  disabled={isExporting}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="text-2xl flex-shrink-0">{option.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${option.color} group-hover:text-[#DAFF7C] transition-colors`}>
                      {option.title}
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">
                      {option.description}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gradient-to-br from-white/5 to-transparent border-t border-white/10">
              <div className="flex items-start gap-2 text-xs text-white/60">
                <span className="text-[#9381FF]">💡</span>
                <span>PDF reports include all charts and are perfect for sponsor presentations</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Loading overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#1F1F1F]/95 to-[#2A2A2A]/95 backdrop-blur-xl rounded-xl border border-white/20 p-8 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-[#DAFF7C] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Generating Report</p>
            <p className="text-sm text-white/60">This may take a few moments...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
