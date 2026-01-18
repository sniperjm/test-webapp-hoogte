import React, { useState, useEffect, useRef } from 'react';
import AltitudeCard from './components/AltitudeCard';
import TerrainInfo from './components/TerrainInfo';
import { Coordinates, TerrainAnalysis, AppStatus } from './types';
import { getGeographicAnalysis } from './services/geminiService';
import { getElevation } from './services/elevationService';

declare const L: any;

const App: React.FC = () => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<TerrainAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<{lat: number, lng: number} | null>(null);

  // Initialize Map
  useEffect(() => {
    if (typeof L !== 'undefined' && !mapRef.current) {
      mapRef.current = L.map('map-container', {
        zoomControl: false,
        attributionControl: false
      }).setView([52.3676, 4.9041], 11);
      
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17
      }).addTo(mapRef.current);

      markerRef.current = L.marker([52.3676, 4.9041]).addTo(mapRef.current);
    }
  }, []);

  const updateLocationData = async (lat: number, lng: number, accuracy: number = 0) => {
    // Voorkom onnodige updates als de locatie nauwelijks veranderd is
    if (lastUpdateRef.current && 
        Math.abs(lastUpdateRef.current.lat - lat) < 0.0001 && 
        Math.abs(lastUpdateRef.current.lng - lng) < 0.0001) {
      return;
    }
    
    try {
      // BELANGRIJK: We gebruiken ALTIJD de topografische API voor de hoogte.
      // GPS-hoogte van telefoons is vaak 40m+ ernaast t.o.v. NAP.
      const elevation = await getElevation(lat, lng);
      const newCoords = { latitude: lat, longitude: lng, altitude: elevation, accuracy };
      setCoords(newCoords);
      lastUpdateRef.current = { lat, lng };
      
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], mapRef.current.getZoom());
        markerRef.current?.setLatLng([lat, lng]);
      }
      
      setAnalysis(null);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocatie wordt niet ondersteund.");
      return;
    }

    setStatus(AppStatus.LOADING);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        await updateLocationData(latitude, longitude, accuracy);
        setStatus(AppStatus.SUCCESS);
      },
      (err) => {
        setError("GPS signaal verloren of geweigerd.");
        setStatus(AppStatus.ERROR);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        await updateLocationData(parseFloat(lat), parseFloat(lon), 5);
        setStatus(AppStatus.IDLE);
      } else {
        setError("Locatie niet gevonden.");
      }
    } catch (err) {
      setError("Zoekopdracht mislukt.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    startGpsTracking();
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (coords && !analysis && !analysisLoading) {
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
      fetchAnalysis();
    }
  }, [coords, analysis]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            Hoogtemeter <span className="text-emerald-500">NAP</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium italic">Data via Topographic Maps Engine</p>
        </div>

        <form onSubmit={handleSearch} className="relative flex-1 max-w-md w-full">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek stad (bijv. Almere)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-lg"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-emerald-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </div>
          )}
        </form>

        <div className="flex items-center gap-3">
          <button 
            onClick={startGpsTracking}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${watchIdRef.current ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">{watchIdRef.current ? 'GPS Live' : 'Start GPS'}</span>
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
          {coords ? (
            <AltitudeCard altitude={coords.altitude || 0} accuracy={coords.accuracy} />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex items-center justify-center min-h-[250px]">
              <div className="text-center">
                <div className="animate-spin mb-4 inline-block text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                </div>
                <p className="text-slate-400 font-medium">Zoeken naar topografische data...</p>
              </div>
            </div>
          )}
          <TerrainInfo analysis={analysis} loading={analysisLoading} />
        </div>

        <div className="lg:col-span-7 h-[450px] lg:h-auto min-h-[500px] order-1 lg:order-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-2xl h-full relative overflow-hidden">
             <div id="map-container" className="h-full w-full rounded-xl"></div>
             {coords && (
               <div className="absolute bottom-6 right-6 z-20 bg-slate-900/90 border border-slate-700/50 backdrop-blur px-5 py-3 rounded-xl shadow-2xl">
                 <div className="flex gap-6">
                   <div>
                     <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Breedte</span>
                     <span className="text-xs font-mono text-white tabular-nums">{coords.latitude.toFixed(5)}°</span>
                   </div>
                   <div className="w-px h-8 bg-slate-800"></div>
                   <div>
                     <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Lengte</span>
                     <span className="text-xs font-mono text-white tabular-nums">{coords.longitude.toFixed(5)}°</span>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </main>

      <footer className="mt-auto pt-8 border-t border-slate-900/50 text-center">
        <p className="text-slate-700 text-[9px] uppercase tracking-[0.4em] font-black">
          Made by Janfred
        </p>
      </footer>
    </div>
  );
};

export default App;