import { Passage } from './types.js';

export const PASSAGES: Passage[] = [
  {
    id: 'tokyo-shuto',
    title: 'Midnight Expressway',
    category: 'Cyberpunk Racing',
    difficulty: 'medium',
    text: 'Rain slicks the elevated highway as neon reflections streak across carbon fiber bodywork. At two hundred miles per hour through the heart of Tokyo, the blur of brake lights turns the night into a ribbon of crimson and electric cyan.',
    author: 'Veloce Archives'
  },
  {
    id: 'apex-cornering',
    title: 'The Perfect Apex',
    category: 'Racing Technique',
    difficulty: 'easy',
    text: 'Brake in a straight line, trail smoothly toward the geometric apex, and unleash full throttle as the steering unwinds toward the outer rumble strip.',
    author: 'Telemetry Masterclass'
  },
  {
    id: 'swiss-pass',
    title: 'Alpine Ascent',
    category: 'Mountain Pass',
    difficulty: 'medium',
    text: 'Hairpin corners carve through granite cliffs while alpine pine trees stand frozen under crisp morning sun. Elevation climbs rapidly as the twin turbochargers spool against the thin mountain air.',
    author: 'Alpine Rally Journal'
  },
  {
    id: 'monaco-precision',
    title: 'Monaco Street Symphony',
    category: 'Grand Prix',
    difficulty: 'hard',
    text: 'Brushing steel barriers with millimetric precision, downshifting through the tunnel echo, tires screaming for grip against the harbor marina chicane.',
    author: 'Riviera Grand Prix'
  },
  {
    id: 'dubai-sunset',
    title: 'Desert Mirage',
    category: 'Hypercar Sprint',
    difficulty: 'medium',
    text: 'Golden desert sands flank the glass towers of the oasis metropolis. The aerodynamic diffuser seals the underbody to asphalt as heat mirages dance across the horizon.',
    author: 'Emirates Speed Record'
  },
  {
    id: 'type-speed',
    title: 'Kinetic Flow State',
    category: 'Psychology of Speed',
    difficulty: 'hard',
    text: 'When vision narrows down the endless asphalt straight, conscious thought vanishes. Hands dance effortlessly across the keys, translating pure instinct into raw mechanical acceleration.',
    author: 'Esports Racing Federation'
  },
  {
    id: 'turbo-spool',
    title: 'Boost Pressure',
    category: 'Engineering',
    difficulty: 'easy',
    text: 'The wastegate snaps shut and exhaust pressure spins the ceramic turbine up to one hundred thousand revolutions per minute.',
    author: 'Motorsport Engineering'
  },
  {
    id: 'california-coast',
    title: 'Pacific Highway Drift',
    category: 'Coastal Highway',
    difficulty: 'medium',
    text: 'Ocean breezes carry the scent of salt and eucalyptus as the sun dips below the Pacific ocean. The road dips and swoops along jagged cliffs in rhythmic high speed harmony.',
    author: 'Coastal Cruisers'
  }
];

export function getRandomPassage(difficulty?: 'easy' | 'medium' | 'hard'): Passage {
  const filtered = difficulty ? PASSAGES.filter(p => p.difficulty === difficulty) : PASSAGES;
  const list = filtered.length > 0 ? filtered : PASSAGES;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}
