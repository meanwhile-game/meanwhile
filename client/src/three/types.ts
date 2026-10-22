export type PaintFinishType = 'gloss' | 'matte' | 'metallic' | 'carbon';
export type LiveryStyle = 'clean' | 'stripes' | 'cyber' | 'esports';
export type SpoilerStyle = 'stock' | 'gt-wing' | 'ducktail';
export type WindowTintStyle = 'clear' | 'smoke' | 'dark-limo' | 'chameleon';
export type UnderglowMode = 'solid' | 'pulse' | 'none';

export interface VehicleCustomization {
  color: string;
  paintFinish: PaintFinishType;
  livery: LiveryStyle;
  spoilerStyle: SpoilerStyle;
  windowTint: WindowTintStyle;
  rimColor: string;
  caliperColor: string;
  underglowColor: string;
  underglowMode: UnderglowMode;
}

export const DEFAULT_VEHICLE_CUSTOMIZATIONS: Record<string, VehicleCustomization> = {
  'cyber-gt': {
    color: '#00ff87',
    paintFinish: 'gloss',
    livery: 'clean',
    spoilerStyle: 'gt-wing',
    windowTint: 'smoke',
    rimColor: '#e2e8f0',
    caliperColor: '#00ff87',
    underglowColor: '#00ff87',
    underglowMode: 'solid'
  },
  'apex-hyper': {
    color: '#00e5ff',
    paintFinish: 'metallic',
    livery: 'esports',
    spoilerStyle: 'gt-wing',
    windowTint: 'chameleon',
    rimColor: '#0f172a',
    caliperColor: '#38bdf8',
    underglowColor: '#00e5ff',
    underglowMode: 'pulse'
  },
  'phantom-bike': {
    color: '#a855f7',
    paintFinish: 'matte',
    livery: 'cyber',
    spoilerStyle: 'stock',
    windowTint: 'smoke',
    rimColor: '#0f172a',
    caliperColor: '#ef4444',
    underglowColor: '#a855f7',
    underglowMode: 'solid'
  },
  'ronin-turbo': {
    color: '#ff3366',
    paintFinish: 'gloss',
    livery: 'stripes',
    spoilerStyle: 'ducktail',
    windowTint: 'dark-limo',
    rimColor: '#d4af37',
    caliperColor: '#ef4444',
    underglowColor: '#ff0055',
    underglowMode: 'solid'
  }
};

export function getDefaultCustomization(vehicleId: string, customColor?: string): VehicleCustomization {
  const base = DEFAULT_VEHICLE_CUSTOMIZATIONS[vehicleId] || DEFAULT_VEHICLE_CUSTOMIZATIONS['cyber-gt'];
  return {
    ...base,
    color: customColor || base.color
  };
}

export interface VehicleConfig {
  id: string;
  name: string;
  type: 'supercar' | 'hypercar' | 'motorcycle' | 'tuner';
  description: string;
  topSpeedKmh: number;
  accelerationRating: number;
  unlockedByDefault: boolean;
  unlockLevel: number;
  defaultColor: string;
  colors: string[];
}

export interface TrackConfig {
  id: string;
  name: string;
  location: string;
  lengthMeters: number;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  theme: 'tokyo' | 'swiss' | 'dubai' | 'chennai' | 'hyderabad' | 'buddh' | 'monaco' | 'silverstone';
  skyColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  ambientLightColor: string;
  sunColor: string;
  sunPosition: [number, number, number];
  roadColor: string;
  curbColor: string;
  neonColor: string;
}

