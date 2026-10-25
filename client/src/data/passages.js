// Atmospheric typing passages for Meanwhile

export const PASSAGES = [
  {
    id: 'meanwhile-night',
    title: 'Open Horizons',
    author: 'meanwhile',
    sourceType: 'essay',
    category: 'Atmospheric Focus',
    difficulty: 'medium',
    context: 'The quiet hum of midnight asphalt where thoughts crystallize into pure momentum.',
    text: "The city lights blurred past as the night opened into possibilities."
  },
  {
    id: 'asphalt-solitude',
    title: 'The Solitude of Speed',
    author: 'meanwhile',
    sourceType: 'essay',
    category: 'Mindful Driving',
    difficulty: 'medium',
    context: 'Finding calm inside acceleration.',
    text: "Beneath the quiet hum of the asphalt, every keystroke translates to momentum. There is no past to reconsider and no future to anticipate, only the smooth unbroken rhythm of the road unfolding before you."
  },
  {
    id: 'book-gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    sourceType: 'book',
    year: 1925,
    category: 'Classic Literature',
    difficulty: 'medium',
    context: 'From Chapter 9 of Fitzgerald’s masterpiece on ambition, memory, and the green light at the end of the dock.',
    text: "Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that's no matter—tomorrow we will run faster, stretch out our arms farther. And then one fine morning—so we beat on, boats against the current, borne back ceaselessly into the past."
  },
  {
    id: 'coastal-dusk',
    title: 'Twilight Highway',
    author: 'meanwhile',
    sourceType: 'essay',
    category: 'Atmospheric Focus',
    difficulty: 'easy',
    context: 'Watching the sunset tint the cliffside curves in shades of amber and lavender.',
    text: "The ocean reflected the dying embers of the sunset. Cool coastal air swept through the open window, carrying the scent of sea salt and warm tarmac as the tires traced a timeless line along the curve of the earth."
  },
  {
    id: 'book-neuromancer',
    title: 'Neuromancer',
    author: 'William Gibson',
    sourceType: 'book',
    year: 1984,
    category: 'Cyberpunk',
    difficulty: 'medium',
    context: 'The electric opening lines of William Gibson’s seminal 1984 cyberpunk classic.',
    text: "The sky above the port was the color of television, tuned to a dead channel. It was not like I was using, Case heard someone say, as he shouldered his way through the crowd around the door of the Chatsubo."
  },
  {
    id: 'book-dune',
    title: 'Dune',
    author: 'Frank Herbert',
    sourceType: 'book',
    year: 1965,
    category: 'Science Fiction',
    difficulty: 'hard',
    context: 'The iconic Litany Against Fear recited to maintain absolute composure in the face of pressure.',
    text: "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me. And when it has gone past I will turn the inner eye to see its path. Where the fear has gone there will be nothing. Only I will remain."
  },
  {
    id: 'zen-flow',
    title: 'In The Meantime',
    author: 'meanwhile',
    sourceType: 'essay',
    category: 'Mindful Driving',
    difficulty: 'easy',
    context: 'A short escape from the noise of the day.',
    text: "Sometimes the fastest way to slow down is to move forward. Step inside the car, leave the rush behind, and let the cadence of your fingers carry you across quiet roads."
  }
];

export const getRandomPassage = () => {
  const index = Math.floor(Math.random() * PASSAGES.length);
  return PASSAGES[index];
};
