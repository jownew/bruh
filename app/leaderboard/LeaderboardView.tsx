'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { LeaderboardEntry } from '../api/leaderboard/route';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function rankBadge(i: number) {
  return i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
}

function formatElapsed(seconds: number | null) {
  if (seconds === null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function LeaderboardView() {
  const searchParams = useSearchParams();
  const [sets, setSets] = useState<string[]>([]);
  const [selectedSet, setSelectedSet] = useState<string | null>(
    searchParams.get('questionSet'),
  );
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/questions')
      .then((r) => r.json())
      .then((d: { sets: string[] }) => {
        setSets(d.sets);
        setSelectedSet((current) => current ?? d.sets[0] ?? null);
      });
  }, []);

  const loadEntries = useCallback((set: string) => {
    fetch(`/api/leaderboard?questionSet=${encodeURIComponent(set)}&limit=10`)
      .then((r) => r.json())
      .then((d: { entries: LeaderboardEntry[] }) => {
        setEntries(d.entries ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedSet) loadEntries(selectedSet);
  }, [selectedSet, loadEntries]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-sky-200 via-yellow-100 to-pink-200 flex items-center justify-center p-4'>
      <div className='w-full max-w-lg'>
        <div className='mb-3 flex justify-between items-center'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 bg-white text-purple-700 font-extrabold text-sm px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-purple-200'
          >
            🏠 Back to Home
          </Link>
          <Link
            href='/quiz'
            className='inline-flex items-center gap-2 bg-white text-purple-700 font-extrabold text-sm px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-purple-200'
          >
            🚀 Play Quiz
          </Link>
        </div>

        <div className='text-center mb-6'>
          <div className='text-6xl mb-2'>🏆</div>
          <h1 className='text-4xl font-extrabold text-purple-800 mb-1'>
            Leaderboard
          </h1>
          <p className='text-purple-600 font-semibold'>
            This week&apos;s top scores!
          </p>
          <p className='text-purple-400 text-xs mt-1'>
            Ranked by score, fastest time breaks ties ⚡ · resets every Monday
            12am (UTC+8) 🔄
          </p>
        </div>

        {sets.length > 1 && (
          <div className='flex flex-wrap gap-2 justify-center mb-4'>
            {sets.map((set) => (
              <button
                key={set}
                onClick={() => setSelectedSet(set)}
                className={`font-bold text-sm px-4 py-2 rounded-full border-2 transition-all ${
                  selectedSet === set
                    ? 'bg-purple-500 text-white border-purple-600'
                    : 'bg-white/70 text-purple-700 border-purple-200 hover:bg-white'
                }`}
              >
                {set}
              </button>
            ))}
          </div>
        )}

        <div className='bg-white rounded-3xl shadow-xl p-6 border-4 border-purple-200'>
          {loading ? (
            <p className='text-center text-purple-500 font-semibold py-8'>
              Loading scores... ⏳
            </p>
          ) : entries.length === 0 ? (
            <p className='text-center text-purple-500 font-semibold py-8'>
              No scores yet for this quiz. Be the first! 🌟
            </p>
          ) : (
            <div className='space-y-2'>
              {entries.map((entry, i) => {
                const pct = Math.round((entry.score / entry.total) * 100);
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                      i < 3 ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-purple-50'
                    }`}
                  >
                    <span className='font-extrabold text-purple-700 w-9 shrink-0 text-center'>
                      {rankBadge(i)}
                    </span>
                    <span className='font-bold text-purple-800 flex-1 truncate'>
                      {entry.name}
                    </span>
                    <span className='font-bold text-purple-600 text-sm shrink-0'>
                      {entry.score}/{entry.total}
                    </span>
                    <span className='font-extrabold text-purple-700 shrink-0 w-12 text-right'>
                      {pct}%
                    </span>
                    <span className='text-purple-500 text-xs font-bold shrink-0 w-12 text-right'>
                      ⏱ {formatElapsed(entry.elapsedSeconds)}
                    </span>
                    <span className='text-purple-300 text-xs shrink-0 w-14 text-right'>
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
