// Vehicle Definitions for Meanwhile Garage

export const VEHICLES = [
  {
    id: 'vortex',
    name: 'Vortex',
    category: 'GT Grand Tourer',
    tagline: 'Balanced. Reliable. A classic for a reason.',
    description: 'A rear-wheel-drive GT coupe engineered with a low center of gravity and forgiving steering geometry. The quintessential driver’s companion.',
    speed: 78,
    acceleration: 82,
    handling: 85,
    topSpeedKmh: 285,
    zeroToHundred: 3.4,
    weightKg: 1380,
    price: 0,
    isUnlocked: true,
    defaultColor: '#f8fafc',
    palette: [
      { name: 'Alpine White', hex: '#f8fafc' },
      { name: 'Sunset Crimson', hex: '#ef4444' },
      { name: 'Midnight Navy', hex: '#1e3a8a' },
      { name: 'Royal Lavender', hex: '#8b5cf6' },
      { name: 'Stealth Slate', hex: '#1e293b' },
      { name: 'Amber Gold', hex: '#f59e0b' },
      { name: 'Verdant Mint', hex: '#10b981' },
    ]
  },
  {
    id: 'apex-horizon',
    name: 'Apex Horizon',
    category: 'Hypercar',
    tagline: 'Carved by the wind for boundless top end.',
    description: 'Active aero flaps and a carbon monocoque chassis tuned to slice through air at sustained triple-digit typing velocities.',
    speed: 95,
    acceleration: 78,
    handling: 80,
    topSpeedKmh: 340,
    zeroToHundred: 2.8,
    weightKg: 1240,
    price: 3200,
    isUnlocked: true,
    defaultColor: '#ef4444',
    palette: [
      { name: 'Rosso Corsa', hex: '#ef4444' },
      { name: 'Pure Chalk', hex: '#f8fafc' },
      { name: 'Speed Yellow', hex: '#eab308' },
      { name: 'Carbon Black', hex: '#0f172a' },
      { name: 'Cyber Violet', hex: '#a855f7' }
    ]
  },
  {
    id: 'phantom-r',
    name: 'Phantom R',
    category: 'Twin-Turbo Track Weapon',
    tagline: 'Relentless torque on every straightaway.',
    description: 'All-wheel traction and violent low-end spool that translates sudden typing burst surges into instantaneous asphalt bite.',
    speed: 88,
    acceleration: 94,
    handling: 84,
    topSpeedKmh: 315,
    zeroToHundred: 2.5,
    weightKg: 1420,
    price: 4500,
    isUnlocked: true,
    defaultColor: '#38bdf8',
    palette: [
      { name: 'Laguna Cyan', hex: '#38bdf8' },
      { name: 'Ghost Silver', hex: '#e2e8f0' },
      { name: 'Midnight Onyx', hex: '#090d16' },
      { name: 'Solar Orange', hex: '#f97316' }
    ]
  },
  {
    id: 'cyber-drift',
    name: 'Cyber Drift',
    category: 'Electric Prototype',
    tagline: 'Instant torque and telepathic steering.',
    description: 'Quad-motor independent vectoring that rotates the car gracefully around any apex while whispering into the twilight.',
    speed: 84,
    acceleration: 89,
    handling: 96,
    topSpeedKmh: 295,
    zeroToHundred: 2.4,
    weightKg: 1350,
    price: 6000,
    isUnlocked: true,
    defaultColor: '#8b5cf6',
    palette: [
      { name: 'Neon Lavender', hex: '#8b5cf6' },
      { name: 'Matrix Emerald', hex: '#10b981' },
      { name: 'Ultraviolet', hex: '#6366f1' },
      { name: 'Pearl Frost', hex: '#f1f5f9' }
    ]
  }
];

export const getVehicleById = (id) => VEHICLES.find(v => v.id === id) || VEHICLES[0];
