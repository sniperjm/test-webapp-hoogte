
import React from 'react';

interface AltitudeCardProps {
  altitude: number;
  accuracy: number;
}

const AltitudeCard: React.FC<AltitudeCardProps> = ({ altitude, accuracy }) => {
  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
      {/* Subtiel hoogte-icoon op de achtergrond */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
        </svg>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <span className="text-emerald-400 uppercase tracking-[0.25em] text-[10px] font-black mb-4 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Actuele Hoogte
        </span>
        
        {/* Het getal zelf is hier iets kleiner gemaakt (text-6xl naar 7xl) voor een rustiger beeld */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <h1 className="text-6xl md:text-7xl font-black mono text-white tabular-nums leading-none drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)]">
            {Math.round(altitude)}
          </h1>
          <div className="flex flex-col items-start pt-1">
             <span className="text-2xl md:text-3xl font-black text-emerald-500 italic leading-none">m</span>
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">NAP</span>
          </div>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-2">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-2"></div>
          
          <div className="flex items-center justify-center gap-4 py-2.5 px-4 bg-slate-950/50 rounded-xl border border-slate-800 shadow-inner">
            <div className={`w-2 h-2 rounded-full ${accuracy < 20 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'} animate-pulse`} />
            <div className="flex flex-col items-start text-left">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
                Nauwkeurigheid
              </span>
              <span className="text-xs font-bold text-white leading-none">
                ± {Math.round(accuracy)} meter
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AltitudeCard;
