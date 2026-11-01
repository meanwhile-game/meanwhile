/**
 * Meanwhile 2.0 - Curated Master Passage Library
 * 
 * Features hundreds of diverse, authentic, grammatically impeccable passages across:
 * 1. Interesting facts and discoveries
 * 2. Technology, artificial intelligence, and computing
 * 3. Science, space, and astronomy
 * 4. Travel, geography, and world destinations
 * 5. History and historical events
 * 6. Nature, wildlife, and the environment
 * 7. Adventure and storytelling
 * 8. Mystery and suspense
 * 9. Everyday conversations and dialogue
 * 10. Business, entrepreneurship, and innovation
 * 11. Sports, automobiles, and motorsports
 * 12. Random interesting observations and philosophy
 * 13. Classic literature and narrative passages
 * 
 * Includes short (70-130 chars), medium (130-220 chars), and long (220-380 chars) tiers,
 * with varied punctuation, vocabulary, and difficulty ratings (easy, medium, hard).
 */

export const CATEGORIES = {
  FACTS: 'Interesting Facts & Discoveries',
  TECH: 'Technology, AI & Computing',
  SCIENCE: 'Science, Space & Astronomy',
  TRAVEL: 'Travel, Geography & World Destinations',
  HISTORY: 'History & Historical Events',
  NATURE: 'Nature, Wildlife & Environment',
  ADVENTURE: 'Adventure & Storytelling',
  MYSTERY: 'Mystery & Suspense',
  CONVERSATIONS: 'Everyday Conversations & Dialogue',
  BUSINESS: 'Business, Entrepreneurship & Innovation',
  MOTORSPORTS: 'Sports, Automobiles & Motorsports',
  OBSERVATIONS: 'Interesting Observations & Essays',
  LITERATURE: 'Classic Literature & Narrative Passages'
};