export const VEHICLES: VehicleConfig[] = [
  {
    id: 'cyber-gt',
    name: 'Cyber GT-R',
    type: 'supercar',
    description: 'Twin-turbo hybrid supercar engineered for high-speed night sprints.',
    topSpeedKmh: 345,
    accelerationRating: 9.4,
    unlockedByDefault: true,
    unlockLevel: 1,
    defaultColor: '#00ff87',
    colors: ['#00ff87', '#00e5ff', '#ff3366', '#ffaa00', '#a855f7', '#f8fafc', '#1e293b']
  },
  {
    id: 'apex-hyper',
    name: 'Apex Hyperion',
    type: 'hypercar',
    description: 'Track-focused prototype hypercar with active aerodynamics and extreme downforce.',
    topSpeedKmh: 385,
    accelerationRating: 9.8,
    unlockedByDefault: true,
    unlockLevel: 3,
    defaultColor: '#00e5ff',
    colors: ['#00e5ff', '#00ff87', '#ff3366', '#eab308', '#ec4899', '#f8fafc', '#0f172a']
  },
  {
    id: 'phantom-bike',
    name: 'Phantom Blade 1200',
    type: 'motorcycle',
    description: 'Futuristic electric superbike with monocoque chassis and instantaneous torque.',
    topSpeedKmh: 320,
    accelerationRating: 9.7,
    unlockedByDefault: true,
    unlockLevel: 5,
    defaultColor: '#a855f7',
    colors: ['#a855f7', '#ff3366', '#00ff87', '#00e5ff', '#ffaa00', '#f8fafc', '#18181b']
  },
  {
    id: 'ronin-turbo',
    name: 'Ronin Spec-V',
    type: 'tuner',
    description: 'Iconic widebody Japanese sports coupe tuned for aggressive cornering and high boost.',
    topSpeedKmh: 330,
    accelerationRating: 9.1,
    unlockedByDefault: true,
    unlockLevel: 2,
    defaultColor: '#ff3366',
    colors: ['#ff3366', '#ffaa00', '#00ff87', '#00e5ff', '#3b82f6', '#f8fafc', '#27272a']
  }
];

