// Track & Circuit Definitions matching the 4-Circuit Reference Image & Upcoming Locked Maps

export const TRACKS = [
  // --- 01 MOUNTAIN PASS (Reference Image Quadrant 1) ---
  {
    id: 'mountain-pass',
    circuitNumber: '01',
    name: 'MOUNTAIN PASS',
    subtitle: 'Dense forests · Waterfalls · Alpine roads',
    difficulty: 'Challenging',
    distanceKm: 12.4,
    elevationM: 1850,
    laps: 2,
    isLocked: false,
    skyTheme: 'mountain',
    accentColor: '#34d399',
    skyColorTop: '#102538',
    skyColorBottom: '#2d4a3e',
    roadColor: '#17202a',
    fogColor: '#1a2e30',
    fogDensity: 0.0022,
    ambientLight: '#86efac',
    turns: 'Technical Alpine Hairpins',
    description: 'Dense green forests, towering mountains, waterfalls, mist, winding asphalt roads, bridges, and roadside guardrails.',
    featureTags: ['TECHNICAL TURNS', 'SCENIC BRIDGES', 'MOUNTAIN VIEWS'],
    locationName: 'Stelvio Pass, Italian Alps',
    gpsCenter: [46.5293, 10.4530],
    gpsZoom: 14,
    primaryRoad: 'Strada Statale 38 dello Stelvio',
    mainImage: '/tracks/mountain-pass.jpg',
    thumbnails: [
      '/tracks/mp-thumb-1.jpg',
      '/tracks/mp-thumb-2.jpg',
      '/tracks/mp-thumb-3.jpg',
      '/tracks/mp-thumb-4.jpg'
    ],
    svgPath: 'M 48 18 C 68 15, 82 28, 80 48 C 78 62, 62 66, 68 80 C 76 96, 62 106, 44 105 C 26 104, 22 84, 30 65 C 36 50, 24 24, 48 18 Z',
    gpsWaypoints: [
      { lat: 46.5180, lng: 10.4320, name: 'Trafoi Valley Alpine Start', turn: 'Ascend Hairpin #48', elev: 1540 },
      { lat: 46.5220, lng: 10.4390, name: 'Lower Pine Forest Hairpins', turn: 'Sharp Hairpin Left', elev: 1820 },
      { lat: 46.5255, lng: 10.4460, name: 'Ortler Glacier Ridge', turn: 'Steep Incline Switchback', elev: 2180 },
      { lat: 46.5293, lng: 10.4530, name: 'Passo dello Stelvio Summit', turn: 'Crest Summit 2,757m', elev: 2757 },
      { lat: 46.5335, lng: 10.4615, name: 'Bormio Alpine Descent', turn: 'Technical Hairpin Right', elev: 2420 },
      { lat: 46.5385, lng: 10.4710, name: 'Alpine Stone Viaduct', turn: 'Cross Stone Pier Bridge', elev: 2100 },
      { lat: 46.5430, lng: 10.4810, name: 'Upper Valley Fast Sweeper', turn: 'Gentle Sweep Right', elev: 1950 },
      { lat: 46.5180, lng: 10.4320, name: 'Stelvio Grand Prix Finish', turn: 'Summit Finish Sprint', elev: 1540 }
    ]
  },

  // --- 02 COASTAL RUN (Reference Image Quadrant 2) ---
  {
    id: 'coastal-run',
    circuitNumber: '02',
    name: 'COASTAL RUN',
    subtitle: 'Ocean views · Cliffside roads · Scenic highways',
    difficulty: 'Flowing',
    distanceKm: 10.8,
    elevationM: 120,
    laps: 2,
    isLocked: false,
    skyTheme: 'coastal',
    accentColor: '#38bdf8',
    skyColorTop: '#132238',
    skyColorBottom: '#ea580c',
    roadColor: '#161c28',
    fogColor: '#2b1b36',
    fogDensity: 0.0016,
    ambientLight: '#fde047',
    turns: 'Oceanic Sweepers',
    locationName: 'Amalfi Coast, Campania, Italy',
    gpsCenter: [40.6335, 14.6030],
    gpsZoom: 14,
    primaryRoad: 'Strada Statale 163 Amalfitana',
    description: 'A scenic highway following the ocean, coastal cliffs, turquoise water, seaside structures, bridges, and warm sunset lighting.',
    featureTags: ['COASTAL HIGHWAYS', 'CLIFFSIDE TURNS', 'OCEAN HORIZONS'],
    mainImage: '/tracks/coastal-run.jpg',
    thumbnails: [
      '/tracks/cr-thumb-1.jpg',
      '/tracks/cr-thumb-2.jpg',
      '/tracks/cr-thumb-3.jpg',
      '/tracks/cr-thumb-4.jpg'
    ],
    svgPath: 'M 35 22 C 55 12, 86 18, 85 45 C 84 65, 62 66, 58 80 C 54 94, 48 106, 32 102 C 18 98, 14 74, 24 54 C 32 38, 16 30, 35 22 Z',
    gpsWaypoints: [
      { lat: 40.6275, lng: 14.5750, name: 'Praiano Cliffside Causeway', turn: 'Head East on SS163', elev: 140 },
      { lat: 40.6300, lng: 14.5880, name: 'Capo di Conca Lookout', turn: 'Sharp Mediterranean Right', elev: 120 },
      { lat: 40.6320, lng: 14.5960, name: 'Grotta dello Smeraldo Viaduct', turn: 'Through Roman Coastal Arch', elev: 95 },
      { lat: 40.6340, lng: 14.6030, name: 'Amalfi Marina Harbor Boulevard', turn: 'Harbor Seaside Straight', elev: 45 },
      { lat: 40.6375, lng: 14.6110, name: 'Atrani Rock Tunnel Approach', turn: 'Enter Cliffside Tunnel', elev: 55 },
      { lat: 40.6420, lng: 14.6200, name: 'Ravello Shoreline Viaduct', turn: 'High Speed Ocean Sweep', elev: 110 },
      { lat: 40.6360, lng: 14.5950, name: 'Conca dei Marini Hairpin', turn: 'Left onto Seaside Ridge', elev: 130 },
      { lat: 40.6275, lng: 14.5750, name: 'Amalfi Coast Grand Prix Finish', turn: 'Mediterranean Finish Sprint', elev: 140 }
    ]
  },

  // --- 03 SNOW CIRCUIT (Reference Image Quadrant 3) ---
  {
    id: 'snow-circuit',
    circuitNumber: '03',
    name: 'SNOW CIRCUIT',
    subtitle: 'Snowy peaks · Icy roads · Alpine landscapes',
    difficulty: 'Extreme',
    distanceKm: 11.6,
    elevationM: 1920,
    laps: 2,
    isLocked: false,
    skyTheme: 'snow',
    accentColor: '#93c5fd',
    skyColorTop: '#0b1626',
    skyColorBottom: '#cbd5e1',
    roadColor: '#1a202c',
    fogColor: '#1e293b',
    fogDensity: 0.0032,
    ambientLight: '#bfdbfe',
    turns: 'Icy Transitions',
    locationName: 'Furka Pass, Swiss Alps',
    gpsCenter: [46.5724, 8.4150],
    gpsZoom: 14,
    primaryRoad: 'Furkapass Route 19',
    description: 'Snow-covered mountains, pine forests, icy roads, snow particles, alpine tunnels, and cold atmospheric lighting.',
    featureTags: ['ICY ROADS', 'MOUNTAIN TUNNELS', 'SNOWY LANDSCAPES'],
    mainImage: '/tracks/snow-circuit.jpg',
    thumbnails: [
      '/tracks/sc-thumb-1.jpg',
      '/tracks/sc-thumb-2.jpg',
      '/tracks/sc-thumb-3.jpg',
      '/tracks/sc-thumb-4.jpg'
    ],
    svgPath: 'M 50 16 C 72 20, 82 36, 72 54 C 62 70, 72 84, 64 100 C 56 108, 36 108, 28 96 C 20 84, 28 66, 24 50 C 20 36, 30 16, 50 16 Z',
    gpsWaypoints: [
      { lat: 46.5640, lng: 8.3960, name: 'Gletsch Glacier Valley Base', turn: 'Climb East on Route 19', elev: 1760 },
      { lat: 46.5685, lng: 8.4060, name: 'Hotel Belvédère Hairpin', turn: 'Sharp Right around Glacier', elev: 2270 },
      { lat: 46.5724, lng: 8.4150, name: 'Rhone Glacier Summit Pass', turn: 'Hold Center in Snow Corridor', elev: 2429 },
      { lat: 46.5765, lng: 8.4260, name: 'Urseren Alpine Tunnel Portal', turn: 'Pass Through Alpine Tunnel', elev: 2310 },
      { lat: 46.5810, lng: 8.4370, name: 'Realp Valley Switchback', turn: 'Careful Braking Hairpin Left', elev: 2150 },
      { lat: 46.5770, lng: 8.4200, name: 'Glacier Crest Overlook', turn: 'High Speed Icy Transition', elev: 2380 },
      { lat: 46.5640, lng: 8.3960, name: 'Furka Pass Finish Gantry', turn: 'Glacial Finish Sprint', elev: 1760 }
    ]
  },

  // --- 04 NEON CITY (Reference Image Quadrant 4) ---
  {
    id: 'neon-city',
    circuitNumber: '04',
    name: 'NEON CITY',
    subtitle: 'Skyscrapers · Neon lights · Urban expressways',
    difficulty: 'Fast Pace',
    distanceKm: 9.7,
    elevationM: 40,
    laps: 2,
    isLocked: false,
    skyTheme: 'city',
    accentColor: '#c084fc',
    skyColorTop: '#050713',
    skyColorBottom: '#220b38',
    roadColor: '#0f1422',
    fogColor: '#160d29',
    fogDensity: 0.0018,
    ambientLight: '#e879f9',
    turns: 'Grid Sprints',
    locationName: 'Manhattan Waterfront, New York, USA',
    gpsCenter: [40.7128, -74.0060],
    gpsZoom: 14,
    primaryRoad: 'West Side Elevated Expressway',
    description: 'A futuristic NYC-inspired city with skyscrapers, elevated highways, illuminated billboards, neon signage, and reflective nighttime roads.',
    featureTags: ['URBAN EXPRESSWAYS', 'SKYLINE VIEWS', 'NEON LIGHTS'],
    mainImage: '/tracks/neon-city.jpg',
    thumbnails: [
      '/tracks/nc-thumb-1.jpg',
      '/tracks/nc-thumb-2.jpg',
      '/tracks/nc-thumb-3.jpg',
      '/tracks/nc-thumb-4.jpg'
    ],
    svgPath: 'M 24 24 L 76 24 C 84 24, 86 32, 86 44 C 86 56, 76 56, 76 68 C 76 80, 86 80, 86 92 C 86 102, 80 104, 68 104 L 32 104 C 20 104, 16 98, 16 86 L 16 42 C 16 28, 20 24, 24 24 Z',
    gpsWaypoints: [
      { lat: 40.7040, lng: -74.0160, name: 'Battery Park Elevated Artery', turn: 'North on West Side Highway', elev: 15 },
      { lat: 40.7110, lng: -74.0130, name: 'World Trade Center Flyover', turn: 'Hold Express Center Lane', elev: 28 },
      { lat: 40.7200, lng: -74.0100, name: 'Tribeca High-Line Overpass', turn: 'Gentle Sweep along Hudson', elev: 35 },
      { lat: 40.7310, lng: -74.0080, name: 'Meatpacking Cyber Viaduct', turn: 'Sweep Right into Neon Corridor', elev: 32 },
      { lat: 40.7450, lng: -74.0030, name: 'Hudson Yards Cyber Portal', turn: 'Straight past illuminated Towers', elev: 42 },
      { lat: 40.7580, lng: -73.9855, name: 'Times Square Elevated Spire', turn: 'Turn Right onto 42nd Loop', elev: 48 },
      { lat: 40.7300, lng: -73.9750, name: 'FDR Midtown Flyover', turn: 'South along River Boulevard', elev: 25 },
      { lat: 40.7040, lng: -74.0160, name: 'Battery Park Cyber Finish', turn: 'Final Supersonic Neon Sprint', elev: 15 }
    ]
  },

  // --- 05 CHENNAI — MARINA DRIVE (Reference Image Quadrant 5) ---
  {
    id: 'chennai-circuit',
    circuitNumber: '05',
    name: 'CHENNAI',
    subtitle: 'Marina drive · Coastal highways · Iconic landmarks',
    difficulty: 'Sweeping Coastal',
    distanceKm: 11.2,
    elevationM: 30,
    laps: 2,
    isLocked: false,
    skyTheme: 'chennai',
    accentColor: '#fb923c',
    skyColorTop: '#162238',
    skyColorBottom: '#ea580c',
    roadColor: '#171a24',
    fogColor: '#2c1a24',
    fogDensity: 0.0020,
    ambientLight: '#fed7aa',
    turns: 'Marina Sweepers',
    locationName: 'Marina Beach, Chennai, India',
    gpsCenter: [13.0535, 80.2825],
    gpsZoom: 14,
    primaryRoad: 'Kamarajar Salai (Marina Beach Road)',
    description: 'A wide coastal expressway along Marina Beach, historic Indo-Saracenic red-brick clock tower, swaying palms, Bay of Bengal sunset, and golden ocean reflections.',
    featureTags: ['COASTAL ROADS', 'CITY LANDMARKS', 'BEACHFRONT VIEWS'],
    mainImage: '/tracks/chennai-circuit.jpg',
    thumbnails: [
      '/tracks/ch-thumb-1.jpg',
      '/tracks/ch-thumb-2.jpg',
      '/tracks/ch-thumb-3.jpg',
      '/tracks/ch-thumb-4.jpg'
    ],
    svgPath: 'M 25 35 C 35 20, 75 16, 85 30 C 95 44, 90 70, 85 92 C 80 106, 60 110, 42 104 C 28 98, 22 85, 26 70 C 30 55, 18 45, 25 35 Z',
    gpsWaypoints: [
      { lat: 13.0340, lng: 80.2780, name: 'Santhome Cathedral Straight', turn: 'Head North on Kamarajar Salai', elev: 18 },
      { lat: 13.0425, lng: 80.2805, name: 'Marina Beach Lighthouse', turn: 'Coastal Sweeper past Lighthouse', elev: 14 },
      { lat: 13.0495, lng: 80.2820, name: 'Kamarajar Salai Promenade', turn: 'Straight alongside Golden Sands', elev: 12 },
      { lat: 13.0560, lng: 80.2835, name: 'Dr Annie Besant Memorial', turn: 'Hold Seaside Express Lane', elev: 10 },
      { lat: 13.0635, lng: 80.2850, name: 'Triumph of Labour Memorial', turn: 'Approach Napier Bridge Curves', elev: 12 },
      { lat: 13.0695, lng: 80.2865, name: 'Napier Bridge / Cooum River', turn: 'Cross Napier Bridge North Arc', elev: 16 },
      { lat: 13.0725, lng: 80.2840, name: 'Madras University Heritage Arc', turn: 'Loop South toward Marina Beach', elev: 15 },
      { lat: 13.0340, lng: 80.2780, name: 'Marina Beach Finish Line', turn: 'Bay of Bengal Finish Sprint', elev: 18 }
    ]
  },

  // --- 06 NEW DELHI — RAJPATH CIRCUIT (Reference Image Quadrant 6) ---
  {
    id: 'delhi-circuit',
    circuitNumber: '06',
    name: 'NEW DELHI',
    subtitle: 'Rajpath circuit · Grand avenues · Historic landmarks',
    difficulty: 'Ceremonial Sprint',
    distanceKm: 10.5,
    elevationM: 50,
    laps: 2,
    isLocked: false,
    skyTheme: 'delhi',
    accentColor: '#f59e0b',
    skyColorTop: '#080c1e',
    skyColorBottom: '#2b123a',
    roadColor: '#090c14',
    fogColor: '#160e28',
    fogDensity: 0.0018,
    ambientLight: '#fde047',
    turns: 'Hexagon Sprints',
    locationName: 'New Delhi, India',
    gpsCenter: [28.6139, 77.2185],
    gpsZoom: 15,
    primaryRoad: 'Kartavya Path (Rajpath)',
    description: 'Ceremonial avenues of Kartavya Path, towering India Gate landmark ahead, illuminated Rashtrapati Bhavan dome, water fountains, and rain-slicked twilight road reflections in amber and midnight blue.',
    featureTags: ['GRAND AVENUES', 'HISTORIC LANDMARKS', 'CITYSCAPE'],
    mainImage: '/tracks/delhi-circuit.jpg',
    thumbnails: [
      '/tracks/dl-thumb-1.jpg',
      '/tracks/dl-thumb-2.jpg',
      '/tracks/dl-thumb-3.jpg',
      '/tracks/dl-thumb-4.jpg'
    ],
    svgPath: 'M 50 16 C 62 16, 75 25, 78 40 C 80 55, 72 65, 82 82 C 88 92, 78 106, 62 105 C 50 104, 45 92, 38 92 C 30 92, 22 104, 18 96 C 14 86, 22 70, 24 55 C 26 40, 38 16, 50 16 Z',
    gpsWaypoints: [
      { lat: 28.6143, lng: 77.1996, name: 'Rashtrapati Bhavan Forecourt', turn: 'Head East on Vijay Chowk', elev: 62 },
      { lat: 28.6139, lng: 77.2088, name: 'Vijay Chowk Plaza', turn: 'Straight onto Kartavya Path', elev: 58 },
      { lat: 28.6134, lng: 77.2150, name: 'Rafi Marg Intersection', turn: 'Continue East on Kartavya Path', elev: 54 },
      { lat: 28.6130, lng: 77.2215, name: 'Janpath Junction', turn: 'Hold central ceremonial lane', elev: 50 },
      { lat: 28.6129, lng: 77.2260, name: 'Man Singh Road Crossing', turn: 'Approach India Gate Circle', elev: 48 },
      { lat: 28.6129, lng: 77.2295, name: 'India Gate C-Hexagon', turn: 'Sweep clockwise around Arch', elev: 46 },
      { lat: 28.6148, lng: 77.2315, name: 'National War Memorial Canopy', turn: 'Enter C-Hexagon North Arc', elev: 46 },
      { lat: 28.6162, lng: 77.2268, name: 'Kasturba Gandhi Marg Turn', turn: 'Sweep West toward Raisina Hill', elev: 48 },
      { lat: 28.6143, lng: 77.2088, name: 'North Block Avenue', turn: 'Approach Grand Finish Gantry', elev: 56 },
      { lat: 28.6143, lng: 77.1996, name: 'Rashtrapati Bhavan Finish Line', turn: 'Finish Line Sprint', elev: 62 }
    ]
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
    locationName: 'Hyderabad, Telangana, India',
    gpsCenter: [17.4244, 78.4735],
    gpsZoom: 14,
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
    locationName: 'Bengaluru, Karnataka, India',
    gpsCenter: [12.8465, 77.6740],
    gpsZoom: 14,
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
    locationName: 'Mumbai, Maharashtra, India',
    gpsCenter: [19.0330, 72.8180],
    gpsZoom: 14,
    mainImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
    description: 'An iconic 8-lane ocean causeway bathed in twilight reflections and monsoon sea spray. In engineering development.'
  }
];

