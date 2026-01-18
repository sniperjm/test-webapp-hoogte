import React, { useState, useEffect, useRef } from 'react';
import AltitudeCard from './components/AltitudeCard';
import TerrainInfo from './components/TerrainInfo';
import { Coordinates, TerrainAnalysis, AppStatus } from './types';
import { getGeographicAnalysis } from './services/geminiService';
import { getElevation } from './services/elevationService';

// Fix: Declare Leaflet global variable as any to bypass missing type definitions in the build environment
declare const L: any;

const App: React.FC = () => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<TerrainAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  // Fix: Use any for refs to avoid "Cannot find namespace 'L'" errors
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize GPS Tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocatie wordt niet ondersteund door uw browser.");
      setStatus(AppStatus.ERROR);
      return;
    }

    setStatus(AppStatus.LOADING);

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, altitude, accuracy } = position.coords;
        
        // Sometimes browser altitude is null, we fetch from a topographic service if needed
        let finalAltitude = altitude;
        if (finalAltitude === null) {
          finalAltitude = await getElevation(latitude, longitude);
        }

        const newCoords = { latitude, longitude, altitude: finalAltitude, accuracy };
        setCoords(newCoords);
        setStatus(AppStatus.SUCCESS);
        updateMap(latitude, longitude);
      },
      (err) => {
        console.error(err);
        setError("Toegang tot locatie geweigerd of time-out.");
        setStatus(AppStatus.ERROR);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Update Map logic
  const updateMap = (lat: number, lng: number) => {
    // Fix: Using the declared global L safely
    if (typeof L === 'undefined') return;

    if (!mapRef.current) {
      mapRef.current = L.map('map-container', {
        zoomControl: false,
        attributionControl: false
      }).setView([lat, lng], 13);
      
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17
      }).addTo(mapRef.current);

      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    } else {
      mapRef.current.setView([lat, lng]);
      markerRef.current?.setLatLng([lat, lng]);
    }
  };

  // Trigger Gemini Analysis when coords change significantly or on first load
  useEffect(() => {
    if (coords && coords.altitude !== null) {
      const fetchAnalysis = async () => {
        setAnalysisLoading(true);
        try {
          const data = await getGeographicAnalysis(coords.latitude, coords.longitude, coords.altitude || 0);
          setAnalysis(data);
        } catch (e) {
          console.error("AI Analysis failed", e);
        } finally {
          setAnalysisLoading(false);
        }
      };
      
      // Fetch analysis once we have a stable lock
      if (!analysis) {
        fetchAnalysis();
      }
    }
  }, [coords, analysis]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            Hoogtemeter <span className="text-emerald-500">NAP</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">Topografische Verkenner</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === AppStatus.SUCCESS ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="text-xs font-mono text-slate-300">
                {status === AppStatus.SUCCESS ? 'GPS LOCK' : 'WAITING FOR GPS'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setAnalysis(null)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            title="Refresh Analysis"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stats & Analysis */}
        <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
          {coords ? (
            <AltitudeCard altitude={coords.altitude || 0} accuracy={coords.accuracy} />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex items-center justify-center min-h-[250px]">
              <div className="text-center">
                <div className="animate-spin mb-4 inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                </div>
                <p className="text-slate-400 font-medium">Zoeken naar satellieten...</p>
              </div>
            </div>
          )}

          <TerrainInfo analysis={analysis} loading={analysisLoading} />
        </div>

        {/* Right Column: Map */}
        <div className="lg:col-span-7 h-[400px] lg:h-auto min-h-[500px] order-1 lg:order-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl h-full relative overflow-hidden">
             {error && (
               <div className="absolute inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-8 text-center backdrop-blur-sm">
                 <div className="max-w-md">
                   <div className="text-rose-500 mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                   </div>
                   <h2 className="text-xl font-bold mb-2">Toegangsfout</h2>
                   <p className="text-slate-400 mb-6">{error}</p>
                   <button 
                     onClick={() => window.location.reload()}
                     className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
                   >
                     Probeer Opnieuw
                   </button>
                 </div>
               </div>
             )}
             <div id="map-container" className="h-full w-full rounded-xl"></div>
             
             {/* Map Coordinates Overlay */}
             {coords && (
               <div className="absolute bottom-6 right-6 z-20 bg-slate-900/90 border border-slate-700 backdrop-blur px-4 py-2 rounded-lg shadow-lg">
                 <div className="flex gap-4">
                   <div>
                     <span className="block text-[8px] text-slate-500 font-bold uppercase">Breedtegraad</span>
                     <span className="text-xs font-mono text-slate-200">{coords.latitude.toFixed(6)}°</span>
                   </div>
                   <div>
                     <span className="block text-[8px] text-slate-500 font-bold uppercase">Lengtegraad</span>
                     <span className="text-xs font-mono text-slate-200">{coords.longitude.toFixed(6)}°</span>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="mt-auto pt-12 border-t border-slate-900 text-center">
        <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">
          Made by Janfred
        </p>
      </footer>
    </div>
  );
};

export default App;