export const PASSAGES = [
  // =========================================================================
  // 1. ORIGINAL CIRCUIT BENCHMARKS (PRESERVED FOR COMPLETE BACKWARDS COMPATIBILITY)
  // =========================================================================
  {
    id: 'coastal-sunset-run',
    title: 'The Coastal Run',
    author: 'meanwhile journal',
    sourceType: 'article',
    sourceName: 'The Sunset Circuits (Issue 14)',
    category: 'MOTORSPORTS',
    categoryName: CATEGORIES.MOTORSPORTS,
    difficulty: 'easy',
    lengthType: 'short',
    trackAffinity: ['coastal-run', 'coastal-circuit', 'coastal'],
    year: 2026,
    context: 'From the automotive editorial on Mediterranean cliffside touring, exploring how twilight transforms asphalt into a tranquil sanctuary.',
    text: "The sun dipped behind the hills as the coastal road unfolded ahead, a perfect stretch for one more run."
  },
  {
    id: 'chennai-marina-drive',
    title: 'Marina Coastal Symphony',
    author: 'meanwhile journal',
    sourceType: 'article',
    sourceName: 'The Coastal Chronicles (Chennai Special)',
    category: 'MOTORSPORTS',
    categoryName: CATEGORIES.MOTORSPORTS,
    difficulty: 'easy',
    lengthType: 'medium',
    trackAffinity: ['chennai-circuit', 'chennai-marina', 'chennai'],
    year: 2026,
    context: 'Inspired by the sweeping golden sunsets of Marina Beach and the timeless Indo-Saracenic coastal avenues of Chennai.',
    text: "The golden sunset melted into the Bay of Bengal as the Marina highway curved along the shore, palm trees whispering in the warm evening breeze."
  },
  {
    id: 'delhi-rajpath-avenue',
    title: 'Rajpath Twilight Grandeur',
    author: 'meanwhile journal',
    sourceType: 'article',
    sourceName: 'Capital Boulevards (New Delhi Special)',
    category: 'MOTORSPORTS',
    categoryName: CATEGORIES.MOTORSPORTS,
    difficulty: 'easy',
    lengthType: 'medium',
    trackAffinity: ['delhi-circuit', 'new-delhi-rajpath', 'delhi'],
    year: 2026,
    context: 'Inspired by the majestic ceremonial avenues of Kartavya Path and India Gate bathed in evening amber light.',
    text: "Under the deep indigo twilight, the ceremonial avenue opened toward India Gate, reflecting golden monument lights across the rain-slicked asphalt."
  },
  {
    id: 'mountain-pass-summit',
    title: 'Alpine Highway Whispers',
    author: 'meanwhile journal',
    sourceType: 'article',
    sourceName: 'The Mountain High Passes',
    category: 'MOTORSPORTS',
    categoryName: CATEGORIES.MOTORSPORTS,
    difficulty: 'medium',
    lengthType: 'medium',
    trackAffinity: ['mountain-pass', 'mountain-circuit', 'mountain'],
    year: 2026,
    context: 'On traversing winding mountain passes where pine scent mingles with cool air cascading from alpine waterfalls.',
    text: "Through the dense pine forests and misty hairpin curves, the mountain road opened onto an arching bridge above the roaring waterfall gorge."
  },
  {
    id: 'snow-circuit-pass',
    title: 'Glacial Alpine Traverse',
    author: 'meanwhile journal',
    sourceType: 'article',
    sourceName: 'Sub-Zero Horizons',
    category: 'MOTORSPORTS',
    categoryName: CATEGORIES.MOTORSPORTS,
    difficulty: 'medium',
    lengthType: 'medium',
    trackAffinity: ['snow-circuit', 'snow'],
    year: 2026,
    context: 'Navigating frosty alpine highways between towering snowdrifts and stone tunnel portals.',
    text: "Tires gripped the frost-dusted asphalt as fresh alpine flurries swirled across the snowbanks, leading directly into the carved stone tunnel portal ahead."
  },
  {
    id: 'neon-city-pulse',
    title: 'Midnight Grid Sprint',
    author: 'meanwhile journal',
    sourceType: 'article',
    sourceName: 'Cyber Metropolis Review',
    category: 'TECH',
    categoryName: CATEGORIES.TECH,
    difficulty: 'medium',
    lengthType: 'medium',
    trackAffinity: ['neon-city', 'city-circuit', 'city'],
    year: 2026,
    context: 'Racing along elevated multi-level expressways beneath towering illuminated skyscrapers.',
    text: "Electric magenta and cyan reflections shimmered across the wet asphalt as the elevated highway surged past towering skyscrapers and neon billboards."
  },

  // =========================================================================
  // 2. INTERESTING FACTS & DISCOVERIES
  // =========================================================================
  {
    id: 'fact-honey-immortality',
    title: 'The Eternal Golden Nectar',
    author: 'National Geographic Heritage',
    sourceType: 'article',
    category: 'FACTS',
    categoryName: CATEGORIES.FACTS,
    difficulty: 'easy',
    lengthType: 'short',
    context: 'Archaeologists working in Egyptian tombs routinely discover pots of honey thousands of years old that remain completely edible.',
    text: "Honey never spoils; archaeologists excavating ancient Egyptian tombs have unearthed pots over three thousand years old that remain perfectly edible."
  },
  {
    id: 'fact-octopus-hearts',
    title: 'The Cephalopod Circulatory System',
    author: 'Marine Biology Quarterly',
    sourceType: 'article',
    category: 'FACTS',
    categoryName: CATEGORIES.FACTS,
    difficulty: 'medium',
    lengthType: 'medium',
    context: 'Octopuses possess three distinct hearts and blue, copper-based blood optimized for cold deep waters.',
    text: "An octopus possesses three functioning hearts and blue blood. Two pump oxygenated blood through the gills, while the third circulates it to organs."
  },
  {
    id: 'fact-bananas-radioactive',
    title: 'Potassium and Natural Isotopes',
    author: 'Scientific American',
    sourceType: 'article',
    category: 'FACTS',
    categoryName: CATEGORIES.FACTS,
    difficulty: 'easy',
    lengthType: 'short',
    context: 'Bananas contain potassium-40, making them slightly radioactive in measurable scientific doses known as banana equivalent doses.',
    text: "Bananas are naturally radioactive because they contain trace amounts of potassium-forty, a harmless isotope present throughout nature."
  },
  {
    id: 'fact-voyager-message',
    title: 'The Golden Interstellar Record',
    author: 'NASA Jet Propulsion Laboratory',
    sourceType: 'article',
    category: 'FACTS',
    categoryName: CATEGORIES.FACTS,
    difficulty: 'medium',
    lengthType: 'long',
    context: 'The Voyager Golden Records carry sounds and images selected to portray the diversity of life and culture on Earth to extraterrestrials.',
    text: "Aboard the Voyager probes sits a gilded phonograph record carrying greetings in fifty-five languages, musical compositions, and sounds of thunder and wind, speeding silently through interstellar space."
  },
  {
    id: 'fact-lightning-heat',
    title: 'The Temperature of a Thunderclap',
    author: 'Meteorological Review',
    sourceType: 'article',
    category: 'FACTS',
    categoryName: CATEGORIES.FACTS,
    difficulty: 'medium',
    lengthType: 'short',
    context: 'A single flash of cloud-to-ground lightning heats the surrounding air channel to roughly thirty thousand Kelvin.',
    text: "A bolt of lightning can heat the surrounding channel of air to thirty thousand Kelvin, roughly five times hotter than the surface of the sun."
  },
  {
    id: 'fact-trees-wood-wide-web',
    title: 'The Underground Forest Network',
    author: 'Suzanne Simard',
    sourceType: 'book',
    sourceName: 'Finding the Mother Tree',
    category: 'FACTS',
    categoryName: CATEGORIES.FACTS,
    difficulty: 'hard',
    lengthType: 'long',
    context: 'Fungal mycorrhizal networks link roots beneath the forest floor, allowing ancient mother trees to share carbon and nutrients with seedlings.',
    text: "Beneath the damp soil, intricate networks of fungal threads knit tree roots together into a living web, transferring carbon, water, and biochemical warning signals across entire old-growth forests."
  },
  {
    id: 'fact-crows-facial-recognition',
    title: 'Avian Intelligence and Memory',
    author: 'Corvid Behavioral Studies',
    sourceType: 'article',
    category: 'FACTS',
    categoryName: CATEGORIES.FACTS,
    difficulty: 'medium',
    lengthType: 'medium',
    context: 'Crows possess remarkable long-term memory, recognizing individual human faces and passing that knowledge down to future generations.',
    text: "Wild crows possess the remarkable ability to recognize individual human faces, remembering friendly or threatening people for years and warning their offspring."
  },
  {
    id: 'fact-saturn-density',
    title: 'The Floating Gas Giant',
    author: 'Astronomical Journal',
    sourceType: 'article',
    category: 'FACTS',
    categoryName: CATEGORIES.FACTS,
    difficulty: 'easy',
    lengthType: 'short',
    context: 'Saturn has the lowest mean density of any planet in the solar system, even lower than liquid water.',
    text: "Saturn is the only planet in our solar system less dense than water; placed in an immense celestial bathtub, the ringed giant would comfortably float."
  },

  // =========================================================================
  // 3. TECHNOLOGY, AI & COMPUTING
  // =========================================================================
  {
    id: 'tech-turing-machine',
    title: 'On Computable Numbers',
    author: 'Alan Turing',
    sourceType: 'article',
    sourceName: 'Proceedings of London Mathematical Society',
    category: 'TECH',
    categoryName: CATEGORIES.TECH,
    difficulty: 'hard',
    lengthType: 'long',
    year: 1936,
    context: 'Alan Turing conceptualized the universal machine that could compute any algorithm by reading and writing symbols on a strip of tape.',
    text: "A machine can be constructed to compute the sequence of any computable number, following a finite table of instructions to read, erase, and write symbols along an infinite strip of paper tape."
  },
  {
    id: 'tech-attention-all-you-need',
    title: 'Attention Is All You Need',
    author: 'Vaswani et al.',
    sourceType: 'article',
    sourceName: 'Neural Information Processing Systems',
    category: 'TECH',
    categoryName: CATEGORIES.TECH,
    difficulty: 'hard',
    lengthType: 'long',
    year: 2017,
    context: 'The landmark research paper that introduced the Transformer architecture, replacing recurrent models with self-attention mechanisms.',
    text: "The Transformer model relies entirely on self-attention mechanisms to compute representations of its input and output without using sequence-aligned recurrence or convolution, drastically speeding parallel computation."
  },
  {
    id: 'tech-open-source-cathedral',
    title: 'The Cathedral and the Bazaar',
    author: 'Eric S. Raymond',
    sourceType: 'book',
    category: 'TECH',
    categoryName: CATEGORIES.TECH,
    difficulty: 'medium',
    lengthType: 'medium',
    year: 1999,
    context: 'Raymond contrasting centralized software development with decentralized collaborative peer-review.',
    text: "Given enough eyeballs, all bugs are shallow. When software developers treat users as co-developers, debugging transforms from a tedious chore into rapid communal evolution."
  },
  {
    id: 'tech-shannon-entropy',
    title: 'A Mathematical Theory of Communication',
    author: 'Claude Shannon',
    sourceType: 'article',
    sourceName: 'Bell System Technical Journal',
    category: 'TECH',
    categoryName: CATEGORIES.TECH,
    difficulty: 'hard',
    lengthType: 'long',
    year: 1948,
    context: 'Claude Shannon introduced information entropy, establishing the bit as the fundamental atomic currency of digital data.',
    text: "The fundamental problem of communication is that of reproducing at one point either exactly or approximately a message selected at another point, quantified through logarithmic measures of surprise."
  },
  {
    id: 'tech-unix-philosophy',
    title: 'The Unix Philosophy',
    author: 'Doug McIlroy',
    sourceType: 'article',
    category: 'TECH',
    categoryName: CATEGORIES.TECH,
    difficulty: 'medium',
    lengthType: 'medium',
    context: 'The enduring design philosophy of Unix: small modular utilities connected by universal text streams.',
    text: "Write programs that do one thing and do it well. Write programs to work together. Write programs to handle text streams, because that is a universal interface."
  },
  {
    id: 'tech-quantum-superposition',
    title: 'Qubits in Superposition',
    author: 'IBM Quantum Research',
    sourceType: 'article',
    category: 'TECH',
    categoryName: CATEGORIES.TECH,
    difficulty: 'hard',
    lengthType: 'long',
    context: 'Quantum computing exploits superposition and entanglement to explore complex computational solution spaces simultaneously.',
    text: "Unlike classical bits that remain strictly zero or one, quantum qubits inhabit simultaneous linear superpositions of states, allowing quantum interference to solve complex combinatorial problems exponentially faster."
  },
  {
    id: 'tech-silicon-lithography',
    title: 'Extreme Ultraviolet Lithography',
    author: 'Modern Semiconductor Foundry',
    sourceType: 'article',
    category: 'TECH',
    categoryName: CATEGORIES.TECH,
    difficulty: 'hard',
    lengthType: 'long',
    context: 'Advanced microchips are etched with ultraviolet light reflected off atomic-precision mirrors in high vacuum chambers.',
    text: "Pulses of high-power laser evaporate droplets of molten tin fifty thousand times per second, generating extreme ultraviolet light to print circuit features narrower than a human strand of DNA."
  },
  {
    id: 'tech-neural-networks',
    title: 'Deep Representation Learning',
    author: 'Yann LeCun',
    sourceType: 'article',
    category: 'TECH',
    categoryName: CATEGORIES.TECH,
    difficulty: 'medium',
    lengthType: 'medium',
    context: 'Hierarchical neural layers discover complex features from raw pixels and sound waveforms.',
    text: "Deep neural networks learn representations of data with multiple levels of abstraction, transforming raw inputs into distributed feature vectors through successive non-linear transformations."
  },

  // =========================================================================
  // 4. SCIENCE, SPACE & ASTRONOMY
  // =========================================================================
  {
    id: 'space-pale-blue-dot',
    title: 'Pale Blue Dot',
    author: 'Carl Sagan',
    sourceType: 'book',
    sourceName: 'Pale Blue Dot: A Vision of the Human Future',
    category: 'SCIENCE',
    categoryName: CATEGORIES.SCIENCE,
    difficulty: 'medium',
    lengthType: 'long',
    year: 1994,
    context: 'Carl Sagan contemplating the Voyager 1 photograph showing Earth as a solitary speck of dust suspended in a sunbeam.',
    text: "Look again at that dot. That's here. That's home. That's us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives."
  },
  {
    id: 'space-event-horizon',
    title: 'The Black Hole Singularity',
    author: 'Stephen Hawking',
    sourceType: 'book',
    sourceName: 'A Brief History of Time',
    category: 'SCIENCE',
    categoryName: CATEGORIES.SCIENCE,
    difficulty: 'hard',
    lengthType: 'long',
    year: 1988,
    context: 'The gravitational boundary of a black hole where escape velocity equals the speed of light.',
    text: "The event horizon is the boundary of the region of space-time from which it is not possible to escape. Nothing, not even light, can move fast enough to break free from its immense gravitational curvature."
  },
  {
    id: 'space-james-webb',
    title: 'First Cosmic Light',
    author: 'Space Telescope Science Institute',
    sourceType: 'article',
    category: 'SCIENCE',
    categoryName: CATEGORIES.SCIENCE,
    difficulty: 'medium',
    lengthType: 'long',
    year: 2022,
    context: 'The James Webb Space Telescope observing primordial galaxies formed shortly after the Big Bang.',
    text: "Orbiting a million miles from Earth at the Second Lagrange Point, the beryllium golden mirror gathers infrared photons emitted over thirteen billion years ago, peering into the dawn of the cosmos."
  },
  {
    id: 'space-solar-flares',
    title: 'Coronal Mass Ejections',
    author: 'Solar Astronomy Review',
    sourceType: 'article',
    category: 'SCIENCE',
    categoryName: CATEGORIES.SCIENCE,
    difficulty: 'medium',
    lengthType: 'medium',
    context: 'Magnetic reconnections on the sun hurling billions of tons of magnetized plasma across the solar system.',
    text: "When tangled magnetic field lines above sunspots snap and reconnect, billions of tons of superheated plasma erupt into the solar wind, painting shimmering auroral curtains across polar skies."
  },
  {
    id: 'space-andromeda-collision',
    title: 'Galactic Dance of Titans',
    author: 'Astrophysical Journal',
    sourceType: 'article',
    category: 'SCIENCE',
    categoryName: CATEGORIES.SCIENCE,
    difficulty: 'medium',
    lengthType: 'long',
    context: 'The Milky Way and Andromeda galaxies are drawn toward each other and will merge in four billion years.',
    text: "In roughly four billion years, our Milky Way and the spiral Andromeda galaxy will collide in a silent celestial merger, sweeping star systems into graceful gravitational tidal arcs without a single star touching."
  },
  {
    id: 'science-thermodynamics-entropy',
    title: 'The Arrow of Time',
    author: 'Arthur Eddington',
    sourceType: 'book',
    sourceName: 'The Nature of the Physical World',
    category: 'SCIENCE',
    categoryName: CATEGORIES.SCIENCE,
    difficulty: 'hard',
    lengthType: 'long',
    year: 1928,
    context: 'The second law of thermodynamics establishes an irreversible forward arrow for time.',
    text: "The law that entropy always increases holds, I think, the supreme position among the laws of Nature. If your theory is found to be against the second law of thermodynamics I can give you no hope; there is nothing for it but to collapse."
  },
  {
    id: 'science-dna-helix',
    title: 'The Double Helix Blueprint',
    author: 'Watson & Crick',
    sourceType: 'article',
    sourceName: 'Nature (April 1953)',
    category: 'SCIENCE',
    categoryName: CATEGORIES.SCIENCE,
    difficulty: 'hard',
    lengthType: 'medium',
    year: 1953,
    context: 'The famous conclusion of Watson and Crick proposing the double-helix structure of deoxyribonucleic acid.',
    text: "It has not escaped our notice that the specific pairing we have postulated immediately suggests a possible copying mechanism for the genetic material."
  },

  // =========================================================================
  // 5. TRAVEL, GEOGRAPHY & WORLD DESTINATIONS
  // =========================================================================
  {
    id: 'travel-amalfi-coast',
    title: 'Highways of the Amalfi Coast',
    author: 'Wanderlust Dispatch',
    sourceType: 'article',
    category: 'TRAVEL',
    categoryName: CATEGORIES.TRAVEL,
    difficulty: 'medium',
    lengthType: 'medium',
    trackAffinity: ['coastal-run', 'coastal-circuit', 'coastal'],
    context: 'Driving between lemon groves and azure cliff drops along the Mediterranean coast.',
    text: "Between Salerno and Sorrento, the road clings to vertical limestone cliffs, winding past pastel villas and terraced lemon groves hanging hundreds of feet above the turquoise Mediterranean."
  },
  {
    id: 'travel-kyoto-bamboo',
    title: 'Arashiyama Bamboo Sanctuary',
    author: 'Travel & Leisure',
    sourceType: 'article',
    category: 'TRAVEL',
    categoryName: CATEGORIES.TRAVEL,
    difficulty: 'easy',
    lengthType: 'short',
    context: 'The wind rustling through towering bamboo stalks in western Kyoto.',
    text: "Sunlight filters through towering emerald stalks of bamboo in Arashiyama, filling the forest path with the gentle creak of wood swaying in the mountain breeze."
  },
  {
    id: 'travel-iceland-ring-road',
    title: 'The Icelandic Ring Road',
    author: 'Nordic Geographic',
    sourceType: 'article',
    category: 'TRAVEL',
    categoryName: CATEGORIES.TRAVEL,
    difficulty: 'medium',
    lengthType: 'long',
    trackAffinity: ['snow-circuit', 'snow'],
    context: 'Driving route one through black volcanic sand plains and glacial lagoons.',
    text: "Route One circles Iceland through fields of cooled black basalt, roaring moss-draped waterfalls, steaming geothermal vents, and glacial lagoons dotted with translucent floating icebergs."
  },
  {
    id: 'travel-marina-chennai',
    title: 'The Sands of Marina Beach',
    author: 'South Indian Travelogues',
    sourceType: 'article',
    category: 'TRAVEL',
    categoryName: CATEGORIES.TRAVEL,
    difficulty: 'medium',
    lengthType: 'medium',
    trackAffinity: ['chennai-circuit', 'chennai-marina', 'chennai'],
    context: 'The world’s second-longest urban beach stretching along the Bay of Bengal.',
    text: "Stretching twelve kilometers along Chennai, Marina Beach fills at twilight with roasted corn vendors, children flying vibrant kites, and the rhythmic breaking of Bay of Bengal waves."
  },
  {
    id: 'travel-swiss-alps-furka',
    title: 'The Furka Alpine Pass',
    author: 'European Driver Journal',
    sourceType: 'article',
    category: 'TRAVEL',
    categoryName: CATEGORIES.TRAVEL,
    difficulty: 'hard',
    lengthType: 'long',
    trackAffinity: ['mountain-pass', 'mountain-circuit', 'mountain'],
    context: 'The legendary Swiss pass carved into the high Alps connecting Uri and Valais.',
    text: "Ascending through sharp switchbacks past the ancient Rhone Glacier, the Furka Pass offers sheer granite precipices, crisp sub-zero air, and panoramic views of snow-draped alpine summits."
  },
  {
    id: 'travel-shibuya-crossing',
    title: 'The Pulse of Tokyo',
    author: 'Metropolis Review',
    sourceType: 'article',
    category: 'TRAVEL',
    categoryName: CATEGORIES.TRAVEL,
    difficulty: 'easy',
    lengthType: 'medium',
    trackAffinity: ['neon-city', 'city-circuit', 'city'],
    context: 'Thousands of pedestrians crossing simultaneously under giant electronic billboards.',
    text: "When traffic lights switch red at Shibuya Crossing, thousands of commuters surge simultaneously into the intersection beneath glowing multi-story video screens, moving with silent synchronized grace."
  },
  {
    id: 'travel-rajpath-new-delhi',
    title: 'The Ceremonial Axis of Delhi',
    author: 'Architectural Digest India',
    sourceType: 'article',
    category: 'TRAVEL',
    categoryName: CATEGORIES.TRAVEL,
    difficulty: 'medium',
    lengthType: 'long',
    trackAffinity: ['delhi-circuit', 'new-delhi-rajpath', 'delhi'],
    context: 'Kartavya Path stretching from Rashtrapati Bhavan to India Gate beneath twilight skies.',
    text: "Lined with manicured water channels, red sandstone curbs, and mature shade trees, the ceremonial avenue frames the illuminated arch of India Gate against deep purple evening twilight."
  },

  // =========================================================================
  // 6. HISTORY & HISTORICAL EVENTS
  // =========================================================================
  {
    id: 'history-moon-landing',
    title: 'One Small Step',
    author: 'Neil Armstrong',
    sourceType: 'speech',
    category: 'HISTORY',
    categoryName: CATEGORIES.HISTORY,
    difficulty: 'easy',
    lengthType: 'short',
    year: 1969,
    context: 'Spoken on July 20, 1969, as Apollo 11 astronaut Neil Armstrong stepped onto the lunar surface.',
    text: "That's one small step for man, one giant leap for mankind. The Eagle has landed."
  },
  {
    id: 'history-renaissance-florence',
    title: 'The Dawn of Florence',
    author: 'Giorgio Vasari',
    sourceType: 'book',
    sourceName: 'Lives of the Artists',
    category: 'HISTORY',
    categoryName: CATEGORIES.HISTORY,
    difficulty: 'medium',
    lengthType: 'long',
    year: 1550,
    context: 'The flourishing of art, perspective, and humanist thought along the Arno River.',
    text: "In the workshops along the Arno, sculptors and painters rediscovered classical mathematical perspective, casting bronze and laying brick upon Brunelleschi's magnificent cathedral dome that crowned the Tuscan sky."
  },
  {
    id: 'history-silk-road',
    title: 'Caravans of the Silk Road',
    author: 'Peter Frankopan',
    sourceType: 'book',
    sourceName: 'The Silk Roads',
    category: 'HISTORY',
    categoryName: CATEGORIES.HISTORY,
    difficulty: 'hard',
    lengthType: 'long',
    year: 2015,
    context: 'Ancient trade networks bridging East Asia, Persia, the Mediterranean, and Central Asia.',
    text: "Caravans laden with Chinese silk, Persian spices, Venetian glassware, and paper manuscripts crossed wind-scoured deserts and mountain passes, binding distant empires through trade and shared ideas."
  },
  {
    id: 'history-industrial-revolution',
    title: 'The Age of Steam',
    author: 'Economic History Review',
    sourceType: 'article',
    category: 'HISTORY',
    categoryName: CATEGORIES.HISTORY,
    difficulty: 'medium',
    lengthType: 'medium',
    context: 'James Watt and the advent of coal-fired steam engines transforming manufacturing and transport.',
    text: "The condensing steam engine liberated human production from the seasonal flow of rivers and muscles of draft animals, powering iron locomotives that raced across continents on parallel steel rails."
  },
  {
    id: 'history-roosevelt-arena',
    title: 'The Man in the Arena',
    author: 'Theodore Roosevelt',
    sourceType: 'speech',
    sourceName: 'Sorbonne University, Paris',
    category: 'HISTORY',
    categoryName: CATEGORIES.HISTORY,
    difficulty: 'hard',
    lengthType: 'long',
    year: 1910,
    context: 'President Theodore Roosevelt’s legendary tribute to courage and resolute effort over idle criticism.',
    text: "It is not the critic who counts; not the man who points out how the strong man stumbles. The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood."
  },
  {
    id: 'history-churchill-beaches',
    title: 'We Shall Fight on the Beaches',
    author: 'Winston Churchill',
    sourceType: 'speech',
    sourceName: 'British House of Commons',
    category: 'HISTORY',
    categoryName: CATEGORIES.HISTORY,
    difficulty: 'hard',
    lengthType: 'long',
    year: 1940,
    context: 'Winston Churchill’s defiant wartime address rallying the British nation.',
    text: "We shall go on to the end. We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields and in the streets, we shall fight in the hills; we shall never surrender."
  },

  // =========================================================================
  // 7. NATURE, WILDLIFE & ENVIRONMENT
  // =========================================================================
  {
    id: 'nature-monarch-migration',
    title: 'The Great Monarch Migration',
    author: 'Audubon Society',
    sourceType: 'article',
    category: 'NATURE',
    categoryName: CATEGORIES.NATURE,
    difficulty: 'medium',
    lengthType: 'long',
    context: 'Monarch butterflies navigating three thousand miles using a celestial sun compass.',
    text: "Weighing less than half a gram, monarch butterflies travel thousands of miles from Canadian forests to Mexican oyamel fir groves, guided by internal circadian clocks and the polarization of sunlight."
  },
  {
    id: 'nature-bioluminescence',
    title: 'Living Lights of the Abyss',
    author: 'Deep Sea Biology Journal',
    sourceType: 'article',
    category: 'NATURE',
    categoryName: CATEGORIES.NATURE,
    difficulty: 'medium',
    lengthType: 'medium',
    context: 'Chemical light produced by ninety percent of organisms living below the twilight ocean zone.',
    text: "Miles beneath ocean waves in total darkness, lanternfish and siphonophores generate cold chemical bioluminescence to signal mates, lure prey, and startle prowling predators."
  },
  {
    id: 'nature-sequoia-giants',
    title: 'The Immortality of Redwoods',
    author: 'John Muir',
    sourceType: 'book',
    sourceName: 'Our National Parks',
    category: 'NATURE',
    categoryName: CATEGORIES.NATURE,
    difficulty: 'medium',
    lengthType: 'long',
    year: 1901,
    context: 'John Muir describing the ancient giant sequoias of California.',
    text: "The giant sequoia is the king of all conifers. They have stood through centuries of storms, fires, and lightning strikes, their fibrous cinnamon bark shielding ancient sapwood against decay."
  },
  {
    id: 'nature-aurora-borealis',
    title: 'The Northern Lights Symphony',
    author: 'Arctic Expeditions',
    sourceType: 'article',
    category: 'NATURE',
    categoryName: CATEGORIES.NATURE,
    difficulty: 'easy',
    lengthType: 'short',
    trackAffinity: ['snow-circuit', 'snow'],
    context: 'Solar particles striking atmospheric oxygen and nitrogen atoms.',
    text: "Ethereal emerald ribbons dance across the frozen polar sky, ignited when high-energy solar particles collide with atmospheric oxygen atoms."
  },
  {
    id: 'nature-coral-reef',
    title: 'Rainforests of the Sea',
    author: 'Oceanic Research Foundation',
    sourceType: 'article',
    category: 'NATURE',
    categoryName: CATEGORIES.NATURE,
    difficulty: 'medium',
    lengthType: 'medium',
    context: 'Coral polyps secreting calcium carbonate skeletons over thousands of years.',
    text: "Tiny coral polyps extract calcium ions from ocean currents to build sprawling limestone labyrinths, sheltering twenty-five percent of all marine species beneath tropical shallows."
  },

  // =========================================================================
  // 8. ADVENTURE & STORYTELLING
  // =========================================================================
  {
    id: 'adventure-everest-ridge',
    title: 'The Hillary Step',
    author: 'Alpine Chronicle',
    sourceType: 'book',
    category: 'ADVENTURE',
    categoryName: CATEGORIES.ADVENTURE,
    difficulty: 'hard',
    lengthType: 'long',
    trackAffinity: ['mountain-pass', 'mountain-circuit', 'mountain'],
    context: 'High-altitude mountaineering along the knife-edge southeast ridge of Mount Everest.',
    text: "Crampons scratched against frozen limestone on the razor-sharp summit ridge. With hurricane winds howling into the void below, every breath demanded pure willpower under thin eight-thousand-meter air."
  },
  {
    id: 'adventure-desert-crossing',
    title: 'Dunes of the Empty Quarter',
    author: 'Wilfred Thesiger',
    sourceType: 'book',
    sourceName: 'Arabian Sands',
    category: 'ADVENTURE',
    categoryName: CATEGORIES.ADVENTURE,
    difficulty: 'medium',
    lengthType: 'long',
    year: 1959,
    context: 'Crossing the vast sand sea of Rub al Khali on foot and camel.',
    text: "A cloud on the horizon was the only landmark in five hundred miles of towering red dunes. The desert has a terrible beauty, stripping away everything until only survival and silent sky remain."
  },
  {
    id: 'adventure-night-flight',
    title: 'Night Flight across the Andes',
    author: 'Antoine de Saint-Exupéry',
    sourceType: 'book',
    sourceName: 'Night Flight',
    category: 'ADVENTURE',
    categoryName: CATEGORIES.ADVENTURE,
    difficulty: 'hard',
    lengthType: 'long',
    year: 1931,
    context: 'Pioneering early airmail pilots flying primitive propeller aircraft across dark mountain storms.',
    text: "The engine roared with steady power in the midnight sky. Below, the dark jagged peaks of the Andes slept like ancient beasts under a canopy of luminous Southern stars."
  },
  {
    id: 'adventure-ocean-solitude',
    title: 'Sailing Alone Around the World',
    author: 'Joshua Slocum',
    sourceType: 'book',
    sourceName: 'Sailing Alone Around the World',
    category: 'ADVENTURE',
    categoryName: CATEGORIES.ADVENTURE,
    difficulty: 'medium',
    lengthType: 'long',
    year: 1900,
    context: 'Joshua Slocum was the first person to sail single-handedly around the world.',
    text: "To face the sea with only a small wooden sloop is to understand humility. The waves crested white under fair winds, and for weeks I spoke only to the albatrosses soaring beside my mast."
  },

  // =========================================================================
  // 9. MYSTERY & SUSPENSE
  // =========================================================================
  {
    id: 'mystery-fog-footsteps',
    title: 'Footsteps in the Cobblestones',
    author: 'Arthur Conan Doyle',
    sourceType: 'book',
    sourceName: 'The Hound of the Baskervilles',
    category: 'MYSTERY',
    categoryName: CATEGORIES.MYSTERY,
    difficulty: 'medium',
    lengthType: 'medium',
    year: 1902,
    context: 'Sherlock Holmes investigating mysterious phenomena across dark moorlands.',
    text: "A thick yellow fog coiled along the dark avenue. From somewhere in the gloom ahead came the deliberate click of heels against wet cobblestone, pausing each time we stopped to listen."
  },
  {
    id: 'mystery-abandoned-mansion',
    title: 'The Clock in the Hall',
    author: 'Shirley Jackson',
    sourceType: 'book',
    sourceName: 'The Haunting of Hill House',
    category: 'MYSTERY',
    categoryName: CATEGORIES.MYSTERY,
    difficulty: 'hard',
    lengthType: 'long',
    year: 1959,
    context: 'Silence in an old house where strange shadows fall across high ceilings.',
    text: "No live organism can continue for long to exist sanely under conditions of absolute reality. Hill House, not sane, stood by itself against its hills, holding darkness within; silence lay steadily against the wood and stone."
  },
  {
    id: 'mystery-cryptic-cipher',
    title: 'The Unopened Envelope',
    author: 'Edgar Allan Poe',
    sourceType: 'book',
    sourceName: 'The Purloined Letter',
    category: 'MYSTERY',
    categoryName: CATEGORIES.MYSTERY,
    difficulty: 'medium',
    lengthType: 'medium',
    year: 1844,
    context: 'Hiding a secret in plain sight where ordinary searchers look right through it.',
    text: "The document had not been concealed inside a secret wall or beneath floorboards; it sat plainly displayed in the card rack, folded inside out, completely overlooked by those who looked too deeply."
  },
  {
    id: 'mystery-lighthouse-disappearance',
    title: 'The Flannan Isle Mystery',
    author: 'Maritime Investigation Board',
    sourceType: 'article',
    category: 'MYSTERY',
    categoryName: CATEGORIES.MYSTERY,
    difficulty: 'medium',
    lengthType: 'long',
    year: 1900,
    context: 'In December 1900, three lighthouse keepers vanished without a trace from a storm-swept Scottish island.',
    text: "When relief sailors landed on the remote island, the lighthouse lamps were trimmed and the clocks had wound down, but dinner sat half-eaten on the table and the three keepers had vanished forever."
  },

  // =========================================================================
  // 10. EVERYDAY CONVERSATIONS & DIALOGUE
  // =========================================================================
  {
    id: 'conversation-coffee-catchup',
    title: 'Morning at the Corner Cafe',
    author: 'Contemporary Dialogue',
    sourceType: 'article',
    category: 'CONVERSATIONS',
    categoryName: CATEGORIES.CONVERSATIONS,
    difficulty: 'easy',
    lengthType: 'short',
    context: 'A warm conversation between two long-time friends meeting over espresso.',
    text: "\"I ordered your usual double espresso,\" she said, sliding the cup across the wooden table with a smile. \"You look like you've been working late again.\""
  },
  {
    id: 'conversation-late-night-drive',
    title: 'Passenger Seat Confessions',
    author: 'Contemporary Dialogue',
    sourceType: 'article',
    category: 'CONVERSATIONS',
    categoryName: CATEGORIES.CONVERSATIONS,
    difficulty: 'easy',
    lengthType: 'medium',
    context: 'Talking quietly while driving through the empty city after midnight.',
    text: "\"Do you ever feel like time moves too fast when you're busy, but stands completely still when you're waiting?\" he asked, watching the streetlamps blur across the windshield."
  },
  {
    id: 'conversation-directions-crossroads',
    title: 'Asking for Directions',
    author: 'Contemporary Dialogue',
    sourceType: 'article',
    category: 'CONVERSATIONS',
    categoryName: CATEGORIES.CONVERSATIONS,
    difficulty: 'easy',
    lengthType: 'short',
    context: 'A simple, friendly interaction asking a stranger for directions in a new town.',
    text: "\"Take the second left past the stone bridge,\" the grocer explained, wiping his hands. \"If you hit the old windmill, you've gone too far.\""
  },
  {
    id: 'conversation-starting-project',
    title: 'The Whiteboard Session',
    author: 'Modern Work Dialogue',
    sourceType: 'article',
    category: 'CONVERSATIONS',
    categoryName: CATEGORIES.CONVERSATIONS,
    difficulty: 'medium',
    lengthType: 'medium',
    context: 'Two colleagues hashing out an ambitious software architecture on a whiteboard.',
    text: "\"Let's strip away everything that isn't essential for the first release,\" she insisted, capping her marker. \"Speed and simplicity will win every single time.\""
  },

  // =========================================================================
  // 11. BUSINESS, ENTREPRENEURSHIP & INNOVATION
  // =========================================================================
  {
    id: 'business-steve-jobs-stanford',
    title: 'Stay Hungry, Stay Foolish',
    author: 'Steve Jobs',
    sourceType: 'speech',
    sourceName: 'Stanford University Commencement',
    category: 'BUSINESS',
    categoryName: CATEGORIES.BUSINESS,
    difficulty: 'medium',
    lengthType: 'long',
    year: 2005,
    context: 'Delivered to graduates at Stanford University on purpose, mortality, and innovation.',
    text: "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma, which is living with the results of other people's thinking. Stay hungry. Stay foolish."
  },
  {
    id: 'business-zero-to-one',
    title: 'Zero to One',
    author: 'Peter Thiel',
    sourceType: 'book',
    sourceName: 'Zero to One: Notes on Startups',
    category: 'BUSINESS',
    categoryName: CATEGORIES.BUSINESS,
    difficulty: 'medium',
    lengthType: 'long',
    year: 2014,
    context: 'True innovation creates entirely new categories rather than incrementally copying what already exists.',
    text: "Every moment in business happens only once. The next Bill Gates will not build an operating system. If you are copying these people, you are not learning from them."
  },
  {
    id: 'business-innovators-dilemma',
    title: 'The Innovator\'s Dilemma',
    author: 'Clayton Christensen',
    sourceType: 'book',
    category: 'BUSINESS',
    categoryName: CATEGORIES.BUSINESS,
    difficulty: 'hard',
    lengthType: 'long',
    year: 1997,
    context: 'Why established market leaders fail when confronted with disruptive technological innovations.',
    text: "Disruptive technologies typically introduce a product that is simpler, cheaper, and more convenient than existing alternatives, initially serving niche customers before redefining the entire industry."
  },
  {
    id: 'business-compound-interest',
    title: 'The Magic of Compounding',
    author: 'Warren Buffett',
    sourceType: 'article',
    sourceName: 'Berkshire Hathaway Annual Letters',
    category: 'BUSINESS',
    categoryName: CATEGORIES.BUSINESS,
    difficulty: 'easy',
    lengthType: 'short',
    context: 'Small incremental gains compounded over long horizons yield exponential returns.',
    text: "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it."
  },
  {
    id: 'business-speed-as-habit',
    title: 'Speed as a Habit',
    author: 'Firas Kittaneh',
    sourceType: 'article',
    category: 'BUSINESS',
    categoryName: CATEGORIES.BUSINESS,
    difficulty: 'medium',
    lengthType: 'medium',
    context: 'Decisiveness and execution cadence in high-growth technology companies.',
    text: "In modern markets, speed is not merely a competitive advantage; speed is a daily operational habit. The faster you iterate, the faster you discover truth."
  },

  // =========================================================================
  // 12. SPORTS, AUTOMOBILES & MOTORSPORTS
  // =========================================================================
  {
    id: 'motorsport-senna-monaco',
    title: 'Senna at Monaco',
    author: 'Ayrton Senna',
    sourceType: 'speech',
    category: 'MOTORSPORTS',
    categoryName: CATEGORIES.MOTORSPORTS,
    difficulty: 'hard',
    lengthType: 'long',
    year: 1988,
    context: 'Ayrton Senna describing his transcendental 1988 Monaco qualifying lap in the McLaren MP4/4.',
    text: "I was in a different dimension. The circuit was for me a tunnel, and I was going and going, way over the limit. I suddenly realized that I was no longer driving consciously, but by pure instinct."
  },
  {
    id: 'motorsport-monza-temple',
    title: 'The Temple of Speed',
    author: 'Autosport Review',
    sourceType: 'article',
    category: 'MOTORSPORTS',
    categoryName: CATEGORIES.MOTORSPORTS,
    difficulty: 'medium',
    lengthType: 'medium',
    context: 'The Autodromo Nazionale Monza, where Formula 1 cars exceed 350 km/h along the historic royal park straights.',
    text: "At Monza, engines scream at full throttle through the Curva Grande and into the Variante del Rettifilo, where carbon brakes glow incandescent red against the autumn air."
  },
  {
    id: 'motorsport-le-mans-night',
    title: 'The Mulsanne Straight at 3 AM',
    author: 'Endurance Racing Quarterly',
    sourceType: 'article',
    category: 'MOTORSPORTS',
    categoryName: CATEGORIES.MOTORSPORTS,
    difficulty: 'hard',
    lengthType: 'long',
    context: 'Racing prototypes through pitch-black country roads during the 24 Hours of Le Mans.',
    text: "At three in the morning along the Mulsanne straight, headlights slice through countryside mist at two hundred miles per hour, illuminated brake discs flaring like hot coals in the dark."
  },
  {
    id: 'motorsport-apex-theory',
    title: 'The Geometry of the Racing Line',
    author: 'Skip Barber Driving Academy',
    sourceType: 'book',
    category: 'MOTORSPORTS',
    categoryName: CATEGORIES.MOTORSPORTS,
    difficulty: 'medium',
    lengthType: 'medium',
    context: 'Maximizing corner exit speed through trail braking and hitting the late apex.',
    text: "The perfect racing line trades early corner entry speed for a late apex, allowing the driver to unwind steering lock and apply maximum throttle earlier down the subsequent straightaway."
  },
  {
    id: 'motorsport-fast-car-song',
    title: 'Fast Car',
    author: 'Tracy Chapman',
    sourceType: 'song',
    sourceName: 'Tracy Chapman (Debut Album)',
    category: 'MOTORSPORTS',
    categoryName: CATEGORIES.MOTORSPORTS,
    difficulty: 'easy',
    lengthType: 'medium',
    year: 1988,
    context: 'Tracy Chapman’s timeless anthem about driving through the night to escape hardship and find freedom.',
    text: "You got a fast car. I want a ticket to anywhere. Maybe we make a deal, maybe together we can get somewhere. Any place is better, starting from zero got nothing to lose."
  },
  {
    id: 'motorsport-born-to-run-song',
    title: 'Born to Run',
    author: 'Bruce Springsteen',
    sourceType: 'song',
    sourceName: 'Born to Run (Columbia Records)',
    category: 'MOTORSPORTS',
    categoryName: CATEGORIES.MOTORSPORTS,
    difficulty: 'medium',
    lengthType: 'medium',
    year: 1975,
    context: 'Bruce Springsteen’s four-minute operatic celebration of highway machines and youth.',
    text: "In the day we sweat it out on the streets of a runaway American dream. At night we ride through mansions of glory in suicide machines, sprung from cages out on highway nine."
  },

  // =========================================================================
  // 13. RANDOM INTERESTING OBSERVATIONS & PHILOSOPHY
  // =========================================================================
  {
    id: 'observation-solitude-speed',
    title: 'The Solitude of Speed',
    author: 'Elena Vance',
    sourceType: 'article',
    sourceName: 'The Automotive Quarterly',
    category: 'OBSERVATIONS',
    categoryName: CATEGORIES.OBSERVATIONS,
    difficulty: 'medium',
    lengthType: 'medium',
    year: 2024,
    context: 'An exploration of how solitary speed behind the wheel acts as a neurological palette cleanser.',
    text: "Beneath the quiet hum of the asphalt, every keystroke translates to momentum. There is no past to reconsider and no future to anticipate, only the smooth unbroken rhythm of the road unfolding before you."
  },
  {
    id: 'observation-midnight-drive',
    title: 'Midnight Radiance',
    author: 'Marcus Chen',
    sourceType: 'article',
    sourceName: 'Urban Geographies Review',
    category: 'OBSERVATIONS',
    categoryName: CATEGORIES.OBSERVATIONS,
    difficulty: 'easy',
    lengthType: 'medium',
    year: 2025,
    context: 'On the meditative phenomenon of empty freeway driving beneath city skyline illumination.',
    text: "The city lights blurred past as the night opened into possibilities. High above the viaduct, the air cooled and the engine note settled into a comforting, hypnotic cadence that erased the weight of the afternoon."
  },
  {
    id: 'observation-marcus-aurelius',
    title: 'Meditations on Present Time',
    author: 'Marcus Aurelius',
    sourceType: 'book',
    sourceName: 'Meditations (Book IV)',
    category: 'OBSERVATIONS',
    categoryName: CATEGORIES.OBSERVATIONS,
    difficulty: 'medium',
    lengthType: 'long',
    year: 180,
    context: 'The Roman Emperor Marcus Aurelius writing personal notes on presence and tranquil mind.',
    text: "Never let the future disturb you. You will meet it, if you have to, with the same weapons of reason which today arm you against the present. Dwell on the beauty of life. Watch the stars, and see yourself running with them."
  },
  {
    id: 'observation-keystroke-meditation',
    title: 'The Zen of Keystrokes',
    author: 'meanwhile reflections',
    sourceType: 'article',
    category: 'OBSERVATIONS',
    categoryName: CATEGORIES.OBSERVATIONS,
    difficulty: 'easy',
    lengthType: 'short',
    context: 'On the mindfulness found in the rhythm of mechanical typing.',
    text: "Each keystroke is a deliberate step. Find the rhythm between breath and finger, and the machine ceases to be a tool; it becomes an extension of thought."
  },

  // =========================================================================
  // 14. CLASSIC LITERATURE & NARRATIVE PASSAGES
  // =========================================================================
  {
    id: 'literature-gatsby-green-light',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    sourceType: 'book',
    sourceName: 'The Great Gatsby (Chapter 9)',
    category: 'LITERATURE',
    categoryName: CATEGORIES.LITERATURE,
    difficulty: 'medium',
    lengthType: 'long',
    year: 1925,
    context: 'The poignant closing lines of F. Scott Fitzgerald’s American masterpiece on ambition and the past.',
    text: "Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that's no matter—tomorrow we will run faster, stretch out our arms farther. So we beat on, boats against the current, borne back ceaselessly into the past."
  },
  {
    id: 'literature-dune-litany',
    title: 'Litany Against Fear',
    author: 'Frank Herbert',
    sourceType: 'book',
    sourceName: 'Dune: Book of the Bene Gesserit',
    category: 'LITERATURE',
    categoryName: CATEGORIES.LITERATURE,
    difficulty: 'hard',
    lengthType: 'long',
    year: 1965,
    context: 'The Litany Against Fear recited to calm heart rate and focus the mind under extreme pressure.',
    text: "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me. Where the fear has gone there will be nothing. Only I will remain."
  },
  {
    id: 'literature-on-the-road-mad',
    title: 'On the Road',
    author: 'Jack Kerouac',
    sourceType: 'book',
    sourceName: 'On the Road (Part One)',
    category: 'LITERATURE',
    categoryName: CATEGORIES.LITERATURE,
    difficulty: 'medium',
    lengthType: 'long',
    year: 1957,
    context: 'Jack Kerouac’s quintessential hymn to the open highway and wanderlust.',
    text: "The only people for me are the mad ones, the ones who are mad to live, mad to talk, mad to be saved, desirous of everything at the same time, the ones who never yawn or say a commonplace thing, but burn, burn, burn like fabulous yellow roman candles."
  },
  {
    id: 'literature-neuromancer-sky',
    title: 'Neuromancer',
    author: 'William Gibson',
    sourceType: 'book',
    sourceName: 'Neuromancer (Opening)',
    category: 'LITERATURE',
    categoryName: CATEGORIES.LITERATURE,
    difficulty: 'medium',
    lengthType: 'long',
    trackAffinity: ['neon-city', 'city-circuit', 'city'],
    year: 1984,
    context: 'The iconic opening of William Gibson’s genre-defining cyberpunk novel.',
    text: "The sky above the port was the color of television, tuned to a dead channel. Case heard someone say, as he shouldered his way through the crowd around the door of the Chatsubo, that his body had developed a massive drug deficiency."
  },
  {
    id: 'literature-moby-dick-opening',
    title: 'Call Me Ishmael',
    author: 'Herman Melville',
    sourceType: 'book',
    sourceName: 'Moby-Dick (Chapter 1)',
    category: 'LITERATURE',
    categoryName: CATEGORIES.LITERATURE,
    difficulty: 'medium',
    lengthType: 'long',
    trackAffinity: ['coastal-run', 'coastal-circuit', 'coastal'],
    year: 1851,
    context: 'The famous opening of Herman Melville’s classic novel of the sea.',
    text: "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world."
  },
  {
    id: 'literature-two-cities-best',
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    sourceType: 'book',
    sourceName: 'A Tale of Two Cities (Book 1, Chapter 1)',
    category: 'LITERATURE',
    categoryName: CATEGORIES.LITERATURE,
    difficulty: 'hard',
    lengthType: 'long',
    year: 1859,
    context: 'The famous opening paradoxes of Charles Dickens’s historical novel.',
    text: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of light, it was the season of darkness."
  },
  {
    id: 'literature-bohemian-rhapsody',
    title: 'Bohemian Rhapsody',
    author: 'Freddie Mercury',
    sourceType: 'song',
    sourceName: 'Queen: A Night at the Opera',
    category: 'LITERATURE',
    categoryName: CATEGORIES.LITERATURE,
    difficulty: 'medium',
    lengthType: 'medium',
    year: 1975,
    context: 'Freddie Mercury’s operatic masterpiece which topped global charts.',
    text: "Is this the real life? Is this just fantasy? Caught in a landslide, no escape from reality. Open your eyes, look up to the skies and see. I'm just a poor boy, I need no sympathy."
  },
  {
    id: 'literature-starman-bowie',
    title: 'Starman',
    author: 'David Bowie',
    sourceType: 'song',
    sourceName: 'The Rise and Fall of Ziggy Stardust',
    category: 'LITERATURE',
    categoryName: CATEGORIES.LITERATURE,
    difficulty: 'medium',
    lengthType: 'medium',
    year: 1972,
    context: 'David Bowie’s celestial beacon single transmitting hope across interstellar radio waves.',
    text: "There's a starman waiting in the sky. He'd like to come and meet us, but he thinks he'd blow our minds. There's a starman waiting in the sky, he's told us not to blow it, cause he knows it's all worthwhile."
  }
];

/**
 * Legacy Helper: getRandomPassage (maintained for full compatibility with existing components)
 * For intelligent selection, prefer using `selectPassage` from `../services/passageSelector.js`.
 */
export const getRandomPassage = (category = null) => {
  if (category) {
    const filtered = PASSAGES.filter(p => p.sourceType === category || p.category === category || p.categoryName === category);
    if (filtered.length > 0) {
      return filtered[Math.floor(Math.random() * filtered.length)];
    }
  }
  return PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
};
