"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';

import { Tournament, ReportConfig, AnalyticsData } from '@/types';
import { analyticsApi } from '@/lib/api/analytics';
import { generatePDFReport, generateCSVReport, downloadReport } from '@/lib/utils/reportGenerator';
import Button from '@/components/common/Button';

interface OutletContextType {
  tournaments: Tournament[];
}

const Reports: React.FC = () => {
  const { tournaments } = useAppStore();
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [reportConfig, setReportConfig] = useState<Omit<ReportConfig, 'id' | 'tournament_id' | 'created_at'>>({
    name: 'Tournament Report',
    format: 'pdf',
    branding: {
      accent_color: '#387B66',
      header_text: '',
      footer_text: 'Powered by viewer.gg',
      sponsor_logos: []
    },
    sections: {
      executive_summary: true,
      application_funnel: true,
      viewership_trends: true,
      top_performers: true,
      demographic_breakdown: true,
      platform_analysis: true,
      geographic_distribution: false,
      custom_commentary: ''
    }
  });

  useEffect(() => {
    if (selectedTournament) {
      loadAnalytics();
    }
  }, [selectedTournament]);

  const loadAnalytics = async () => {
    if (!selectedTournament) return;
    
    setLoading(true);
    try {
      const data = await analyticsApi.getAnalytics(selectedTournament);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      alert('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTournament || !analyticsData) {
      alert('Please select a tournament first');
      return;
    }

    const tournament = tournaments.find(t => t.id === selectedTournament);
    if (!tournament) return;

    setGenerating(true);
    try {
      if (reportConfig.format === 'pdf') {
        const blob = await generatePDFReport(
          tournament,
          analyticsData,
          reportConfig as ReportConfig
        );
        downloadReport(blob, `${tournament.title.replace(/\s+/g, '_')}_Report.pdf`);
      } else {
        const csv = generateCSVReport(
          tournament,
          analyticsData,
          reportConfig as ReportConfig
        );
        const blob = new Blob([csv], { type: 'text/csv' });
        downloadReport(blob, `${tournament.title.replace(/\s+/g, '_')}_Report.csv`);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-white/60">Generate customizable reports for sponsors and stakeholders</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tournament Selection */}
          <div className="bg-[#1E1E1E] border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Select Tournament</h3>
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#387B66]"
            >
              <option value="">Choose a tournament...</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.title} - {t.game}</option>
              ))}
            </select>
          </div>

          {/* Report Sections */}
          <div className="bg-[#1E1E1E] border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Report Sections</h3>
            <div className="space-y-3">
              {Object.entries(reportConfig.sections || {}).map(([key, value]) => {
                if (key === 'custom_commentary') return null;
                return (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          [key]: e.target.checked
                        }
                      }))}
                      className="w-5 h-5 rounded border-white/20 bg-black/20 text-[#387B66] focus:ring-[#387B66]"
                    />
                    <span className="text-gray-300 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Branding */}
          <div className="bg-[#1E1E1E] border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Branding</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={reportConfig.branding?.accent_color}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      branding: {
                        ...prev.branding,
                        accent_color: e.target.value
                      }
                    }))}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={reportConfig.branding?.accent_color}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      branding: {
                        ...prev.branding,
                        accent_color: e.target.value
                      }
                    }))}
                    className="flex-1 px-4 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#387B66]"
                    placeholder="#387B66"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Header Text
                </label>
                <input
                  type="text"
                  value={reportConfig.branding?.header_text}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    branding: {
                      ...prev.branding,
                      header_text: e.target.value
                    }
                  }))}
                  className="w-full px-4 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#387B66]"
                  placeholder="Optional header text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Footer Text
                </label>
                <input
                  type="text"
                  value={reportConfig.branding?.footer_text}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    branding: {
                      ...prev.branding,
                      footer_text: e.target.value
                    }
                  }))}
                  className="w-full px-4 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#387B66]"
                  placeholder="Powered by viewer.gg"
                />
              </div>
            </div>
          </div>

          {/* Custom Commentary */}
          <div className="bg-[#1E1E1E] border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Custom Commentary</h3>
            <textarea
              value={reportConfig.sections?.custom_commentary}
              onChange={(e) => setReportConfig(prev => ({
                ...prev,
                sections: {
                  ...prev.sections,
                  custom_commentary: e.target.value
                }
              }))}
              rows={6}
              className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#387B66]"
              placeholder="Add custom notes or commentary for this report..."
            />
          </div>
        </div>

        {/* Preview & Generate Panel */}
        <div className="space-y-6">
          {/* Format Selection */}
          <div className="bg-[#1E1E1E] border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Export Format</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  checked={reportConfig.format === 'pdf'}
                  onChange={() => setReportConfig(prev => ({ ...prev, format: 'pdf' }))}
                  className="w-5 h-5 text-[#387B66] focus:ring-[#387B66]"
                />
                <span className="text-gray-300">PDF Document</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  checked={reportConfig.format === 'csv'}
                  onChange={() => setReportConfig(prev => ({ ...prev, format: 'csv' }))}
                  className="w-5 h-5 text-[#387B66] focus:ring-[#387B66]"
                />
                <span className="text-gray-300">CSV Spreadsheet</span>
              </label>
            </div>
          </div>

          {/* Statistics Preview */}
          {analyticsData && (
            <div className="bg-[#1E1E1E] border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Applications:</span>
                  <span className="text-white font-bold">{analyticsData.total_applications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Peak Viewers:</span>
                  <span className="text-white font-bold">{analyticsData.peak_concurrent_viewers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Live Streamers:</span>
                  <span className="text-white font-bold">{analyticsData.live_streamers_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hours Streamed:</span>
                  <span className="text-white font-bold">{Math.round(analyticsData.total_hours_streamed)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!selectedTournament || loading || generating}
            className="w-full py-4 text-lg"
          >
            {generating ? 'Generating...' : loading ? 'Loading...' : 'Generate Report'}
          </Button>

          <p className="text-gray-500 text-sm text-center">
            Your report will be downloaded automatically
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
