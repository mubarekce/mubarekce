
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';

interface Mosque {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance: string;
  walkingTime: string;
  address: string;
  image: string;
}

const MOSQUE_IMG = 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=400&fit=crop';

// Haversine formülü ile iki nokta arası mesafe (metre)
const distanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (m: number) => (m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`);

const MosqueMap: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [userPos, setUserPos] = useState<[number, number]>([41.0082, 28.9784]); // Konum alınana kadar varsayılan
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Gerçek yakın camileri getir (OpenStreetMap / Overpass)
  const loadNearbyMosques = async (lat: number, lon: number) => {
    try {
      const query = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat.toFixed(6)},${lon.toFixed(6)});way["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${lat.toFixed(6)},${lon.toFixed(6)}););out center;`;
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await res.json();
      const list: Mosque[] = (data.elements || []).map((el: any) => {
        const mLat = el.lat ?? el.center?.lat;
        const mLon = el.lon ?? el.center?.lon;
        const dist = distanceMeters(lat, lon, mLat, mLon);
        return {
          id: String(el.id),
          name: el.tags?.name || 'Mescit',
          lat: mLat,
          lon: mLon,
          distance: formatDistance(dist),
          walkingTime: `${Math.max(1, Math.round(dist / 80))} dk`,
          address: el.tags?.['addr:street'] || '',
          image: MOSQUE_IMG,
        };
      }).filter((m: Mosque) => m.lat && m.lon)
        .sort((a: Mosque, b: Mosque) => parseFloat(a.distance) - parseFloat(b.distance));
      setMosques(list);
    } catch (e) {
      console.error('Camiler alınamadı:', e);
    }
  };

  // 1. Harita CSS ve Başlatma
  useEffect(() => {
    // Leaflet CSS Injection
    if (!document.getElementById('leaflet-css-fix')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-fix';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // GPS Konumu Al
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(coords);
          loadNearbyMosques(coords[0], coords[1]);
        },
        () => {
          console.log("Konum izni reddedildi, varsayılan kullanılıyor.");
          loadNearbyMosques(userPos[0], userPos[1]);
        }
      );
    } else {
      loadNearbyMosques(userPos[0], userPos[1]);
    }
  }, []);

  // 2. Harita Render Mantığı - konum her değiştiğinde haritayı da taşı
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(userPos, 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);

      setTimeout(() => mapRef.current?.invalidateSize(), 400);
    } else {
      // Gerçek konum geldiğinde haritayı oraya kaydır
      mapRef.current.setView(userPos, 14);
    }

    const map = mapRef.current;

    // Önceki marker'ları temizle
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Kullanıcı Marker (Blue Pulse)
    const userIcon = L.divIcon({
      className: 'u-marker',
      html: `<div style="width:20px;height:20px;background:#3b82f6;border:4px solid white;border-radius:50%;box-shadow:0 0 15px rgba(59,130,246,0.6);animation:pulse 2s infinite"></div>`,
      iconSize: [20, 20], iconAnchor: [10, 10]
    });
    markersRef.current.push(L.marker(userPos, { icon: userIcon }).addTo(map));

    // Cami Marker'ları
    const mosqueIcon = L.divIcon({
      className: 'm-marker',
      html: `<div style="width:40px;height:40px;background:#059669;border:3px solid white;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 10px 20px rgba(0,0,0,0.15);">🕌</div>`,
      iconSize: [40, 40], iconAnchor: [20, 40]
    });

    mosques.forEach(m => {
      markersRef.current.push(
        L.marker([m.lat, m.lon], { icon: mosqueIcon })
          .addTo(map)
          .bindPopup(`<b style="font-family:sans-serif">${m.name}</b>`)
      );
    });
  }, [userPos, mosques]);

  useEffect(() => {
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  const handleNavigate = (m: Mosque) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}`, '_blank');
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#F1F5F9]">
      {/* Premium Header */}
      <div className="h-[75px] shrink-0 bg-white z-50 flex items-center justify-between px-6 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 active:scale-90 transition-all text-teal-700">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div className="space-y-0.5">
            <h2 className="text-[18px] font-black text-slate-900 leading-none uppercase">Cami Bulucu</h2>
            <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest">Çevrendeki İbadethaneler</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-xl border border-teal-100 text-teal-600">📍</div>
      </div>

      {/* Harita Alanı (%40) */}
      <div className="h-[40vh] w-full relative z-0 border-b border-slate-200">
        <div ref={containerRef} className="h-full w-full bg-slate-200"></div>
        {/* Floating Tooltip */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-white/20 z-10">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Haritayı Kaydırarak Keşfet</p>
        </div>
      </div>

      {/* Liste Alanı (%60) */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] z-10 pb-32 no-scrollbar shadow-[0_-20px_40px_rgba(0,0,0,0.05)] rounded-t-[3rem]">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)] animate-pulse"></div>
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Yakındaki {mosques.length} Mekan</h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {mosques.map((m) => (
              <div 
                key={m.id} 
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden flex flex-col group transition-all active:scale-[0.98]"
              >
                <div className="flex p-5 gap-5">
                  {/* Mosque Image / Placeholder */}
                  <div className="w-24 h-24 rounded-[1.8rem] bg-slate-50 flex-shrink-0 relative overflow-hidden border border-slate-50">
                    <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div className="space-y-1">
                      <h3 className="text-[16px] font-black text-teal-900 leading-tight truncate uppercase">{m.name}</h3>
                      <p className="text-[11px] font-medium text-slate-400 line-clamp-1">{m.address}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-1.5 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                          <span className="text-[10px]">🚶</span>
                          <span className="text-[10px] font-black text-teal-700 uppercase">{m.walkingTime}</span>
                       </div>
                       <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-black text-slate-500 uppercase">{m.distance}</span>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="px-5 pb-5 pt-0">
                   <button 
                     onClick={() => handleNavigate(m)}
                     className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-[1.6rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-teal-900/10 transition-all flex items-center justify-center gap-3 active:scale-95 border-b-4 border-teal-800"
                   >
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                     YOL TARİFİ AL
                   </button>
                </div>
              </div>
            ))}
          </div>

          {/* Spiritual Footer */}
          <div className="py-12 text-center opacity-10">
             <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.8em]">MÜBAREKÇE PRO+ ENGINE V5.0</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .u-marker { background: none !important; border: none !important; }
        .m-marker { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 1.2rem !important; font-family: inherit !important; }
      `}} />
    </div>
  );
};

export default MosqueMap;
