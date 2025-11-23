import React from 'react';

interface ApplicationFunnelProps {
  totalApplications: number;
  approved: number;
  liveStreamers: number;
}

const ApplicationFunnel: React.FC<ApplicationFunnelProps> = ({
  totalApplications,
  approved,
  liveStreamers
}) => {
  const approvalRate = totalApplications > 0 ? (approved / totalApplications) * 100 : 0;
  const liveRate = approved > 0 ? (liveStreamers / approved) * 100 : 0;

  const stages = [
    {
      label: 'Applications',
      value: totalApplications,
      color: 'from-[#3b82f6]/20 to-[#3b82f6]/5',
      borderColor: 'border-[#3b82f6]/30',
      textColor: 'text-[#3b82f6]',
      width: 100
    },
    {
      label: 'Approved',
      value: approved,
      color: 'from-[#9381FF]/20 to-[#9381FF]/5',
      borderColor: 'border-[#9381FF]/30',
      textColor: 'text-[#9381FF]',
      width: totalApplications > 0 ? (approved / totalApplications) * 100 : 0,
      dropOff: totalApplications - approved,
      dropOffRate: totalApplications > 0 ? ((totalApplications - approved) / totalApplications) * 100 : 0
    },
    {
      label: 'Live Streaming',
      value: liveStreamers,
      color: 'from-[#DAFF7C]/20 to-[#DAFF7C]/5',
      borderColor: 'border-[#DAFF7C]/30',
      textColor: 'text-[#DAFF7C]',
      width: totalApplications > 0 ? (liveStreamers / totalApplications) * 100 : 0,
      dropOff: approved - liveStreamers,
      dropOffRate: approved > 0 ? ((approved - liveStreamers) / approved) * 100 : 0
    }
  ];

  return (
    <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#fd934e]" />
          Application Funnel
        </h3>
        <p className="text-sm text-white/60 mt-1">Conversion rates from application to live streaming</p>
      </div>

      {totalApplications === 0 ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 flex items-center justify-center">
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-white/60 mb-2">No applications yet</p>
            <p className="text-sm text-white/40">Funnel will appear when applications are submitted</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Funnel visualization */}
          {stages.map((stage, index) => (
            <div key={stage.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{stage.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${stage.textColor}`}>
                    {stage.value.toLocaleString()}
                  </span>
                  {index === 0 && (
                    <span className="text-xs text-white/60 px-2 py-1 rounded-md bg-white/5">
                      100%
                    </span>
                  )}
                  {index > 0 && stage.width > 0 && (
                    <span className="text-xs text-white/60 px-2 py-1 rounded-md bg-white/5">
                      {stage.width.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Bar */}
              <div className="relative h-12 rounded-lg bg-white/5 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stage.color} border-r-2 ${stage.borderColor} transition-all duration-1000 ease-out flex items-center justify-center`}
                  style={{ width: `${stage.width}%` }}
                >
                  {stage.width > 15 && (
                    <span className="text-sm font-semibold text-white">
                      {stage.value.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Drop-off indicator */}
              {index > 0 && stage.dropOff !== undefined && stage.dropOff > 0 && (
                <div className="flex items-center gap-2 mt-2 ml-4">
                  <svg className="w-4 h-4 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-xs text-[#ef4444] font-medium">
                    -{stage.dropOff} ({stage.dropOffRate?.toFixed(1)}% drop-off)
                  </span>
                </div>
              )}

              {/* Connector arrow */}
              {index < stages.length - 1 && (
                <div className="flex justify-center my-2">
                  <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              )}
            </div>
          ))}

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="p-4 rounded-lg bg-gradient-to-br from-[#9381FF]/10 to-transparent border border-[#9381FF]/20">
              <div className="text-sm text-white/60 mb-1">Approval Rate</div>
              <div className="text-2xl font-bold text-[#9381FF]">{approvalRate.toFixed(1)}%</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-[#DAFF7C]/10 to-transparent border border-[#DAFF7C]/20">
              <div className="text-sm text-white/60 mb-1">Go-Live Rate</div>
              <div className="text-2xl font-bold text-[#DAFF7C]">{liveRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationFunnel;
