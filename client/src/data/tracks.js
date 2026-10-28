// Track & Circuit Definitions matching the 4-Circuit Reference Image & Upcoming Locked Maps

export const TRACKS = [
  // --- 01 MOUNTAIN PASS (Reference Quadrant 1) ---
  {
    id: 'mountain-pass',
    circuitNumber: '01',
    name: 'MOUNTAIN PASS',
    subtitle: 'Lush forests, waterfalls, and winding mountain roads.',
    difficulty: 'Challenging',
    distanceKm: 5.2,
    laps: 2,
    isLocked: false,
    skyTheme: 'mountain',
    accentColor: '#34d399',
    skyColorTop: '#102538',
    skyColorBottom: '#2d4a3e',
    roadColor: '#17202a',
    fogColor: '#1a2e30',
    fogDensity: 0.0025,
    ambientLight: '#86efac',
    turns: 'Alpine Hairpins',
    description: 'Dense green forests, towering mountains, waterfalls, mist, winding asphalt roads, bridges, and roadside guardrails.',
    mainImage: '/tracks/mountain-pass.jpg',
    thumbnails: [
      '/tracks/mp-thumb-1.jpg',
      '/tracks/mp-thumb-2.jpg',
      '/tracks/mp-thumb-3.jpg',
      '/tracks/mp-thumb-4.jpg'
    ],
    svgPath: 'M 48 18 C 68 15, 82 28, 80 48 C 78 62, 62 66, 68 80 C 76 96, 62 106, 44 105 C 26 104, 22 84, 30 65 C 36 50, 24 24, 48 18 Z'
  },

  // --- 02 COASTAL RUN (Reference Quadrant 2) ---
  {
    id: 'coastal-run',
    circuitNumber: '02',
    name: 'COASTAL RUN',
    subtitle: 'Ocean views, cliffs, and breathtaking highway drives.',
    difficulty: 'Flowing',
    distanceKm: 6.1,
    laps: 2,
    isLocked: false,
    skyTheme: 'coastal',
    accentColor: '#38bdf8',
    skyColorTop: '#132238',
    skyColorBottom: '#ea580c',
    roadColor: '#161c28',
    fogColor: '#2b1b36',
    fogDensity: 0.0018,
    ambientLight: '#fde047',
    turns: 'Oceanic Sweepers',
    description: 'A scenic highway following the ocean, coastal cliffs, turquoise water, seaside structures, bridges, and warm sunset lighting.',
    mainImage: '/tracks/coastal-run.jpg',
    thumbnails: [
      '/tracks/cr-thumb-1.jpg',
      '/tracks/cr-thumb-2.jpg',
      '/tracks/cr-thumb-3.jpg',
      '/tracks/cr-thumb-4.jpg'
    ],
    svgPath: 'M 35 22 C 55 12, 86 18, 85 45 C 84 65, 62 66, 58 80 C 54 94, 48 106, 32 102 C 18 98, 14 74, 24 54 C 32 38, 16 30, 35 22 Z'
  },

  // --- 03 SNOW CIRCUIT (Reference Quadrant 3) ---
  {
    id: 'snow-circuit',
    circuitNumber: '03',
    name: 'SNOW CIRCUIT',
    subtitle: 'Snowy peaks, frozen landscapes, and icy roads.',
    difficulty: 'Extreme',
    distanceKm: 4.8,
    laps: 2,
    isLocked: false,
    skyTheme: 'snow',
    accentColor: '#93c5fd',
    skyColorTop: '#0b1626',
    skyColorBottom: '#cbd5e1',
    roadColor: '#1a202c',
    fogColor: '#1e293b',
    fogDensity: 0.0035,
    ambientLight: '#bfdbfe',
    turns: 'Icy Transitions',
    description: 'Snow-covered mountains, pine forests, icy roads, snow particles, alpine tunnels, and cold atmospheric lighting.',
    mainImage: '/tracks/snow-circuit.jpg',
    thumbnails: [
      '/tracks/sc-thumb-1.jpg',
      '/tracks/sc-thumb-2.jpg',
      '/tracks/sc-thumb-3.jpg',
      '/tracks/sc-thumb-4.jpg'
    ],
    svgPath: 'M 50 16 C 72 20, 82 36, 72 54 C 62 70, 72 84, 64 100 C 56 108, 36 108, 28 96 C 20 84, 28 66, 24 50 C 20 36, 30 16, 50 16 Z'
  },

  // --- 04 NEON CITY (Reference Quadrant 4) ---
  {
    id: 'neon-city',
    circuitNumber: '04',
    name: 'NEON CITY',
    subtitle: 'Futuristic skyline, neon lights, and high-speed urban streets.',
    difficulty: 'Fast Pace',
    distanceKm: 5.6,
    laps: 2,
    isLocked: false,
    skyTheme: 'city',
    accentColor: '#c084fc',
    skyColorTop: '#050713',
    skyColorBottom: '#220b38',
    roadColor: '#0f1422',
    fogColor: '#160d29',
    fogDensity: 0.002,
    ambientLight: '#e879f9',
    turns: 'Grid Sprints',
    description: 'A futuristic NYC-inspired city with skyscrapers, elevated highways, illuminated billboards, neon signage, and reflective nighttime roads.',
    mainImage: '/tracks/neon-city.jpg',
    thumbnails: [
      '/tracks/nc-thumb-1.jpg',
      '/tracks/nc-thumb-2.jpg',
      '/tracks/nc-thumb-3.jpg',
      '/tracks/nc-thumb-4.jpg'
    ],
    svgPath: 'M 24 24 L 76 24 C 84 24, 86 32, 86 44 C 86 56, 76 56, 76 68 C 76 80, 86 80, 86 92 C 86 102, 80 104, 68 104 L 32 104 C 20 104, 16 98, 16 86 L 16 42 C 16 28, 20 24, 24 24 Z'
  },

  // --- 05 CHENNAI — MARINA DRIVE (Reference Image Left Panel) ---
  {
    id: 'chennai-circuit',
    circuitNumber: '05',
    name: 'CHENNAI MARINA DRIVE',
    subtitle: 'Coastal highways, iconic landmarks, and the spirit of Chennai.',
    difficulty: 'Sweeping Coastal',
    distanceKm: 6.4,
    laps: 2,
    isLocked: false,
    skyTheme: 'chennai',
    accentColor: '#fb923c',
    skyColorTop: '#162238',
    skyColorBottom: '#ea580c',
    roadColor: '#171a24',
    fogColor: '#2c1a24',
    fogDensity: 0.0022,
    ambientLight: '#fed7aa',
    turns: 'Marina Sweepers',
    description: 'A wide coastal expressway along Marina Beach, historic Indo-Saracenic red-brick clock tower, swaying palms, Bay of Bengal sunset, and golden ocean reflections.',
    mainImage: '/tracks/chennai-circuit.jpg',
    thumbnails: [
      '/tracks/ch-thumb-1.jpg',
      '/tracks/ch-thumb-2.jpg',
      '/tracks/ch-thumb-3.jpg',
      '/tracks/ch-thumb-4.jpg'
    ],
    svgPath: 'M 25 35 C 35 20, 75 16, 85 30 C 95 44, 90 70, 85 92 C 80 106, 60 110, 42 104 C 28 98, 22 85, 26 70 C 30 55, 18 45, 25 35 Z'
  },

  // --- 06 NEW DELHI — RAJPATH CIRCUIT (Reference Image Right Panel) ---
  {
    id: 'delhi-circuit',
    circuitNumber: '06',
    name: 'NEW DELHI RAJPATH',
    subtitle: 'Iconic landmarks, grand avenues, and a high-speed city experience.',
    difficulty: 'Ceremonial Sprint',
    distanceKm: 5.8,
    laps: 2,
    isLocked: false,
    skyTheme: 'delhi',
    accentColor: '#f59e0b',
    skyColorTop: '#080c1e',
    skyColorBottom: '#2b123a',
    roadColor: '#090c14',
    fogColor: '#160e28',
    fogDensity: 0.0020,
    ambientLight: '#fde047',
    turns: 'Hexagon Sprints',
    description: 'Ceremonial avenues of Kartavya Path, towering India Gate landmark ahead, illuminated Rashtrapati Bhavan dome, water fountains, and rain-slicked twilight road reflections in amber and midnight blue.',
    mainImage: '/tracks/delhi-circuit.jpg',
    thumbnails: [
      '/tracks/dl-thumb-1.jpg',
      '/tracks/dl-thumb-2.jpg',
      '/tracks/dl-thumb-3.jpg',
      '/tracks/dl-thumb-4.jpg'
    ],
    svgPath: 'M 50 16 C 62 16, 75 25, 78 40 C 80 55, 72 65, 82 82 C 88 92, 78 106, 62 105 C 50 104, 45 92, 38 92 C 30 92, 22 104, 18 96 C 14 86, 22 70, 24 55 C 26 40, 38 16, 50 16 Z'
  },

  // --- 07 HYDERABAD STREET CIRCUIT (Locked - Under Development) ---
  {
    id: 'hyderabad-circuit',
    circuitNumber: '07',
    name: 'HYDERABAD STREET CIRCUIT',
    subtitle: 'Hussain Sagar lakefront loop, elevated flyovers, night lights.',
    difficulty: 'Street Circuit',
    distanceKm: 6.4,
    laps: 2,
    isLocked: true,
    statusBadge: 'Under Development',
    releaseSeason: 'Season 2 Expansion',
    skyTheme: 'hyderabad',
    accentColor: '#38bdf8',
    mainImage: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=1200&q=80',
    description: 'A technical city circuit tracing the contours of the historic lake and illuminated urban expressways. Under procedural lighting pass.'
  },

  // --- 08 BANGALORE SILICON EXPRESSWAY (Locked - Under Development) ---
  {
    id: 'bangalore-circuit',
    circuitNumber: '08',
    name: 'BANGALORE EXPRESSWAY',
    subtitle: 'Elevated tech corridors, rain-slicked flyovers, cool evening mist.',
    difficulty: 'Endurance',
    distanceKm: 7.2,
    laps: 1,
    isLocked: true,
    statusBadge: 'Under Development',
    releaseSeason: 'Season 2 Expansion',
    skyTheme: 'bangalore',
    accentColor: '#10b981',
    mainImage: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
    description: 'Sweeping multi-level flyovers through the tech capital. High sustained cadence challenge scheduled for post-launch drop.'
  },

  // --- 09 MUMBAI SEA LINK (Locked - Under Development) ---
  {
    id: 'mumbai-circuit',
    circuitNumber: '09',
    name: 'MUMBAI SEA LINK',
    subtitle: 'Vast cable-stayed bridge slicing across the Arabian Sea.',
    difficulty: 'High Speed',
    distanceKm: 8.0,
    laps: 1,
    isLocked: true,
    statusBadge: 'Under Development',
    releaseSeason: 'Season 2 Expansion',
    skyTheme: 'mumbai',
    accentColor: '#f43f5e',
    mainImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
    description: 'An iconic 8-lane ocean causeway bathed in twilight reflections and monsoon sea spray. In engineering development.'
  }
];