// Helper to compute bearing in degrees between two lat/lng points
export const calculateBearing = (startLat, startLng, endLat, endLng) => {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const endLatRad = (endLat * Math.PI) / 180;
  const endLngRad = (endLng * Math.PI) / 180;
  const dLng = endLngRad - startLngRad;
  const y = Math.sin(dLng) * Math.cos(endLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(endLatRad) -
    Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(dLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
};

// Continuous GPS interpolation along authentic track waypoints
export const getTrackGpsState = (track, progress = 0) => {
  if (!track || !track.gpsWaypoints || track.gpsWaypoints.length < 2) {
    return {
      lat: 28.6139,
      lng: 77.2185,
      bearing: 90,
      currentStreet: track?.name || 'Grand Prix Circuit',
      nextTurn: 'Continue on course',
      distToTurnM: 250,
      elevationM: track?.elevationM || 100,
      coordinates: []
    };
  }

  const waypoints = track.gpsWaypoints;
  const numSegments = waypoints.length - 1;
  const normProg = Math.max(0, Math.min(0.9999, progress % 1));
  const segmentProgFloat = normProg * numSegments;
  const segIndex = Math.min(numSegments - 1, Math.floor(segmentProgFloat));
  const localT = segmentProgFloat - segIndex;

  const p1 = waypoints[segIndex];
  const p2 = waypoints[segIndex + 1] || waypoints[segIndex];

  // Linear interpolation between waypoints
  const lat = p1.lat + (p2.lat - p1.lat) * localT;
  const lng = p1.lng + (p2.lng - p1.lng) * localT;

  // Bearing
  const bearing = calculateBearing(p1.lat, p1.lng, p2.lat, p2.lng);

  // Elevation
  const elev1 = p1.elev || track.elevationM || 50;
  const elev2 = p2.elev || track.elevationM || 50;
  const elevationM = Math.round(elev1 + (elev2 - elev1) * localT);

  // Remaining distance in current segment
  const distToTurnM = Math.max(20, Math.round((1 - localT) * 450));

  return {
    lat,
    lng,
    bearing,
    currentStreet: p1.name,
    nextTurn: p1.turn || 'Follow route',
    distToTurnM,
    elevationM,
    coordinates: waypoints.map(w => [w.lat, w.lng])
  };
};

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

