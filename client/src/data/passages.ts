export interface Passage {
  id: string;
  title: string;
  author: string;
  sourceType: 'book' | 'song' | 'article' | 'speech' | 'essay';
  year: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  context: string;
  text: string;
}

export const PASSAGES: Passage[] = [
  // --- CLASSIC & MODERN BOOKS ---
  {
    id: 'book-gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    sourceType: 'book',
    year: 1925,
    category: 'Classic Literature',
    difficulty: 'medium',
    context: 'From Chapter 9 of Fitzgerald’s 1925 masterpiece on ambition, memory, and the green light at the end of the dock.',
    text: "Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that's no matter—tomorrow we will run faster, stretch out our arms farther. And then one fine morning—so we beat on, boats against the current, borne back ceaselessly into the past."
  },
  {
    id: 'book-dune',
    title: 'Dune',
    author: 'Frank Herbert',
    sourceType: 'book',
    year: 1965,
    category: 'Science Fiction',
    difficulty: 'hard',
    context: 'The iconic Litany Against Fear recited by Paul Atreides and the Bene Gesserit order to maintain absolute composure in lethal danger.',
    text: "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me. And when it has gone past I will turn the inner eye to see its path. Where the fear has gone there will be nothing. Only I will remain."
  },
  {
    id: 'book-1984',
    title: '1984',
    author: 'George Orwell',
    sourceType: 'book',
    year: 1949,
    category: 'Dystopian Fiction',
    difficulty: 'easy',
    context: 'The unforgettable opening of George Orwell’s dystopian prophecy examining totalitarian surveillance and psychological conformity.',
    text: "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him."
  },
  {
    id: 'book-neuromancer',
    title: 'Neuromancer',
    author: 'William Gibson',
    sourceType: 'book',
    year: 1984,
    category: 'Cyberpunk',
    difficulty: 'medium',
    context: 'The electric opening lines of William Gibson’s seminal 1984 cyberpunk classic that coined the term cyberspace.',
    text: "The sky above the port was the color of television, tuned to a dead channel. It was not like I was using, Case heard someone say, as he shouldered his way through the crowd around the door of the Chatsubo. It was like my body had developed this massive drug deficiency."
  },
  {
    id: 'book-racing-in-the-rain',
    title: 'The Art of Racing in the Rain',
    author: 'Garth Stein',
    sourceType: 'book',
    year: 2008,
    category: 'Motorsport Novel',
    difficulty: 'easy',
    context: 'Denny Swift’s guiding philosophy on racecraft, traction, and mental equilibrium behind the steering wheel in torrential downpours.',
    text: "There is no dishonor in losing the race. There is only dishonor in not racing because you are afraid to lose. That which you manifest is before you; we are the creators of our own destiny. The car goes where the eyes go."
  },
  {
    id: 'book-lotr',
    title: 'The Fellowship of the Ring',
    author: 'J.R.R. Tolkien',
    sourceType: 'book',
    year: 1954,
    category: 'High Fantasy',
    difficulty: 'medium',
    context: 'The celebrated Riddle of Strider composed by Bilbo Baggins concerning the rightful king of Gondor.',
    text: "All that is gold does not glitter, not all those who wander are lost; the old that is strong does not wither, deep roots are not reached by the frost. From the ashes a fire shall be woken, a light from the shadows shall spring; renewed shall be blade that was broken, the crownless again shall be king."
  },
  {
    id: 'book-fahrenheit-451',
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    sourceType: 'book',
    year: 1953,
    category: 'Speculative Fiction',
    difficulty: 'medium',
    context: 'The searing opening sentences of Guy Montag’s journey as a fireman tasked with incinerating contraband literature.',
    text: "It was a pleasure to burn. It was a special pleasure to see things eaten, to see things blackened and changed. With the brass nozzle in his fists, with this great python spitting its venomous kerosene upon the world, the blood pounded in his head, and his hands were the hands of some amazing conductor."
  },
  {
    id: 'book-moby-dick',
    title: 'Moby-Dick',
    author: 'Herman Melville',
    sourceType: 'book',
    year: 1851,
    category: 'Maritime Adventure',
    difficulty: 'hard',
    context: 'The famous opening reflection of Ishmael explaining his irresistible pull toward the vast open sea and nautical solitude.',
    text: "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation."
  },

  // --- ICONIC SONGS & MUSIC LYRICS ---
  {
    id: 'song-bohemian-rhapsody',
    title: 'Bohemian Rhapsody',
    author: 'Queen',
    sourceType: 'song',
    year: 1975,
    category: 'Classic Rock',
    difficulty: 'easy',
    context: 'Penned by Freddie Mercury for Queen’s 1975 diamond-certified album A Night at the Opera, revolutionizing modern rock composition.',
    text: "Is this the real life? Is this just fantasy? Caught in a landslide, no escape from reality. Open your eyes, look up to the skies and see. I'm just a poor boy, I need no sympathy, because I'm easy come, easy go, little high, little low. Any way the wind blows doesn't really matter to me."
  },
  {
    id: 'song-daft-punk',
    title: 'Harder, Better, Faster, Stronger',
    author: 'Daft Punk',
    sourceType: 'song',
    year: 2001,
    category: 'Electronic Dance',
    difficulty: 'easy',
    context: 'The high-energy robotic vocal anthem from Daft Punk’s landmark electronic album Discovery.',
    text: "Work it make it do it makes us harder better faster stronger more than ever hour after hour work is never over. Work it harder make it better do it faster makes us stronger, more than ever, hour after, our work is never over."
  },
  {
    id: 'song-space-oddity',
    title: 'Space Oddity',
    author: 'David Bowie',
    sourceType: 'song',
    year: 1969,
    category: 'Art Rock',
    difficulty: 'medium',
    context: 'Released days before the Apollo 11 lunar touchdown in July 1969, chronicling the orbital voyage of astronaut Major Tom.',
    text: "Ground Control to Major Tom, commencing countdown, engines on. Check ignition and may God's love be with you. This is Ground Control to Major Tom: you've really made the grade, and the papers want to know whose shirts you wear. Now it's time to leave the capsule if you dare."
  },
  {
    id: 'song-fast-car',
    title: 'Fast Car',
    author: 'Tracy Chapman',
    sourceType: 'song',
    year: 1988,
    category: 'Folk Rock',
    difficulty: 'medium',
    context: 'Tracy Chapman’s Grammy-winning narrative ballad celebrating the promise of velocity, liberation, and economic reinvention.',
    text: "You got a fast car, I want a ticket to anywhere. Maybe we make a deal, maybe together we can get somewhere. Any place is better, starting from zero got nothing to lose. Maybe we'll make something, me, myself, I got nothing to prove."
  },
  {
    id: 'song-lose-yourself',
    title: 'Lose Yourself',
    author: 'Eminem',
    sourceType: 'song',
    year: 2002,
    category: 'Hip-Hop / Soundtrack',
    difficulty: 'hard',
    context: 'The Academy Award-winning soundtrack lead from 8 Mile, capturing high-stakes performance anxiety and decisive execution.',
    text: "Look, if you had one shot, or one opportunity to seize everything you ever wanted in one moment, would you capture it or just let it slip? His palms are sweaty, knees weak, arms are heavy. There's vomit on his sweater already, mom's spaghetti. He's nervous, but on the surface he looks calm and ready."
  },
  {
    id: 'song-viva-la-vida',
    title: 'Viva La Vida',
    author: 'Coldplay',
    sourceType: 'song',
    year: 2008,
    category: 'Alternative Rock',
    difficulty: 'medium',
    context: 'From Coldplay’s fourth studio album, exploring historical empires, fleeting power, and theatrical grandeur.',
    text: "I used to rule the world, seas would rise when I gave the word. Now in the morning I sleep alone, sweep the streets I used to own. I used to roll the dice, feel the fear in my enemy's eyes. Listen as the crowd would sing, now the old king is dead, long live the king."
  },

  // --- HISTORIC SPEECHES & ADDRESSES ---
  {
    id: 'speech-pale-blue-dot',
    title: 'Pale Blue Dot',
    author: 'Carl Sagan',
    sourceType: 'speech',
    year: 1994,
    category: 'Cosmology & Philosophy',
    difficulty: 'hard',
    context: 'Delivered by astrophysicist Carl Sagan at Cornell University, reflecting on the portrait of Earth captured by Voyager 1 from 3.7 billion miles away.',
    text: "Look again at that dot. That's here. That's home. That's us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives. The aggregate of our joy and suffering, thousands of confident religions, ideologies, and economic doctrines."
  },
  {
    id: 'speech-steve-jobs',
    title: 'Stay Hungry, Stay Foolish',
    author: 'Steve Jobs',
    sourceType: 'speech',
    year: 2005,
    category: 'Stanford Commencement',
    difficulty: 'easy',
    context: 'From Steve Jobs’s celebrated 2005 Stanford University commencement address on mortality, intuition, and authentic living.',
    text: "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma, which is living with the results of other people's thinking. Don't let the noise of others' opinions drown out your own inner voice. And most important, have the courage to follow your heart and intuition."
  },
  {
    id: 'speech-jfk-moon',
    title: 'We Choose to Go to the Moon',
    author: 'John F. Kennedy',
    sourceType: 'speech',
    year: 1962,
    category: 'Presidential Address',
    difficulty: 'easy',
    context: 'Delivered at Rice University Stadium on September 12, 1962, inspiring the national commitment to land humans on the Moon.',
    text: "We choose to go to the Moon. We choose to go to the Moon in this decade and do the other things, not because they are easy, but because they are hard, because that goal will serve to organize and measure the best of our energies and skills, because that challenge is one that we are willing to accept."
  },
  {
    id: 'speech-churchill',
    title: 'We Shall Fight on the Beaches',
    author: 'Winston Churchill',
    sourceType: 'speech',
    year: 1940,
    category: 'Parliamentary Address',
    difficulty: 'hard',
    context: 'Prime Minister Winston Churchill’s historic rallying cry to the British House of Commons during the Dunkirk evacuation in June 1940.',
    text: "We shall go on to the end. We shall fight in France, we shall fight on the seas and oceans, we shall fight with growing confidence and growing strength in the air, we shall defend our island, whatever the cost may be. We shall fight on the beaches, we shall fight on the landing grounds, we shall never surrender."
  },

  // --- ARTICLES, ESSAYS & TECH MANIFESTOS ---
  {
    id: 'essay-feynman',
    title: 'The Pleasure of Finding Things Out',
    author: 'Richard Feynman',
    sourceType: 'essay',
    year: 1981,
    category: 'Physics & Epistemology',
    difficulty: 'medium',
    context: 'Nobel physicist Richard Feynman’s BBC interview discussing intellectual honesty, curiosity, and the courage to live with doubt.',
    text: "I can live with doubt and uncertainty and not knowing. I think it's much more interesting to live not knowing than to have answers which might be wrong. I have approximate answers and possible beliefs and different degrees of certainty about different things, but I'm not absolutely sure of anything."
  },
  {
    id: 'article-cathedral-bazaar',
    title: 'The Cathedral and the Bazaar',
    author: 'Eric S. Raymond',
    sourceType: 'article',
    year: 1997,
    category: 'Open Source Culture',
    difficulty: 'medium',
    context: 'The foundational computing manifesto examining decentralized collaboration and peer review in the Linux kernel ecosystem.',
    text: "Given enough eyeballs, all bugs are shallow. Linus Torvalds's method of releasing early and often, delegating everything you could, and being open to the point of promiscuity came with the force of a surprise. No quiet, reverent cathedral-building here—rather, the Linux community seemed to resemble a great babbling bazaar."
  },
  {
    id: 'article-turing',
    title: 'Computing Machinery and Intelligence',
    author: 'Alan Turing',
    sourceType: 'article',
    year: 1950,
    category: 'Artificial Intelligence',
    difficulty: 'hard',
    context: 'Alan Turing’s landmark 1950 Mind paper introducing the Imitation Game (Turing Test) to evaluate machine consciousness.',
    text: "I propose to consider the question, 'Can machines think?' This should begin with definitions of the meaning of the terms 'machine' and 'think'. If the meaning of the words was to be found by examining how they are commonly used it would be difficult to escape the conclusion that the answer should be sought in a statistical survey."
  }
];

export function getRandomPassage(difficulty?: 'easy' | 'medium' | 'hard'): Passage {
  let pool = PASSAGES;
  if (difficulty) {
    const filtered = PASSAGES.filter(p => p.difficulty === difficulty);
    if (filtered.length > 0) pool = filtered;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
