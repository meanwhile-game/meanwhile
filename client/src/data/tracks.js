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

  // --- 05 CHENNAI CIRCUIT (Locked - Under Development) ---
  {
    id: 'chennai-circuit',
    circuitNumber: '05',
    name: 'CHENNAI GRAND PRIX',
    subtitle: 'Coastal speedway, Marina sea breeze, high-velocity straights.',
    difficulty: 'Grand Prix',
    distanceKm: 5.8,
    laps: 2,
    isLocked: true,
    statusBadge: 'Under Development',
    releaseSeason: 'Season 2 Expansion',
    skyTheme: 'chennai',
    accentColor: '#f59e0b',
    mainImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    description: 'Inspired by the historic Madras Motor Race Track and the sweeping Marina coastline. High-speed endurance layout currently in active 3D track modeling.'
  },

  // --- 06 HYDERABAD STREET CIRCUIT (Locked - Under Development) ---
  {
    id: 'hyderabad-circuit',
    circuitNumber: '06',
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

  // --- 07 BANGALORE SILICON EXPRESSWAY (Locked - Under Development) ---
  {
    id: 'bangalore-circuit',
    circuitNumber: '07',
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

  // --- 08 MUMBAI SEA LINK (Locked - Under Development) ---
  {
    id: 'mumbai-circuit',
    circuitNumber: '08',
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
  return TRACKS.find(t => t.id === cleanId) || TRACKS[1];
};
