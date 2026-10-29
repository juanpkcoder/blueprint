import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, Clock, AlertCircle, Zap, RefreshCw, 
  Compass, LocateFixed, Navigation, Layers, ExternalLink, MapPin, ShieldCheck
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { INITIAL_TECHNICIANS } from '../data/mockData';
import { techProfileService } from '../services/technicianProfileService';
import { playSoundEffect } from '../utils/soundEffects';
import { escapeHtml } from '../utils/securityUtils';

// Coordenadas base: Sede Central Bogotá, D.C. (Chapinero Financiero - Cra. 7 # 71-21)
const BOGOTA_CENTER = [4.6565, -74.0560];
const HQ_COORDS = [4.6565, -74.0560];

// Capas cartográficas de alta definición conectadas con Google Maps y CartoDB HD
const MAP_TILE_LAYERS = {
  google_streets: {
    id: 'google_streets',
    name: 'Google Maps HD',
    badge: 'Google Maps • Calles y Tráfico Detallado',
    url: 'https://mt1.google.com/vt/lyrs=m&hl=es&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps • Telemetría QuintoNodo Bogotá'
  },
  google_hybrid: {
    id: 'google_hybrid',
    name: 'Satélite Híbrido',
    badge: 'Google Earth • Satélite + Vías HD',
    url: 'https://mt1.google.com/vt/lyrs=y&hl=es&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satellite • Telemetría QuintoNodo'
  },
  blueprint_dark: {
    id: 'blueprint_dark',
    name: 'Modo Nocturno',
    badge: 'CartoDB Dark Matter • Radar Táctico',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
  }
};

// Zonas estratégicas de los 5 nodos en Bogotá
const NODE_ZONES = {
  'tech-1': { zone: 'Chapinero / Cra. 7 Financiero', radiusMeters: 3200, color: '#00f0ff' },
  'tech-2': { zone: 'Suba / Pontevedra / Niza', radiusMeters: 3800, color: '#38bdf8' },
  'tech-3': { zone: 'Centro Internacional / Teusaquillo', radiusMeters: 3000, color: '#818cf8' },
  'tech-4': { zone: 'Parque de la 93 / El Chicó / Calle 100', radiusMeters: 3400, color: '#34d399' },
  'tech-5': { zone: 'Ciudad Salitre / Corferias / Calle 26', radiusMeters: 3600, color: '#f59e0b' }
};

// Iconos Leaflet personalizados con sanitización HTML contra DOM XSS
const createCustomIcon = (color, label, isUser = false, isSelected = false) => {
  const safeColor = escapeHtml(color);
  const safeLabel = escapeHtml(label);
  const size = isUser ? '34px' : isSelected ? '34px' : '28px';

  const iconHtml = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="
        width: ${size};
        height: ${size};
        border-radius: 50%;
        background: ${safeColor};
        border: 3px solid #060b18;
        box-shadow: 0 0 ${isSelected ? '22px' : '14px'} ${safeColor};
        display: flex;
        align-items: center;
        justify-content: center;
        color: #060b18;
        font-weight: 900;
        font-size: 12px;
        transition: all 0.25s ease;
      ">
        ${isUser ? '📍' : '⚡'}
      </div>
      <div style="
        background: rgba(6, 11, 24, 0.94);
        color: #fff;
        border: 1px solid ${safeColor};
        padding: 2px 7px;
        border-radius: 6px;
        font-size: 9.5px;
        font-weight: 800;
        white-space: nowrap;
        margin-top: 3px;
        box-shadow: 0 3px 8px rgba(0,0,0,0.75);
      ">
        ${safeLabel}
      </div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-blueprint-pin',
    iconSize: [44, 52],
    iconAnchor: [22, 26]
  });
};

// Componente para recentrar el mapa suavemente cuando el usuario selecciona un nodo o actualiza su GPS
function MapCameraController({ targetCoords, targetZoom }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords && Array.isArray(targetCoords) && targetCoords.length === 2) {
      map.flyTo(targetCoords, targetZoom || 14, { duration: 1.35 });
    }
  }, [targetCoords, targetZoom, map]);
  return null;
}

