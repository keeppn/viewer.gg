import React from 'react';

interface TimeHeatmapProps {
  data: Array<{
    hour: number;
    day: string;
    viewers: number;
  }>;
}

const TimeHeatmap: React.FC<TimeHeatmapProps> = ({ data }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Find min and max for color scaling
  const allViewers = data.map(d => d.viewers);
  const maxViewers = Math.max(...allViewers, 1);
  const minViewers = Math.min(...allViewers, 0);

  // Get color intensity based on viewer count
  const getColorIntensity = (viewers: number) => {
    if (viewers === 0) return 'bg-white/5';

    const normalized = (viewers - minViewers) / (maxViewers - minViewers);

    if (normalized < 0.2) return 'bg-gradient-to-br from-[#9381FF]/20 to-[#9381FF]/10';
    if (normalized < 0.4) return 'bg-gradient-to-br from-[#9381FF]/40 to-[#9381FF]/20';
    if (normalized < 0.6) return 'bg-gradient-to-br from-[#9381FF]/60 to-[#DAFF7C]/20';
    if (normalized < 0.8) return 'bg-gradient-to-br from-[#9381FF]/80 to-[#DAFF7C]/40';
    return 'bg-gradient-to-br from-[#DAFF7C]/90 to-[#9381FF]/60';
  };

  // Get data for specific hour and day
  const getCellData = (hour: number, day: string) => {
    return data.find(d => d.hour === hour && d.day === day);
  };

  return (
    <div className="bg-gradient-to-br from-[#1F1F1F]/90 to-[#2A2A2A]/90 backdrop-blur-xl rounded-xl border border-white/10 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9381FF]" />
          Peak Streaming Times
        </h3>
        <p className="text-sm text-white/60 mt-1">Viewership intensity by time of day and day of week</p>
      </div>

      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#9381FF]/20 to-[#DAFF7C]/20 flex items-center justify-center">
              <span className="text-3xl">⏰</span>
            </div>
            <p className="text-white/60">No timing data available yet</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Day labels */}
              <div className="flex mb-2">
                <div className="w-12" /> {/* Empty space for hour labels */}
                {days.map(day => (
                  <div key={day} className="flex-1 min-w-[60px] text-center">
                    <span className="text-xs font-semibold text-white/70">{day}</span>
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="space-y-1">
                {hours.map(hour => (
                  <div key={hour} className="flex items-center gap-1">
                    {/* Hour label */}
                    <div className="w-12 text-right">
                      <span className="text-xs text-white/60">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>

                    {/* Cells for each day */}
                    {days.map(day => {
                      const cellData = getCellData(hour, day);
                      const viewers = cellData?.viewers || 0;

                      return (
                        <div
                          key={`${hour}-${day}`}
                          className="group relative flex-1 min-w-[60px]"
                        >
                          <div
                            className={`h-8 rounded-md border border-white/10 ${getColorIntensity(viewers)} transition-all duration-200 hover:scale-110 hover:border-[#DAFF7C]/50 cursor-pointer`}
                          />

                          {/* Tooltip */}
                          {viewers > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                              <div className="bg-gradient-to-br from-[#1F1F1F]/95 to-[#2A2A2A]/95 backdrop-blur-xl px-3 py-2 rounded-lg border border-white/20 shadow-xl whitespace-nowrap">
                                <p className="text-xs text-white/70">{day}, {hour.toString().padStart(2, '0')}:00</p>
                                <p className="text-sm font-bold text-[#DAFF7C]">{viewers.toLocaleString()} viewers</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Viewership Intensity:</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">Low</span>
                <div className="flex gap-1">
                  <div className="w-8 h-4 rounded bg-gradient-to-br from-[#9381FF]/20 to-[#9381FF]/10" />
                  <div className="w-8 h-4 rounded bg-gradient-to-br from-[#9381FF]/40 to-[#9381FF]/20" />
                  <div className="w-8 h-4 rounded bg-gradient-to-br from-[#9381FF]/60 to-[#DAFF7C]/20" />
                  <div className="w-8 h-4 rounded bg-gradient-to-br from-[#9381FF]/80 to-[#DAFF7C]/40" />
                  <div className="w-8 h-4 rounded bg-gradient-to-br from-[#DAFF7C]/90 to-[#9381FF]/60" />
                </div>
                <span className="text-xs text-white/60">High</span>
              </div>
            </div>

            {/* Peak time summary */}
            {maxViewers > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-[#DAFF7C]/10 to-transparent border border-[#DAFF7C]/20">
                  <div className="text-xs text-white/60 mb-1">Peak Time</div>
                  <div className="text-sm font-bold text-[#DAFF7C]">
                    {/* Calculate peak time from data */}
                    {(() => {
                      const peak = data.reduce((max, curr) => curr.viewers > max.viewers ? curr : max, data[0]);
                      return `${peak.day}, ${peak.hour.toString().padStart(2, '0')}:00`;
                    })()}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-[#9381FF]/10 to-transparent border border-[#9381FF]/20">
                  <div className="text-xs text-white/60 mb-1">Peak Viewers</div>
                  <div className="text-sm font-bold text-[#9381FF]">{maxViewers.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TimeHeatmap;
