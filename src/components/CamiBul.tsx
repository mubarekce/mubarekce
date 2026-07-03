
import React, { useState, useEffect, useRef } from 'react';

interface Mosque {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    "name:en"?: string;
  };
}

const CamiBul: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!navigator.geolocation) {
      setError("Konum desteği yok.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => {
        setError(`Konum Hatası: ${err.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const fetchMosques = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const fixedLat = lat.toFixed(6);
      const fixedLon = lon.toFixed(6);
      const query = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:2000,${fixedLat},${fixedLon});way["amenity"="place_of_worship"]["religion"="muslim"](around:2000,${fixedLat},${fixedLon}););out center;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      
      const response = await fetch(url);
      const contentType = response.headers.get("content-type");

      if (!response.ok) throw new Error("Sunucu hatası.");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Sunucu yoğun. Lütfen tekrar deneyin.");
      }

      const data = await response.json();
      if (data.elements) setMosques(data.elements);
      else setError("Cami bulunamadı.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userPos) fetchMosques(userPos[0], userPos[1]);
  }, [userPos]);

  useEffect(() => {
    if (!userPos || !containerRef.current || isInitialized.current) return;

    const initMap = async () => {
      try {
        const L = await import('https://esm.sh/leaflet@1.9.4');
        if (mapRef.current) mapRef.current.remove();

        const map = L.map(containerRef.current, { zoomControl: false }).setView(userPos, 15);
        mapRef.current = map;
        isInitialized.current = true;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        setTimeout(() => map.invalidateSize(), 300);

        const userIcon = L.divIcon({
          className: 'u-m',
          html: `<div style="width:16px;height:16px;background:#3b82f6;border:2px solid white;border-radius:50%;"></div>`,
          iconSize: [16, 16], iconAnchor: [8, 8]
        });
        L.marker(userPos, { icon: userIcon }).addTo(map);

        const mosqueIcon = L.divIcon({
          className: 'm-m',
          html: `<div style="width:32px;height:32px;background:#059669;border:2px solid white;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;">🕌</div>`,
          iconSize: [32, 32], iconAnchor: [16, 32]
        });

        mosques.forEach(m => {
          const mLat = m.lat || (m as any).center?.lat;
          const mLon = m.lon || (m as any).center?.lon;
          if (mLat && mLon) L.marker([mLat, mLon], { icon: mosqueIcon }).addTo(map);
        });
      } catch (e) {}
    };
    initMap();
    return () => { if (mapRef.current) mapRef.current.remove(); isInitialized.current = false; };
  }, [userPos, mosques]);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-white overflow-hidden">
      <div className="h-[70px] px-5 flex items-center gap-4 bg-white border-b border-slate-100 z-50 shrink-0">
        <button onClick={onBack} className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">←</button>
        <h2 className="text-[16px] font-black text-slate-900 uppercase">Yakın Camiler</h2>
      </div>
      <div className="h-[40vh] w-full relative z-0 bg-slate-100">
        <div ref={containerRef} className="h-full w-full"></div>
      </div>
      <div className="flex-1 bg-white overflow-y-auto z-10 pb-32">
        <div className="p-5 space-y-3">
          {error && <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl text-center uppercase">{error}</div>}
          {mosques.map(m => (
            <div key={m.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div className="min-w-0 mr-4">
                <h5 className="text-[13px] font-bold text-slate-900 truncate">{m.tags.name || "Mescit"}</h5>
              </div>
              <button 
                onClick={() => {
                  const mLat = m.lat || (m as any).center?.lat;
                  const mLon = m.lon || (m as any).center?.lon;
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${mLat},${mLon}`, '_blank');
                }}
                className="w-9 h-9 bg-teal-600 text-white rounded-xl flex items-center justify-center shadow-lg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          ))}
          {mosques.length === 0 && !loading && !error && <p className="text-center text-xs text-slate-300 py-10">Cami Bulunamadı</p>}
        </div>
      </div>
    </div>
  );
};

export default CamiBul;
