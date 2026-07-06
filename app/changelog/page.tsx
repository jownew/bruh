import Link from 'next/link';

interface ChangelogEntry {
  date: string;
  emoji: string;
  title: string;
  description: string;
}

// Newest first. Keep descriptions friendly and jargon-free — this page is for
// players and parents, not developers.
const ENTRIES: ChangelogEntry[] = [
  {
    date: 'July 7, 2026',
    emoji: '📚',
    title: 'Lots of new questions',
    description:
      'Added over 170 new questions to the Basic Assessment quiz, covering English, Math, Logic, and General Knowledge — more variety every time you play!',
  },
  {
    date: 'July 6, 2026',
    emoji: '🛡️',
    title: 'Friendlier names only',
    description:
      "We now check names for bad words. If you try to save one, we'll ask you to pick something friendlier instead.",
  },
  {
    date: 'July 6, 2026',
    emoji: '✏️',
    title: 'Easier to rename yourself',
    description:
      "Made the 'Edit' button next to your name bigger and easier to spot, so it's simple to change your name anytime.",
  },
  {
    date: 'July 6, 2026',
    emoji: '🏷️',
    title: 'Which quiz was that?',
    description:
      "Your results screen now shows the name of the quiz you just finished, so it's easy to tell your scores apart.",
  },
  {
    date: 'July 6, 2026',
    emoji: '🐼',
    title: 'A fun name to start',
    description:
      "New players now get a fun random name (like \"SparklyPanda42\") right away, so you can jump straight into playing. You can still change it anytime from your Profile page.",
  },
  {
    date: 'July 6, 2026',
    emoji: '🔄',
    title: 'Fresh weekly leaderboard',
    description:
      "The leaderboard now starts fresh every Monday, so everyone gets a new chance to be #1 each week. Don't worry — your personal quiz history is still saved forever on your Profile page.",
  },
  {
    date: 'July 5, 2026',
    emoji: '⚡',
    title: 'Speed now counts',
    description:
      "We added a stopwatch! If two players tie on score, whoever finished faster now ranks higher on the leaderboard.",
  },
  {
    date: 'July 5, 2026',
    emoji: '🏆',
    title: 'Leaderboard launched',
    description:
      'You can now see how your scores stack up against other players! Finish a quiz and check the leaderboard to see the top scores.',
  },
  {
    date: 'July 4, 2026',
    emoji: '🏠',
    title: 'Easier way home',
    description:
      "Made the 'Back to Home' button bigger and easier to spot while you're taking a quiz.",
  },
  {
    date: 'July 3, 2026',
    emoji: '👤',
    title: 'Player profiles',
    description:
      'Save your name and see all your past quiz scores in one place on your very own Profile page.',
  },
  {
    date: 'July 2, 2026',
    emoji: '💌',
    title: 'Contact us',
    description:
      'Added a way to send us your feedback, questions, or bug reports straight from the app.',
  },
  {
    date: 'July 2, 2026',
    emoji: '🔊',
    title: 'Sound effects',
    description:
      'Quizzes now play cheerful little sounds when you get an answer right (or not-so-right)!',
  },
  {
    date: 'June 26, 2026',
    emoji: '🎉',
    title: 'Quiz app launched',
    description:
      'Welcome! We launched the very first version of the app with fun multiple-choice quiz questions.',
  },
];

export default function ChangelogPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-sky-200 via-yellow-100 to-pink-200 flex items-center justify-center p-4'>
      <div className='w-full max-w-lg'>
        <div className='mb-3'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 bg-white text-purple-700 font-extrabold text-sm px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-purple-200'
          >
            🏠 Back to Home
          </Link>
        </div>

        <div className='text-center mb-6'>
          <div className='text-6xl mb-2'>📝</div>
          <h1 className='text-4xl font-extrabold text-purple-800 mb-1'>
            What&apos;s New
          </h1>
          <p className='text-purple-600 font-semibold'>
            Here&apos;s what we&apos;ve been adding to the app!
          </p>
        </div>

        <div className='space-y-3'>
          {ENTRIES.map((entry, i) => (
            <div
              key={i}
              className='bg-white rounded-3xl shadow-xl p-5 border-4 border-purple-200'
            >
              <div className='flex items-start gap-3'>
                <span className='text-3xl shrink-0'>{entry.emoji}</span>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <h2 className='font-extrabold text-purple-800 text-lg'>
                      {entry.title}
                    </h2>
                    <span className='text-purple-300 text-xs font-bold'>
                      {entry.date}
                    </span>
                  </div>
                  <p className='text-purple-600 font-medium text-sm mt-1'>
                    {entry.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
