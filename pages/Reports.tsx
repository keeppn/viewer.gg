

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Button from '../components/common/Button';
import { AnalyticsData, Application } from '../types';

interface OutletContextType {
  analyticsData: AnalyticsData;
  applications: Application[];
}

const Reports: React.FC = () => {
  const { analyticsData, applications } = useOutletContext<OutletContextType>();
  const [reportOptions, setReportOptions] = useState({
    includeAnalytics: true,
    includeApplications: true,
    includeStreamerList: true,
  });
  const [reportFormat, setReportFormat] = useState<'csv' | 'pdf'>('pdf');
  const [brandLogo, setBrandLogo] = useState<File | null>(null);
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReportOptions({ ...reportOptions, [e.target.name]: e.target.checked });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-sm border border-white/10">
        <h2 className="text-2xl font-bold mb-6 text-white">Generate Report</h2>
        
        <div className="space-y-6">
          {/* Report Content */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Include in Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3 bg-black/20 p-3 rounded-lg"><input type="checkbox" name="includeAnalytics" checked={reportOptions.includeAnalytics} onChange={handleCheckboxChange} className="form-checkbox h-5 w-5 text-[#387B66] bg-[#121212] border-white/20 rounded focus:ring-[#387B66]" /> <span>Viewer Analytics</span></label>
              <label className="flex items-center space-x-3 bg-black/20 p-3 rounded-lg"><input type="checkbox" name="includeApplications" checked={reportOptions.includeApplications} onChange={handleCheckboxChange} className="form-checkbox h-5 w-5 text-[#387B66] bg-[#121212] border-white/20 rounded focus:ring-[#387B66]" /> <span>Application Stats</span></label>
              <label className="flex items-center space-x-3 bg-black/20 p-3 rounded-lg"><input type="checkbox" name="includeStreamerList" checked={reportOptions.includeStreamerList} onChange={handleCheckboxChange} className="form-checkbox h-5 w-5 text-[#387B66] bg-[#121212] border-white/20 rounded focus:ring-[#387B66]" /> <span>Approved Streamers</span></label>
            </div>
          </div>
          
          {/* Branding */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Branding</h3>
            <label className="block w-full cursor-pointer bg-black/20 border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-[#387B66] transition-colors">
              <span className="text-gray-400">{brandLogo ? `File: ${brandLogo.name}` : 'Upload Sponsor Logo'}</span>
              <input type="file" onChange={(e) => e.target.files && setBrandLogo(e.target.files[0])} className="hidden" accept="image/*" />
            </label>
          </div>
          
          {/* Format & Download */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Export</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input type="radio" id="pdf" name="format" value="pdf" checked={reportFormat === 'pdf'} onChange={() => setReportFormat('pdf')} className="form-radio h-4 w-4 text-[#387B66] bg-[#121212] border-white/20 focus:ring-[#387B66]" />
                <label htmlFor="pdf">PDF</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="csv" name="format" value="csv" checked={reportFormat === 'csv'} onChange={() => setReportFormat('csv')} className="form-radio h-4 w-4 text-[#387B66] bg-[#121212] border-white/20 focus:ring-[#387B66]" />
                <label htmlFor="csv">CSV</label>
              </div>
              <Button variant="primary" className="ml-auto">Download Report</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;