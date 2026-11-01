import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getTrackGpsState } from '../../data/tracks.js';
import { 
  Navigation, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Compass, 
  MapPin, 
  ChevronRight, 
  Globe, 
  Radio, 
  Columns,
  Eye
} from 'lucide-react';

// Tile Providers
const TILE_LAYERS = {
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 18
  },
  dark: {
    name: 'Tactical Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  },
  streets: {
    name: 'Street View',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }
};

export const TacticalGpsMap = ({ 
  track, 
  progress = 0, 
  speedKmh = 0, 
  racers = [],
  mode = 'compact', // 'compact' | 'split' | 'fullscreen'
  onModeChange = null 
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const routeLineRef = useRef(null);
  const routeGlowRef = useRef(null);
  const playerMarkerRef = useRef(null);
  const opponentMarkersRef = useRef({});

  const [activeLayer, setActiveLayer] = useState('satellite'); // 'satellite' | 'dark' | 'streets'
  const [isFollowCar, setIsFollowCar] = useState(true);

  // Compute live continuous GPS state from authentic waypoints
  const gpsState = useMemo(() => {
    return getTrackGpsState(track, progress);
  }, [track, progress]);

  // Compute opponent positions on route
  const opponentGpsStates = useMemo(() => {
    return racers.filter(r => !r.isPlayer).map((bot, i) => {
      const botProgress = bot.progress || 0;
      const botGps = getTrackGpsState(track, botProgress);
      return {
        id: bot.id || `bot-${i}`,
        name: bot.name || `Racer ${i + 1}`,
        rank: bot.position || (i + 1),
        lat: botGps.lat,
        lng: botGps.lng,
        color: ['#f59e0b', '#38bdf8', '#a855f7', '#fb7185', '#34d399', '#f97316'][i % 6]
      };
    });
  }, [track, racers]);

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center coordinates
    const initialCenter = track?.gpsCenter || [28.6139, 77.2185];
    const initialZoom = track?.gpsZoom || 15;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: mode !== 'compact',
      dragging: true,
      doubleClickZoom: false
    });

    mapInstanceRef.current = map;

    // Initial Tile Layer
    const provider = TILE_LAYERS[activeLayer];
    const tileLayer = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom,
      subdomains: provider.subdomains || 'abc'
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Draw Route Polyline
    if (gpsState.coordinates && gpsState.coordinates.length > 1) {
      // Background glow line
      const glow = L.polyline(gpsState.coordinates, {
        color: track?.accentColor || '#38bdf8',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      routeGlowRef.current = glow;

      // Sharp central route line
      const line = L.polyline(gpsState.coordinates, {
        color: '#f8fafc',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '8, 6',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      routeLineRef.current = line;
    }

    // Create Custom HTML Player GPS Marker
    const playerIcon = L.divIcon({
      className: 'custom-player-gps-icon',
      html: `
        <div id="player-gps-arrow" style="position: relative; width: 32px; height: 32px; transform: rotate(${gpsState.bearing}deg); transition: transform 0.25s linear;">
          <div style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(56, 189, 248, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 4px; border-radius: 9999px; background: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 0 15px rgba(56,189,248,0.9); display: flex; items-center; justify-content: center;">
            <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: #ffffff; stroke: none; margin: auto;">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([gpsState.lat, gpsState.lng], { icon: playerIcon, zIndexOffset: 1000 }).addTo(map);
    playerMarkerRef.current = marker;

    // Handle map resize properly
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [track.id]);

  // 2. Handle Layer Switching (Satellite vs Dark Matter vs Street)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const provider = TILE_LAYERS[activeLayer];
    const newLayer = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom,
      subdomains: provider.subdomains || 'abc'
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;

    // Keep route and marker on top
    if (routeGlowRef.current) routeGlowRef.current.bringToFront();
    if (routeLineRef.current) routeLineRef.current.bringToFront();
  }, [activeLayer]);

  // 3. Update Player Marker Position & Pan Map on Progress
  useEffect(() => {
    if (!playerMarkerRef.current || !mapInstanceRef.current) return;

    // Update marker coordinates
    playerMarkerRef.current.setLatLng([gpsState.lat, gpsState.lng]);

    // Update rotation arrow
    const arrowEl = document.getElementById('player-gps-arrow');
    if (arrowEl) {
      arrowEl.style.transform = `rotate(${gpsState.bearing}deg)`;
    }

    // Auto-follow car
    if (isFollowCar) {
      mapInstanceRef.current.panTo([gpsState.lat, gpsState.lng], {
        animate: true,
        duration: 0.2,
        easeLinearity: 0.5
      });
    }
  }, [gpsState.lat, gpsState.lng, gpsState.bearing, isFollowCar]);

  // 4. Update Opponent Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    opponentGpsStates.forEach(opp => {
      if (opponentMarkersRef.current[opp.id]) {
        opponentMarkersRef.current[opp.id].setLatLng([opp.lat, opp.lng]);
      } else {
        const oppIcon = L.divIcon({
          className: 'custom-opp-gps-icon',
          html: `
            <div style="position: relative; width: 18px; height: 18px;">
              <div style="width: 14px; height: 14px; border-radius: 9999px; background: ${opp.color}; border: 2px solid #000; box-shadow: 0 0 6px ${opp.color}; margin: 2px;"></div>
              <div style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%); font-size: 8px; font-weight: 800; color: #fff; background: rgba(0,0,0,0.8); padding: 1px 3px; border-radius: 3px; white-space: nowrap;">
                #${opp.rank}
              </div>
            </div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });
        const m = L.marker([opp.lat, opp.lng], { icon: oppIcon }).addTo(map);
        opponentMarkersRef.current[opp.id] = m;
      }
    });
  }, [opponentGpsStates]);

  // 5. Invalidate Size when mode changes (compact -> split -> fullscreen)
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [mode]);

  // Format Cardinal Compass Direction (e.g. 082° ENE)
  const formatCardinal = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return `${Math.round(deg).toString().padStart(3, '0')}° ${directions[index]}`;
  };

  // Convert decimal degrees to standard GPS DMS string
  const formatDms = (lat, lng) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    const latAbs = Math.abs(lat);
    const lngAbs = Math.abs(lng);
    const latD = Math.floor(latAbs);
    const latM = Math.floor((latAbs - latD) * 60);
    const latS = Math.round(((latAbs - latD) * 60 - latM) * 60);
    const lngD = Math.floor(lngAbs);
    const lngM = Math.floor((lngAbs - lngD) * 60);
    const lngS = Math.round(((lngAbs - lngD) * 60 - lngM) * 60);
    return `${latD}°${latM}'${latS}"${latDir} ${lngD}°${lngM}'${lngS}"${lngDir}`;
  };

  return (
    <div className={`relative overflow-hidden transition-all duration-300 select-none ${
      mode === 'fullscreen' 
        ? 'w-full h-full rounded-none' 
        : mode === 'split'
        ? 'w-full h-full rounded-2xl border border-white/20 shadow-2xl'
        : 'w-72 sm:w-80 h-56 rounded-2xl border border-white/20 shadow-2xl bg-[#090d16]/95 backdrop-blur-xl'
    }`}>
      {/* 1. Underlying Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* 2. Tactical Gradient Borders & Vignette for Premium HUD Look */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-transparent to-black/60 z-10" />

      {/* 3. Top Tactical HUD Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
        {/* GPS Live Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-white shadow-lg pointer-events-auto">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-emerald-400 tracking-wider">GPS LIVE</span>
          <span className="text-white/40">|</span>
          <span className="text-slate-300 truncate max-w-[110px]">
            {track?.locationName || 'Global Circuit'}
          </span>
        </div>

        {/* Tactical Controls: Layer Switcher & Mode Toggles */}
        <div className="flex items-center gap-1 pointer-events-auto">
          {/* Layer Selector Pill */}
          <div className="flex items-center rounded-lg bg-black/80 backdrop-blur-md border border-white/15 p-0.5 shadow-lg">
            <button
              onClick={() => setActiveLayer('satellite')}
              title="Satellite Imagery"
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                activeLayer === 'satellite'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sat
            </button>
            <button
              onClick={() => setActiveLayer('dark')}
              title="Tactical Dark Vector"
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                activeLayer === 'dark'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setActiveLayer('streets')}
              title="Street Map"
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                activeLayer === 'streets'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Street
            </button>
          </div>

          {/* Mode Toggle (Compact <-> Split <-> Fullscreen) */}
          {onModeChange && (
            <button
              onClick={() => {
                if (mode === 'compact') onModeChange('split');
                else if (mode === 'split') onModeChange('fullscreen');
                else onModeChange('compact');
              }}
              title={mode === 'compact' ? 'Expand to Split Screen Navigation' : 'Exit to Compact Widget'}
              className="p-1.5 rounded-lg bg-black/80 hover:bg-white/15 backdrop-blur-md border border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
            >
              {mode === 'compact' ? (
                <Columns className="w-3.5 h-3.5" />
              ) : mode === 'split' ? (
                <Maximize2 className="w-3.5 h-3.5" />
              ) : (
                <Minimize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 4. Center-Left: Turn-by-Turn Dynamic Guidance Banner */}
      <div className="absolute top-12 left-2.5 right-2.5 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 shadow-xl">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 flex-shrink-0">
            <Navigation className="w-4 h-4" style={{ transform: `rotate(${gpsState.bearing}deg)` }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-white truncate leading-tight">
              {gpsState.nextTurn}
            </div>
            <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 leading-none mt-0.5">
              <span className="text-amber-400 font-semibold">{gpsState.distToTurnM}m</span>
              <span>·</span>
              <span className="truncate">{gpsState.currentStreet}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Telemetry Bar: Coordinates, Elevation, Bearing */}
      <div className="absolute bottom-2 left-2.5 right-2.5 z-20 pointer-events-none flex items-end justify-between text-white font-mono">
        {/* Lat / Long DMS Readout */}
        <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[9px] text-slate-300 shadow-md">
          <div className="text-[7.5px] uppercase tracking-widest text-slate-500 font-bold">
            COORDINATES
          </div>
          <div className="font-bold tracking-tight text-white/90">
            {formatDms(gpsState.lat, gpsState.lng)}
          </div>
        </div>

        {/* Bearing & Elevation */}
        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[9px] text-right shadow-md">
            <div className="text-[7.5px] uppercase tracking-widest text-slate-500 font-bold">
              HEADING
            </div>
            <div className="font-bold text-sky-400">
              {formatCardinal(gpsState.bearing)}
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[9px] text-right shadow-md">
            <div className="text-[7.5px] uppercase tracking-widest text-slate-500 font-bold">
              ALTITUDE
            </div>
            <div className="font-bold text-amber-400">
              {gpsState.elevationM}m
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
