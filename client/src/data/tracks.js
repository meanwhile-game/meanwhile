// Track & Circuit Definitions matching the 4-Circuit Reference Image & Upcoming Locked Maps

export const TRACKS = [
  // --- 01 MOUNTAIN CIRCUIT (Reference Quadrant 1) ---
  {
    id: 'mountain-circuit',
    circuitNumber: '01',
    name: 'MOUNTAIN CIRCUIT',
    subtitle: 'Lush forests. Sharp turns. Endless views.',
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
    description: 'Winding viaducts cut through emerald pine valleys and towering mountain waterfalls. Demands precision pacing through sharp elevation transitions.',
    mainImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=80'
    ],
    svgPath: 'M 48 18 C 68 15, 82 28, 80 48 C 78 62, 62 66, 68 80 C 76 96, 62 106, 44 105 C 26 104, 22 84, 30 65 C 36 50, 24 24, 48 18 Z'
  },

  // --- 02 COASTAL CIRCUIT (Reference Quadrant 2) ---
  {
    id: 'coastal-circuit',
    circuitNumber: '02',
    name: 'COASTAL CIRCUIT',
    subtitle: 'Ocean breeze. Flowing roads. Pure momentum.',
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
    description: 'Sun-drenched sea cliffs overlooking azure waters and distant sailboats. Wide rolling bends designed to unlock peak typing cadence.',
    mainImage: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=300&q=80'
    ],
    svgPath: 'M 35 22 C 55 12, 86 18, 85 45 C 84 65, 62 66, 58 80 C 54 94, 48 106, 32 102 C 18 98, 14 74, 24 54 C 32 38, 16 30, 35 22 Z'
  },

  // --- 03 SNOW CIRCUIT (Reference Quadrant 3) ---
  {
    id: 'snow-circuit',
    circuitNumber: '03',
    name: 'SNOW CIRCUIT',
    subtitle: 'Snowy heights. Icy corners. A different kind of thrill.',
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
    description: 'Carved through frosty snowbanks and towering frozen peaks. Low-grip sensory feedback and pristine white vistas reward calm focus.',
    mainImage: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1200&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80'
    ],
    svgPath: 'M 50 16 C 72 20, 82 36, 72 54 C 62 70, 72 84, 64 100 C 56 108, 36 108, 28 96 C 20 84, 28 66, 24 50 C 20 36, 30 16, 50 16 Z'
  },

  // --- 04 CITY CIRCUIT (Reference Quadrant 4) ---
  {
    id: 'city-circuit',
    circuitNumber: '04',
    name: 'CITY CIRCUIT',
    subtitle: 'Neon lights. High-speed streets. A new pace.',
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
    description: 'Rain-slicked metropolitan highway cutting beneath illuminated neon towers, cyber billboards, and glowing purple overpasses.',
    mainImage: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=300&q=80'
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

export const getTrackById = (id) => TRACKS.find(t => t.id === id) || TRACKS[1]; // defaults to 02 Coastal Circuit
