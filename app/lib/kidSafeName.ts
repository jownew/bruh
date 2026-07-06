const ADJECTIVES = [
  'Happy', 'Sparkly', 'Brave', 'Silly', 'Sunny', 'Fuzzy', 'Speedy',
  'Clever', 'Jolly', 'Mighty', 'Bouncy', 'Cheerful', 'Gentle', 'Zippy', 'Curious',
];

const ANIMALS = [
  'Panda', 'Tiger', 'Dolphin', 'Unicorn', 'Fox', 'Rabbit', 'Dragon',
  'Koala', 'Otter', 'Penguin', 'Puppy', 'Kitten', 'Owl', 'Turtle', 'Butterfly',
];

/** A fun, always-appropriate placeholder name like "SparklyPanda42". */
export function generateKidSafeName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${animal}${number}`;
}
