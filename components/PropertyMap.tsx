'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function PropertyMap({ comuna, region, titulo }: { comuna: string; region: string; titulo: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const query = `${comuna}, ${region}, Chile`;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=cl`)
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      })
      .catch(() => {});
  }, [comuna, region]);

  useEffect(() => {
    if (!coords || mapLoaded || !L) return;

    if (!mapRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView([coords.lat, coords.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    L.marker([coords.lat, coords.lng])
      .addTo(map)
      .bindPopup(`<b>${titulo}</b><br>${comuna}, ${region}`)
      .openPopup();

    setMapLoaded(true);
  }, [coords, mapLoaded, comuna, region, titulo]);

  if (!coords) {
    return (
      <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 rounded-3xl p-8 shadow-xl transition-colors">
        <div className="animate-pulse flex items-center gap-3 text-slate-500 text-sm">
          <span>📍</span>
          <span>Cargando mapa de {comuna}...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 rounded-3xl overflow-hidden shadow-xl transition-colors">
      <div className="p-4 sm:p-6 border-b dark:border-slate-800 border-slate-200">
        <h2 className="text-lg font-bold dark:text-white text-slate-900 uppercase tracking-wider flex items-center gap-2">
          📍 Ubicación — {comuna}, {region}
        </h2>
      </div>
      <div ref={mapRef} style={{ height: '400px', width: '100%' }} />
      <div className="p-3 text-center text-[10px] dark:text-slate-500 text-slate-400 border-t dark:border-slate-800 border-slate-200">
        <a href="https://www.asesoriapublica.cl" target="_blank" rel="noopener noreferrer" className="dark:text-indigo-400 text-indigo-600 hover:underline font-bold">
          Asesoría Pública
        </a>
        {' '}— Expertos en saneamiento legal de propiedades en Chile.
      </div>
    </div>
  );
}
