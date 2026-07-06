'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Question } from '../api/questions/route';
import { useAudio } from '../hooks/useAudio';
import { useUserData } from '../hooks/useUserData';

const EMOJIS_CORRECT = ['🎉', '⭐', '🌟', '🥳', '🎊', '🦄', '🍭'];
const EMOJIS_WRONG = ['😅', '💪', '🌈', '🔄', '😊'];
const OPTION_COLORS = [
  {
    bg: 'bg-yellow-300 hover:bg-yellow-400 border-yellow-500',
    selected: 'bg-yellow-500 border-yellow-700 scale-105',
    text: 'text-yellow-900',
  },
  {
    bg: 'bg-sky-300 hover:bg-sky-400 border-sky-500',
    selected: 'bg-sky-500 border-sky-700 scale-105',
    text: 'text-sky-900',
  },
  {
    bg: 'bg-pink-300 hover:bg-pink-400 border-pink-500',
    selected: 'bg-pink-500 border-pink-700 scale-105',
    text: 'text-pink-900',
  },
];
const PART_COLORS: Record<string, string> = {
  'Part A': 'from-purple-400 to-indigo-500',
  'Part B': 'from-green-400 to-teal-500',
  'Part C': 'from-orange-400 to-red-500',
  'Part D': 'from-pink-400 to-rose-500',
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function randomEmoji(emojis: string[]): string {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

export default function QuizPage() {
  const [sets, setSets] = useState<string[]>([]);
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [shuffled, setShuffled] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackEmoji, setFeedbackEmoji] = useState('');
  const { playCorrect, playWrong, playClick, playVictory, toggleMute, muted } =
    useAudio();
  const { name: playerName, saveAttempt } = useUserData();
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    fetch('/api/questions')
      .then((r) => r.json())
      .then((d) => setSets(d.sets));
  }, []);

  const startQuiz = useCallback((set: string) => {
    fetch(`/api/questions?questionSet=${encodeURIComponent(set)}`)
      .then((r) => r.json())
      .then((d) => {
        setShuffled(shuffle(d.questions));
        setSelectedSet(set);
        setIndex(0);
        setScore(0);
        setChosen(null);
        setFeedback(null);
        setFinished(false);
        startTimeRef.current = Date.now();
      });
  }, []);

  const handleAnswer = (opt: string) => {
    if (chosen) return;
    setChosen(opt);
    const q = shuffled[index];
    const isCorrect = opt === q.correctOption;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setFeedbackEmoji(
      isCorrect ? randomEmoji(EMOJIS_CORRECT) : randomEmoji(EMOJIS_WRONG),
    );
    if (isCorrect) {
      setScore((s) => s + 1);
      playCorrect();
    } else {
      playWrong();
    }
  };

  const next = () => {
    playClick();
    if (index + 1 >= shuffled.length) {
      playVictory();
      saveAttempt(selectedSet!, score, shuffled.length);
      if (playerName) {
        const elapsedSeconds = startTimeRef.current
          ? Math.round((Date.now() - startTimeRef.current) / 1000)
          : null;
        fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: playerName,
            questionSet: selectedSet,
            score,
            total: shuffled.length,
            elapsedSeconds,
          }),
        }).catch(() => {
          /* leaderboard submission is best-effort */
        });
      }
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setChosen(null);
      setFeedback(null);
    }
  };

  const restart = () => {
    setSelectedSet(null);
    setFinished(false);
    setShuffled([]);
    setIndex(0);
    setScore(0);
    setChosen(null);
    setFeedback(null);
  };

  if (!selectedSet)
    return (
      <SetSelector
        sets={sets}
        onSelect={startQuiz}
        muted={muted}
        onToggleMute={toggleMute}
      />
    );
  if (finished)
    return (
      <ResultScreen
        score={score}
        total={shuffled.length}
        playerName={playerName}
        questionSet={selectedSet!}
        onRestart={restart}
        onRetry={() => startQuiz(selectedSet)}
        muted={muted}
        onToggleMute={toggleMute}
      />
    );

  const q = shuffled[index];
  const opts = [
    { label: 'A', value: 'A', text: q.optionA },
    { label: 'B', value: 'B', text: q.optionB },
    ...(q.optionC ? [{ label: 'C', value: 'C', text: q.optionC }] : []),
  ];
  const partColor = PART_COLORS[q.part] ?? 'from-purple-400 to-pink-500';
  const progress = ((index + 1) / shuffled.length) * 100;

  return (
    <div className='min-h-screen bg-gradient-to-br from-sky-200 via-yellow-100 to-pink-200 flex items-center justify-center p-4'>
      <div className='w-full max-w-2xl'>
        {/* Header */}
        {/* Home button */}
        <div className='mb-3'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 bg-white text-purple-700 font-extrabold text-sm px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-purple-200'
          >
            🏠 Back to Home
          </Link>
        </div>

        <div
          className={`bg-gradient-to-r ${partColor} rounded-3xl p-4 mb-4 text-white shadow-lg`}
        >
          <div className='flex justify-between items-center'>
            <span className='font-bold text-lg'>
              {q.part}: {q.partTitle}
            </span>
            <div className='flex items-center gap-2'>
              <button
                onClick={toggleMute}
                className='bg-white/20 hover:bg-white/40 rounded-full w-9 h-9 flex items-center justify-center text-xl transition-all'
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? '🔇' : '🔊'}
              </button>
              <span className='bg-white/30 rounded-full px-3 py-1 font-bold'>
                {index + 1} / {shuffled.length}
              </span>
            </div>
          </div>
          <div className='mt-2 bg-white/30 rounded-full h-4 overflow-hidden'>
            <div
              className='h-full bg-white rounded-full transition-all duration-500'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className='bg-white rounded-3xl shadow-xl p-6 mb-4 border-4 border-purple-200'>
          <div className='text-4xl text-center mb-2'>🤔</div>
          <p className='text-center text-xl md:text-2xl font-bold text-purple-800 leading-relaxed'>
            {q.questionText}
          </p>
        </div>

        {/* Options */}
        <div className='space-y-3 mb-4'>
          {opts.map((opt, i) => {
            const colors = OPTION_COLORS[i % OPTION_COLORS.length];
            const isSelected = chosen === opt.value;
            const isCorrect = opt.value === q.correctOption;
            const showResult = !!chosen;
            let cls = `w-full flex items-center gap-4 p-4 rounded-2xl border-4 text-left font-bold text-lg transition-all duration-300 cursor-pointer shadow-md `;
            if (!showResult)
              cls += `${colors.bg} ${colors.text} border-transparent`;
            else if (isCorrect)
              cls += 'bg-green-400 border-green-600 text-green-900 scale-105';
            else if (isSelected)
              cls += 'bg-red-400 border-red-600 text-red-900';
            else cls += 'bg-gray-100 border-gray-200 text-gray-400 opacity-60';
            return (
              <button
                key={opt.value}
                className={cls}
                onClick={() => handleAnswer(opt.value)}
                disabled={!!chosen}
              >
                <span className='bg-white/50 rounded-full w-10 h-10 flex items-center justify-center font-extrabold text-xl shrink-0'>
                  {opt.label}
                </span>
                <span>{opt.text}</span>
                {showResult && isCorrect && (
                  <span className='ml-auto text-2xl'>✅</span>
                )}
                {showResult && isSelected && !isCorrect && (
                  <span className='ml-auto text-2xl'>❌</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`rounded-3xl p-4 text-center border-4 mb-4 ${feedback === 'correct' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-orange-100 border-orange-400 text-orange-800'}`}
          >
            <div className='text-5xl mb-1'>{feedbackEmoji}</div>
            <p className='font-extrabold text-xl'>
              {feedback === 'correct'
                ? "Amazing! That's correct! 🌟"
                : `Oops! The answer is "${q.correctAnswer}" 💪`}
            </p>
            <button
              onClick={next}
              className='mt-3 bg-purple-500 hover:bg-purple-600 text-white font-extrabold text-lg px-8 py-3 rounded-full shadow-lg transition-all hover:scale-105'
            >
              {index + 1 >= shuffled.length
                ? 'See My Score! 🏆'
                : 'Next Question →'}
            </button>
          </div>
        )}

        {/* Score badge */}
        <div className='flex justify-center'>
          <div className='bg-white rounded-full px-6 py-2 shadow font-bold text-purple-700 text-lg border-2 border-purple-200'>
            ⭐ Score: {score} / {index + (feedback ? 1 : 0)}
          </div>
        </div>
      </div>
    </div>
  );
}

function SetSelector({
  sets,
  onSelect,
  muted,
  onToggleMute,
}: {
  sets: string[];
  onSelect: (s: string) => void;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const setConfig: Record<
    string,
    { emoji: string; color: string; desc: string }
  > = {
    'Basic Assessment': {
      emoji: '📚',
      color: 'from-purple-400 to-indigo-500',
      desc: 'English, Math, Logic & General Knowledge',
    },
    'Logic & IQ Practice': {
      emoji: '🧠',
      color: 'from-orange-400 to-pink-500',
      desc: 'Patterns, Odd One Out & Reasoning',
    },
    'Grade 2 Practice Exam': {
      emoji: '🐬',
      color: 'from-yellow-400 to-green-500',
      desc: 'English, Math, Science & Logic',
    },
  };
  return (
    <div className='min-h-screen bg-gradient-to-br from-sky-200 via-yellow-100 to-pink-200 flex items-center justify-center p-4'>
      <div className='w-full max-w-xl text-center'>
        <div className='flex justify-end mb-2'>
          <button
            onClick={onToggleMute}
            className='bg-white/60 hover:bg-white/90 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow transition-all'
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
        <div className='text-7xl mb-4'>🌟</div>
        <h1 className='text-4xl md:text-5xl font-extrabold text-purple-800 mb-2'>
          Fun Quiz Time!
        </h1>
        <p className='text-xl text-purple-600 mb-8 font-semibold'>
          Pick a quiz to start! 🎉
        </p>
        <div className='space-y-4'>
          {sets.map((set) => {
            const cfg = setConfig[set] ?? {
              emoji: '🎯',
              color: 'from-teal-400 to-cyan-500',
              desc: 'Try this quiz!',
            };
            return (
              <button
                key={set}
                onClick={() => onSelect(set)}
                className={`w-full bg-gradient-to-r ${cfg.color} text-white rounded-3xl p-6 shadow-xl flex items-center gap-5 text-left hover:scale-105 transition-all duration-200 border-4 border-white/40`}
              >
                <span className='text-5xl'>{cfg.emoji}</span>
                <div>
                  <div className='font-extrabold text-2xl'>{set}</div>
                  <div className='text-white/80 text-base font-medium'>
                    {cfg.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <p className='mt-8 text-purple-500 font-medium mb-5'>
          30 questions per quiz • Choose wisely! 🦄
        </p>
        <div className='flex gap-3 justify-center flex-wrap'>
          <Link
            href='/profile'
            className='bg-white/70 hover:bg-white text-purple-700 font-bold text-base px-6 py-2 rounded-full shadow hover:scale-105 transition-all duration-200 border-2 border-purple-200'
          >
            👤 My Profile
          </Link>
          <Link
            href='/leaderboard'
            className='bg-white/70 hover:bg-white text-purple-700 font-bold text-base px-6 py-2 rounded-full shadow hover:scale-105 transition-all duration-200 border-2 border-purple-200'
          >
            🏆 Leaderboard
          </Link>
          <Link
            href='/contact'
            className='bg-white/70 hover:bg-white text-purple-700 font-bold text-base px-6 py-2 rounded-full shadow hover:scale-105 transition-all duration-200 border-2 border-purple-200'
          >
            💌 Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

function ResultScreen({
  score,
  total,
  playerName,
  questionSet,
  onRestart,
  onRetry,
  muted,
  onToggleMute,
}: {
  score: number;
  total: number;
  playerName: string;
  questionSet: string;
  onRestart: () => void;
  onRetry: () => void;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const star = pct >= 80 ? '🏆' : pct >= 50 ? '🌟' : '💪';
  const base =
    pct >= 80
      ? "You're a superstar"
      : pct >= 50
        ? 'Great effort'
        : 'Keep practising';
  const msg = playerName ? `${base}, ${playerName}!` : `${base}!`;
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const handleShare = async () => {
    const text = `I scored ${score}/${total} (${pct}%) on the "${questionSet}" quiz! ${star}`;
    const url = `${window.location.origin}/quiz`;
    if (navigator.share) {
      try {
        await navigator.share({ text, url });
      } catch {
        /* user cancelled the native share sheet */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-sky-200 via-yellow-100 to-pink-200 flex items-center justify-center p-4'>
      <div className='bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-purple-200'>
        <div className='flex justify-end mb-2'>
          <button
            onClick={onToggleMute}
            className='bg-purple-100 hover:bg-purple-200 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow transition-all'
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
        <div className='text-8xl mb-4'>{star}</div>
        <h2 className='text-4xl font-extrabold text-purple-800 mb-2'>{msg}</h2>
        <p className='inline-block bg-purple-100 text-purple-700 font-bold text-sm px-4 py-1 rounded-full mb-4'>
          {questionSet}
        </p>
        <p className='text-xl text-purple-500 mb-6 font-semibold'>You scored</p>
        <div className='bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-2xl p-6 mb-6'>
          <span className='text-6xl font-extrabold'>{score}</span>
          <span className='text-3xl font-bold'> / {total}</span>
          <div className='text-xl mt-1 font-semibold'>{pct}% correct 🎊</div>
        </div>
        <div className='space-y-3'>
          <button
            onClick={onRetry}
            className='w-full bg-purple-500 hover:bg-purple-600 text-white font-extrabold text-xl py-4 rounded-full shadow-lg transition-all hover:scale-105'
          >
            🔄 Try Again
          </button>
          <button
            onClick={onRestart}
            className='w-full bg-sky-400 hover:bg-sky-500 text-white font-extrabold text-xl py-4 rounded-full shadow-lg transition-all hover:scale-105'
          >
            🏠 Choose Another Quiz
          </button>
          <Link
            href={`/leaderboard?questionSet=${encodeURIComponent(questionSet)}`}
            className='block w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-extrabold text-xl py-4 rounded-full shadow-lg transition-all hover:scale-105'
          >
            🏆 See Leaderboard
          </Link>
          <button
            onClick={handleShare}
            className='w-full bg-green-400 hover:bg-green-500 text-green-950 font-extrabold text-xl py-4 rounded-full shadow-lg transition-all hover:scale-105'
          >
            {shareStatus === 'copied' ? '✅ Copied!' : '📤 Share My Score'}
          </button>
        </div>
      </div>
    </div>
  );
}
