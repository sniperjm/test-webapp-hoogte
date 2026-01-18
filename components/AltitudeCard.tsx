import React from 'react';

interface AltitudeCardProps {
  altitude: number;
  accuracy: number;
}

const AltitudeCard: React.FC<AltitudeCardProps> = ({ altitude, accuracy }) => {
  const isBelowSeaLevel = altitude < 0;

  return (
    <div className={`bg-slate-900 border-2 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-colors duration-500 ${isBelowSeaLevel ? 'border-blue-500/30 bg-blue-950/20' : 'border-slate-800'}`}>
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
        </svg>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <div className="mb-4">
          <span className={`uppercase tracking-[0.25em] text-[10px] font-black px-3 py-1 rounded-full border ${isBelowSeaLevel ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            {isBelowSeaLevel ? 'ONDER ZEESPIEGEL' : 'BOVEN ZEESPIEGEL'}
          </span>
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-6">
          <h1 className={`text-6xl md:text-8xl font-black mono tabular-nums leading-none drop-shadow-lg ${isBelowSeaLevel ? 'text-blue-400' : 'text-white'}`}>
            {altitude.toFixed(1)}
          </h1>
          <div className="flex flex-col items-start pt-1">
             <span className={`text-2xl md:text-3xl font-black italic leading-none ${isBelowSeaLevel ? 'text-blue-500' : 'text-emerald-500'}`}>m</span>
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">NAP</span>
          </div>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-2">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-2"></div>
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">
            Topografische precisie
          </div>
        </div>
      </div>
    </div>
  );
};

export default AltitudeCard;