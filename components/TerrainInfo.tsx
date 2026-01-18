
import React from 'react';
import { TerrainAnalysis } from '../types';

interface TerrainInfoProps {
  analysis: TerrainAnalysis | null;
  loading: boolean;
}

const TerrainInfo: React.FC<TerrainInfoProps> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 h-full animate-pulse flex flex-col gap-3">
        <div className="h-3 bg-slate-800 rounded w-1/4"></div>
        <div className="h-6 bg-slate-800 rounded w-3/4"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-slate-800 rounded"></div>
          <div className="h-10 bg-slate-800 rounded"></div>
        </div>
        <div className="mt-auto h-16 bg-slate-800 rounded w-full"></div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-full flex flex-col transition-all">
      <div className="mb-4">
        <h3 className="text-slate-500 uppercase tracking-widest text-[10px] font-bold mb-1">Locatie Analyse</h3>
        <h2 className="text-xl font-bold text-slate-100 leading-tight">{analysis.locationName}</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800">
          <span className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Klimaat</span>
          <span className="text-xs font-medium text-slate-300">{analysis.climateZone}</span>
        </div>
        <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800">
          <span className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Terrein</span>
          <span className="text-xs font-medium text-slate-300 capitalize">{analysis.geographicalFeatures[0]}</span>
        </div>
      </div>

      <div className="mb-4">
        <span className="block text-[9px] text-slate-500 font-bold uppercase mb-1.5">Kenmerken</span>
        <div className="flex flex-wrap gap-1.5">
          {analysis.geographicalFeatures.map((f, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded border border-emerald-500/20">
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800">
        <span className="block text-[9px] text-slate-500 font-bold uppercase mb-1">Geografisch Weetje</span>
        <p className="text-xs text-slate-400 leading-relaxed italic">
          "{analysis.notableFacts}"
        </p>
      </div>
    </div>
  );
};

export default TerrainInfo;