// Cálculo de distancia en km (fórmula de Haversine)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export const LiveTrackingMap = ({ activeOrder, onOpenChat, onOpenBookingModal }) => {
  const [technicians, setTechnicians] = useState(() => techProfileService.getProfiles() || INITIAL_TECHNICIANS);
  const [mapStyle, setMapStyle] = useState('google_streets'); // 'google_streets' | 'google_hybrid' | 'blueprint_dark'
  const [showCoverageZones, setShowCoverageZones] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [cameraTarget, setCameraTarget] = useState({ coords: BOGOTA_CENTER, zoom: 12 });

  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'updating'
  const [nextUpdateSeconds, setNextUpdateSeconds] = useState(300);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(null);
  const [nearestNode, setNearestNode] = useState(null);

  useEffect(() => {
    const unsub = techProfileService.subscribe((updated) => {
      if (Array.isArray(updated) && updated.length > 0) {
        setTechnicians(updated);
      }
    });
    return unsub;
  }, []);

  const findNearestNode = useCallback((lat, lng) => {
    let bestDist = Infinity;
    let bestTech = null;

    technicians.forEach(tech => {
      const dist = getDistanceKm(lat, lng, tech.lat, tech.lng);
      if (dist < bestDist) {
        bestDist = dist;
        bestTech = { ...tech, distanceKm: dist, etaMinutes: Math.max(12, Math.round(dist * 3.5 + 8)) };
      }
    });

    setNearestNode(bestTech);
  }, [technicians]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      findNearestNode(HQ_COORDS[0], HQ_COORDS[1]);
      return;
    }

    setLocationStatus('updating');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 20),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setUserLocation(coords);
        setLocationStatus('granted');
        setLastUpdatedTime(coords.timestamp);
        setNextUpdateSeconds(300);
        setCameraTarget({ coords: [coords.lat, coords.lng], zoom: 13 });
        playSoundEffect('notification');
        findNearestNode(coords.lat, coords.lng);
      },
      (error) => {
        console.warn('Permiso de geolocalización denegado o no disponible:', error);
        setLocationStatus('denied');
        findNearestNode(HQ_COORDS[0], HQ_COORDS[1]);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  }, [findNearestNode]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNextUpdateSeconds(prev => {
        if (prev <= 1) {
          requestLocation();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [requestLocation]);

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleFocusNode = (tech) => {
    setSelectedNodeId(tech.id);
    setCameraTarget({ coords: [tech.lat, tech.lng], zoom: 15 });
    playSoundEffect('notification');
  };

  const handleResetView = () => {
    setSelectedNodeId(null);
    if (userLocation) {
      setCameraTarget({ coords: [userLocation.lat, userLocation.lng], zoom: 13 });
    } else {
      setCameraTarget({ coords: BOGOTA_CENTER, zoom: 12 });
    }
  };

  const activeLayer = MAP_TILE_LAYERS[mapStyle] || MAP_TILE_LAYERS.google_streets;
  const selectedTechObj = technicians.find(t => t.id === selectedNodeId) || nearestNode || technicians[0];
  const originPoint = userLocation ? [userLocation.lat, userLocation.lng] : HQ_COORDS;
  const routePolyline = selectedTechObj ? [originPoint, [selectedTechObj.lat, selectedTechObj.lng]] : null;

  const buildGoogleMapsUrl = (lat, lng, label = '') => {
    if (userLocation) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving`;
    }
    const query = label ? encodeURIComponent(`${lat},${lng} (${label})`) : `${lat},${lng}`;
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const buildWazeUrl = (lat, lng) => `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

  return (
    <div className="space-y-6 text-white">
      
      {/* Encabezado de Telemetría y Cobertura GPS Conectado con Google Maps */}
      <div className="bg-[#0a152e] p-5 sm:p-6 rounded-3xl border border-blue-500/20 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-[#00f0ff] p-[2px] shadow-lg shadow-cyan-500/30 shrink-0">
            <div className="w-full h-full bg-[#060b18] rounded-[14px] flex items-center justify-center">
              <Compass className="w-7 h-7 text-[#00f0ff] animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-wide">
                Telemetría GPS &amp; Google Maps • Sede Central Bogotá, D.C.
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                locationStatus === 'granted'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
              }`}>
                {locationStatus === 'granted' ? '● GPS EN VIVO ACTIVO' : '● RED BOGOTÁ 5 NODOS'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {locationStatus === 'granted' && userLocation
                ? `Coordenadas: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)} • Precisión: ±${userLocation.accuracy} m • Última lectura: ${lastUpdatedTime}`
                : 'Cartografía detallada conectada con Google Maps y Waze. Selecciona cualquier nodo técnico para trazar ruta directa y cobertura SLA.'}
            </p>
          </div>
        </div>

        {/* Controles Superiores de Sincronización y Google Maps */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="bg-[#060b18] px-3.5 py-2 rounded-2xl border border-blue-500/20 text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Ciclo Telemetría</span>
            <span className="font-mono text-xs font-black text-[#00f0ff] flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatCountdown(nextUpdateSeconds)}
            </span>
          </div>

          <button
            type="button"
            onClick={requestLocation}
            className="px-3.5 py-2.5 rounded-2xl bg-blue-950 hover:bg-blue-900 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer"
            title="Actualizar posición GPS de inmediato"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${locationStatus === 'updating' ? 'animate-spin' : ''}`} />
            <span>Mi Ubicación GPS</span>
          </button>

          <a
            href={buildGoogleMapsUrl(
              selectedTechObj ? selectedTechObj.lat : HQ_COORDS[0],
              selectedTechObj ? selectedTechObj.lng : HQ_COORDS[1],
              selectedTechObj ? selectedTechObj.name : 'Blueprint Sede Central'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-2xl bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir en Google Maps</span>
          </a>
        </div>
      </div>

      {/* Aviso si el permiso de geolocalización fue bloqueado */}
      {locationStatus === 'denied' && (
        <div className="bg-blue-950/50 border border-cyan-500/30 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-cyan-200">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-[#00f0ff] shrink-0" />
            <span>
              Mostrando telemetría desde nuestra <b>Sede Central Chapinero (Cra. 7 # 71-21)</b>. Si deseas calcular el tiempo exacto hasta tu puerta, habilita el permiso de ubicación del navegador.
            </span>
          </div>
          <button
            type="button"
            onClick={requestLocation}
            className="px-3 py-1.5 rounded-xl bg-[#00f0ff] text-[#060b18] font-black text-xs shrink-0 hover:opacity-90 cursor-pointer"
          >
            Activar GPS
          </button>
        </div>
      )}

      {/* Mapa Interactivo Multicapa y Panel Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl relative h-[540px] bg-[#060b18]">
          
          {/* Barra Superior Flotante: Selector de Capas Google Maps / Satélite / Oscuro */}
          <div className="absolute top-3.5 left-3.5 right-3.5 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="bg-[#060b18]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-cyan-500/40 text-xs text-white shadow-xl flex items-center gap-2 pointer-events-auto">
              <Layers className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span className="font-bold text-[11px]">{activeLayer.badge}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#060b18]/95 backdrop-blur-md p-1 rounded-xl border border-blue-500/40 shadow-xl pointer-events-auto">
              {Object.values(MAP_TILE_LAYERS).map(layer => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setMapStyle(layer.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    mapStyle === layer.id
                      ? 'bg-gradient-to-r from-blue-600 to-[#00f0ff] text-[#060b18] shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-blue-950/60'
                  }`}
                >
                  {layer.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCoverageZones(!showCoverageZones)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  showCoverageZones
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
                title="Mostrar u ocultar anillos de cobertura SLA"
              >
                Radios SLA
              </button>
            </div>
          </div>

          <MapContainer 
            center={BOGOTA_CENTER} 
            zoom={12} 
            style={{ width: '100%', height: '100%', background: '#060b18' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              key={activeLayer.id}
              attribution={activeLayer.attribution}
              url={activeLayer.url}
              maxZoom={20}
            />

            <MapCameraController targetCoords={cameraTarget.coords} targetZoom={cameraTarget.zoom} />

            {/* Línea de Ruta Activa entre el Cliente/Sede y el Especialista Seleccionado */}
            {routePolyline && (
              <Polyline
                positions={routePolyline}
                pathOptions={{
                  color: '#00f0ff',
                  weight: 3.5,
                  dashArray: '8, 8',
                  opacity: 0.9
                }}
              />
            )}

            {/* Marcador de Ubicación del Usuario */}
            {userLocation && (
              <>
                <Marker 
                  position={[userLocation.lat, userLocation.lng]}
                  icon={createCustomIcon('#00f0ff', 'Tu Ubicación GPS', true, true)}
                >
                  <Popup className="blueprint-popup">
                    <div className="text-xs p-1 text-slate-100 font-sans space-y-1.5">
                      <b className="text-[#00f0ff] block text-sm">📍 Tu Ubicación Actual</b>
                      <p className="text-[11px] text-slate-300">
                        Sincronizada por GPS con precisión de ±{userLocation.accuracy} metros.
                      </p>
                      <span className="text-[10px] text-slate-400 block">
                        Lectura: {lastUpdatedTime}
                      </span>
                    </div>
                  </Popup>
                </Marker>

                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={Math.max(userLocation.accuracy || 80, 180)}
                  pathOptions={{
                    color: '#00f0ff',
                    fillColor: '#00f0ff',
                    fillOpacity: 0.14,
                    weight: 1.5
                  }}
                />
              </>
            )}

            {/* Sede Central Bogotá */}
            <Marker 
              position={HQ_COORDS}
              icon={createCustomIcon('#10b981', 'HQ Sede Central', false, false)}
            >
              <Popup>
                <div className="text-xs p-1 text-slate-100 font-sans space-y-2">
                  <b className="text-emerald-400 block text-sm">🏢 Blueprint Sede Central y Laboratorio</b>
                  <p className="text-[11px] text-slate-300">Cra. 7 # 71-21, Torre Empresarial, Chapinero, Bogotá, D.C.</p>
                  <div className="flex gap-1.5 pt-1">
                    <a
                      href={buildGoogleMapsUrl(HQ_COORDS[0], HQ_COORDS[1], 'Blueprint Sede Central')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 text-[#060b18] font-black text-[10px] no-underline"
                    >
                      Google Maps
                    </a>
                    <a
                      href={buildWazeUrl(HQ_COORDS[0], HQ_COORDS[1])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-cyan-400 text-[#060b18] font-black text-[10px] no-underline"
                    >
                      Waze
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Los 5 Nodos Móviles en Bogotá con Anillos SLA y Enlaces a Google Maps / Waze */}
            {technicians.map((tech, idx) => {
              const zoneMeta = NODE_ZONES[tech.id] || { zone: 'Bogotá, D.C.', radiusMeters: 3000, color: '#38bdf8' };
              const isSelected = selectedNodeId === tech.id;
              const distFromOrigin = getDistanceKm(originPoint[0], originPoint[1], tech.lat, tech.lng);
              const etaMins = Math.max(12, Math.round(distFromOrigin * 3.5 + 8));

              return (
                <React.Fragment key={tech.id}>
                  {showCoverageZones && (
                    <Circle
                      center={[tech.lat, tech.lng]}
                      radius={zoneMeta.radiusMeters}
                      pathOptions={{
                        color: isSelected ? '#00f0ff' : zoneMeta.color,
                        fillColor: isSelected ? '#00f0ff' : zoneMeta.color,
                        fillOpacity: isSelected ? 0.16 : 0.06,
                        weight: isSelected ? 2 : 1,
                        dashArray: isSelected ? undefined : '4, 6'
                      }}
                    />
                  )}

                  <Marker
                    position={[tech.lat, tech.lng]}
                    icon={createCustomIcon(
                      isSelected ? '#00f0ff' : zoneMeta.color,
                      `Nodo #0${idx + 1} • ${tech.name.split(' ')[0]}`,
                      false,
                      isSelected
                    )}
                    eventHandlers={{
                      click: () => setSelectedNodeId(tech.id)
                    }}
                  >
                    <Popup>
                      <div className="text-xs p-1 text-slate-100 font-sans space-y-2 min-w-[210px]">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={tech.avatar}
                            alt={tech.name}
                            className="w-10 h-10 rounded-xl object-cover border border-cyan-400"
                          />
                          <div>
                            <span className="text-[9px] font-black uppercase text-cyan-400 block">
                              Nodo #0{idx + 1} • {zoneMeta.zone}
                            </span>
                            <b className="text-white block text-sm">{tech.name}</b>
                            <span className="text-[10px] text-slate-400 block">{tech.vehicle} ({tech.plate})</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-snug">{tech.title}</p>

                        <div className="bg-[#0a152e] p-2 rounded-lg border border-blue-500/30 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 font-bold">● En Guardia Activa</span>
                          <span className="text-cyan-300 font-mono font-bold">~{etaMins} min ({distFromOrigin} km)</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <a
                            href={buildGoogleMapsUrl(tech.lat, tech.lng, tech.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] text-center no-underline flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Google Maps</span>
                          </a>
                          <a
                            href={buildWazeUrl(tech.lat, tech.lng)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#060b18] font-black text-[10px] text-center no-underline flex items-center justify-center gap-1"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Waze GPS</span>
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>

          {/* Barra Inferior Flotante con Botón de Vista General y Leyenda */}
          <div className="absolute bottom-3.5 left-3.5 right-3.5 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="bg-[#060b18]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/30 text-[11px] text-slate-300 flex items-center gap-3 pointer-events-auto shadow-lg">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] inline-block"></span>
                Nodos Móviles (5)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                Sede Central Cra. 7
              </span>
            </div>

            {selectedNodeId && (
              <button
                type="button"
                onClick={handleResetView}
                className="bg-[#060b18]/95 hover:bg-blue-950 text-[#00f0ff] border border-cyan-500/40 px-3 py-1.5 rounded-xl text-[11px] font-bold pointer-events-auto shadow-lg cursor-pointer"
              >
                Ver Todo Bogotá
              </button>
            )}
          </div>
        </div>

        {/* Panel Lateral de Despacho y Nodos Interactivos */}
        <div className="space-y-4">
          
          {selectedTechObj && (
            <div className="bg-[#0a152e] p-5 rounded-3xl border border-cyan-500/30 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00f0ff]" />
                  {selectedNodeId ? 'Nodo Seleccionado en Mapa' : 'Especialista Más Cercano'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                  A {getDistanceKm(originPoint[0], originPoint[1], selectedTechObj.lat, selectedTechObj.lng)} km
                </span>
              </div>

              <div className="flex items-center space-x-3 bg-[#060b18] p-3 rounded-2xl border border-blue-500/20">
                <img
                  src={selectedTechObj.avatar}
                  alt={selectedTechObj.name}
                  className="w-12 h-12 rounded-xl object-cover border border-cyan-400 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-white text-xs truncate">{selectedTechObj.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{selectedTechObj.vehicle} • Placa {selectedTechObj.plate}</p>
                  <p className="text-[11px] text-[#00f0ff] font-bold mt-0.5">
                    Arribo estimado: ~{Math.max(12, Math.round(getDistanceKm(originPoint[0], originPoint[1], selectedTechObj.lat, selectedTechObj.lng) * 3.5 + 8))} min
                  </p>
                </div>
              </div>

              {/* Botones Directos a Google Maps y Waze */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={buildGoogleMapsUrl(selectedTechObj.lat, selectedTechObj.lng, selectedTechObj.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-blue-950 hover:bg-blue-900 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ruta Google Maps</span>
                </a>
                <a
                  href={buildWazeUrl(selectedTechObj.lat, selectedTechObj.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/30 text-[#00f0ff] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Abrir en Waze</span>
                </a>
              </div>
            </div>
          )}

          {activeOrder ? (
            <div className="bg-[#0a152e] p-5 rounded-3xl border border-blue-500/20 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#00f0ff]">#{activeOrder.id}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase">
                  {activeOrder.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">{activeOrder.serviceName}</h4>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#00f0ff] shrink-0" />
                  <span>{activeOrder.address}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenChat && onOpenChat(activeOrder)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] text-[#060b18] font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Abrir Chat con el Especialista</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#0a152e] p-5 rounded-3xl border border-blue-500/20 text-center space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30 mx-auto">
                <LocateFixed className="w-5 h-5" />
              </div>
              
              <div>
                <h4 className="text-sm font-extrabold text-white">Sin Orden Activa en Ruta</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Solicita un especialista para activar el despacho prioritario a tu dirección en Bogotá.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenBookingModal && onOpenBookingModal()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:opacity-95 text-[#060b18] font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Solicitar Especialista a Mi Ubicación</span>
              </button>
            </div>
          )}

          {/* Selector Interactivo de los 5 Nodos en Bogotá */}
          <div className="bg-[#060b18] p-4 rounded-2xl border border-blue-500/20 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                5 Nodos en Bogotá (Clic para enfocar)
              </span>
              <span className="text-[10px] text-[#00f0ff] font-semibold">SLA &lt; 45 min</span>
            </div>

            <div className="space-y-1.5">
              {technicians.map((tech, idx) => {
                const zoneMeta = NODE_ZONES[tech.id] || { zone: 'Bogotá, D.C.', color: '#38bdf8' };
                const isSelected = selectedNodeId === tech.id;
                const distKm = getDistanceKm(originPoint[0], originPoint[1], tech.lat, tech.lng);

                return (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => handleFocusNode(tech)}
                    className={`w-full p-2 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#0a152e] border-[#00f0ff] text-white shadow-md'
                        : 'bg-[#0a152e]/40 border-blue-500/15 text-slate-300 hover:border-blue-500/40'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-[11px] text-white block truncate">
                        Nodo #0{idx + 1}: {tech.name}
                      </span>
                      <span className="text-[10px] text-cyan-300 block truncate">
                        {zoneMeta.zone}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                      {distKm} km
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
