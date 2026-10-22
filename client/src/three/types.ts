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
  theme: 'tokyo' | 'swiss' | 'dubai';
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