export const TRACKS: TrackConfig[] = [
  // --- INDIAN CIRCUITS (PRIORITY) ---
  {
    id: 'chennai',
    name: 'Chennai Marina Coast',
    location: 'Marina Beach & Santhome High Road, Chennai, India',
    lengthMeters: 1350,
    difficulty: 'medium',
    description: 'High-speed coastal night sprint along the Bay of Bengal, featuring Marina lighthouse beacons, Napier bridge illuminated arches, and humid sea-breeze tarmac.',
    theme: 'chennai',
    skyColor: '#040b17',
    fogColor: '#07162b',
    fogNear: 45,
    fogFar: 320,
    ambientLightColor: '#0e2b47',
    sunColor: '#00f5ff',
    sunPosition: [80, 70, -100],
    roadColor: '#0f1824',
    curbColor: '#00f5ff',
    neonColor: '#38bdf8'
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad Cyber Pearl',
    location: 'HITEC City & Durgam Cheruvu Expressway, Hyderabad, India',
    lengthMeters: 1280,
    difficulty: 'medium',
    description: 'Futuristic night circuit through India\'s premier cyber hub, sweeping across the Durgam Cheruvu cable-stayed suspension bridge and glowing glass IT towers.',
    theme: 'hyderabad',
    skyColor: '#08051a',
    fogColor: '#120b2e',
    fogNear: 50,
    fogFar: 300,
    ambientLightColor: '#2b124c',
    sunColor: '#c084fc',
    sunPosition: [-60, 90, 80],
    roadColor: '#161026',
    curbColor: '#a855f7',
    neonColor: '#f43f5e'
  },
  {
    id: 'buddh',
    name: 'Buddh International Circuit',
    location: 'Yamuna Expressway, Greater Noida, India',
    lengthMeters: 1600,
    difficulty: 'hard',
    description: 'India\'s world-renowned Formula 1 Grand Prix venue! Features the iconic 1.06km parabolic back straight, banked multi-apex Turn 10-11 bowl, and FIA fabric grandstands.',
    theme: 'buddh',
    skyColor: '#131c26',
    fogColor: '#1c2836',
    fogNear: 60,
    fogFar: 380,
    ambientLightColor: '#475569',
    sunColor: '#fbbf24',
    sunPosition: [120, 110, 60],
    roadColor: '#212936',
    curbColor: '#ef4444',
    neonColor: '#f59e0b'
  },

  // --- INTERNATIONAL CIRCUITS ---
  {
    id: 'tokyo',
    name: 'Tokyo Night Run',
    location: 'Shuto Expressway, Tokyo, Japan',
    lengthMeters: 1200,
    difficulty: 'medium',
    description: 'Neon-lit elevated highway winding between glowing skyscrapers with rainy asphalt reflections.',
    theme: 'tokyo',
    skyColor: '#070913',
    fogColor: '#090d1a',
    fogNear: 40,
    fogFar: 280,
    ambientLightColor: '#1a2238',
    sunColor: '#00e5ff',
    sunPosition: [50, 100, 50],
    roadColor: '#12151f',
    curbColor: '#00ff87',
    neonColor: '#00e5ff'
  },
  {
    id: 'monaco',
    name: 'Monaco GP Harborside',
    location: 'Monte Carlo Harbor, Principality of Monaco',
    lengthMeters: 1150,
    difficulty: 'hard',
    description: 'The crown jewel of motorsport! Narrow barrier-lined harbor sweepers past superyachts, the iconic swimming pool chicane, and tunnel egress.',
    theme: 'monaco',
    skyColor: '#0a192f',
    fogColor: '#0f2744',
    fogNear: 50,
    fogFar: 300,
    ambientLightColor: '#1e3a5f',
    sunColor: '#38bdf8',
    sunPosition: [90, 80, -90],
    roadColor: '#151f2e',
    curbColor: '#ef4444',
    neonColor: '#e2e8f0'
  },
  {
    id: 'swiss',
    name: 'Swiss Alpine Pass',
    location: 'Furka Pass, Swiss Alps',
    lengthMeters: 1400,
    difficulty: 'hard',
    description: 'High-altitude mountain road flanked by towering granite peaks, pine forests, and sharp hairpin curves.',
    theme: 'swiss',
    skyColor: '#1e293b',
    fogColor: '#1e293b',
    fogNear: 60,
    fogFar: 350,
    ambientLightColor: '#64748b',
    sunColor: '#fef08a',
    sunPosition: [120, 150, 80],
    roadColor: '#2b313d',
    curbColor: '#ef4444',
    neonColor: '#f59e0b'
  },
  {
    id: 'silverstone',
    name: 'Silverstone Grand Prix',
    location: 'Northamptonshire, United Kingdom',
    lengthMeters: 1550,
    difficulty: 'hard',
    description: 'The historic home of Formula 1! Legendary ultra-high-speed sweepers through Copse, Maggotts, Becketts, and the Wellington Straight.',
    theme: 'silverstone',
    skyColor: '#1e293b',
    fogColor: '#334155',
    fogNear: 55,
    fogFar: 360,
    ambientLightColor: '#64748b',
    sunColor: '#93c5fd',
    sunPosition: [100, 120, -70],
    roadColor: '#242b38',
    curbColor: '#ef4444',
    neonColor: '#60a5fa'
  },
  {
    id: 'dubai',
    name: 'Dubai Grand Circuit',
    location: 'Desert Perimeter, Dubai, UAE',
    lengthMeters: 1100,
    difficulty: 'easy',
    description: 'High-speed coastal desert sweepers with sunset horizon, glass megastructures, and glowing architectural pylons.',
    theme: 'dubai',
    skyColor: '#1c130d',
    fogColor: '#291b12',
    fogNear: 50,
    fogFar: 300,
    ambientLightColor: '#451a03',
    sunColor: '#fb923c',
    sunPosition: [-100, 60, -80],
    roadColor: '#1a1816',
    curbColor: '#f97316',
    neonColor: '#fbbf24'
  }
];