export const getTrackById = (id) => {
  if (!id) return TRACKS[1]; // Defaults to 02 Coastal Run
  const cleanId = String(id).toLowerCase().trim();
  if (cleanId === 'mountain-pass' || cleanId === 'mountain-circuit' || cleanId === 'mountain') {
    return TRACKS.find(t => t.id === 'mountain-pass') || TRACKS[0];
  }
  if (cleanId === 'coastal-run' || cleanId === 'coastal-circuit' || cleanId === 'coastal-drive' || cleanId === 'coastal') {
    return TRACKS.find(t => t.id === 'coastal-run') || TRACKS[1];
  }
  if (cleanId === 'snow-circuit' || cleanId === 'snow') {
    return TRACKS.find(t => t.id === 'snow-circuit') || TRACKS[2];
  }
  if (cleanId === 'neon-city' || cleanId === 'city-circuit' || cleanId === 'city') {
    return TRACKS.find(t => t.id === 'neon-city') || TRACKS[3];
  }
  if (cleanId === 'chennai-circuit' || cleanId === 'chennai-marina' || cleanId === 'chennai' || cleanId === 'marina-drive') {
    return TRACKS.find(t => t.id === 'chennai-circuit') || TRACKS[4];
  }
  if (cleanId === 'delhi-circuit' || cleanId === 'new-delhi-rajpath' || cleanId === 'delhi' || cleanId === 'new-delhi' || cleanId === 'rajpath') {
    return TRACKS.find(t => t.id === 'delhi-circuit') || TRACKS[5];
  }
  return TRACKS.find(t => t.id === cleanId) || TRACKS[1];
};
