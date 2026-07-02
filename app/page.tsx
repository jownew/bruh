import Link from 'next/link';

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-sky-200 via-yellow-100 to-pink-200 flex items-center justify-center p-4'>
      <div className='text-center max-w-lg w-full'>
        <div className='text-8xl mb-4 animate-bounce'>🌈</div>
        <h1 className='text-5xl font-extrabold text-purple-800 mb-3'>
          Kids Quiz App
        </h1>
        <p className='text-xl text-purple-600 font-semibold mb-8'>
          Learn, play, and have fun! 🎉
        </p>
        <div className='flex flex-col gap-4 items-center'>
          <Link
            href='/quiz'
            className='bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-2xl px-10 py-5 rounded-full shadow-xl hover:scale-105 transition-all duration-200 border-4 border-white/40'
          >
            🚀 Start Quiz!
          </Link>
          <Link
            href='/contact'
            className='bg-white/70 hover:bg-white text-purple-700 font-bold text-base px-6 py-2 rounded-full shadow hover:scale-105 transition-all duration-200 border-2 border-purple-200'
          >
            💌 Contact Us
          </Link>
        </div>
        <div className='mt-10 flex justify-center gap-6 text-4xl'>
          <span>📚</span>
          <span>🧠</span>
          <span>⭐</span>
          <span>🏆</span>
          <span>🎊</span>
        </div>
      </div>
    </div>
  );
}
