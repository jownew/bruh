"use client";

import Link from "next/link";
import { useState } from "react";
import { useUserData, type QuizAttempt } from "../hooks/useUserData";

function pct(a: QuizAttempt) {
  return Math.round((a.score / a.total) * 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ScoreBadge({ value }: { value: number }) {
  const color = value >= 80 ? "text-green-600" : value >= 50 ? "text-yellow-600" : "text-red-500";
  return <span className={`font-extrabold ${color}`}>{value}%</span>;
}

export default function UserProfile() {
  const { name, history, loaded, setName, clearData } = useUserData();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  // Avoid hydration mismatch — render nothing until localStorage is read.
  if (!loaded) return null;

  const submitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) { setName(input.trim()); setInput(""); setEditing(false); }
  };

  const totalQuizzes = history.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(history.reduce((s, a) => s + pct(a), 0) / totalQuizzes)
    : 0;

  return (
    <div className="mb-6">
      {/* ── Name section ── */}
      {!name || editing ? (
        <form onSubmit={submitName} className="flex gap-2 justify-center items-center flex-wrap mb-4">
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What's your name? 😊"
            maxLength={30}
            className="border-2 border-purple-300 rounded-full px-4 py-2 text-purple-800 font-bold focus:outline-none focus:border-purple-500 bg-white/80"
          />
          <button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-5 py-2 rounded-full transition-all">
            Save 🌟
          </button>
          {name && (
            <button type="button" onClick={() => setEditing(false)} className="text-purple-400 hover:underline text-sm">
              Cancel
            </button>
          )}
        </form>
      ) : (
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          <p className="text-2xl font-extrabold text-purple-700">Hi, {name}! 👋</p>
          <button onClick={() => { setEditing(true); setInput(name); }} title="Edit name"
            className="flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-sm px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition-all">
            ✏️ Edit
          </button>
        </div>
      )}

      {/* ── Progress & history (only if there are attempts) ── */}
      {totalQuizzes > 0 && (
        <div className="bg-white/60 backdrop-blur rounded-2xl p-4 border-2 border-purple-100 text-left">
          {/* Stats row */}
          <h3 className="font-extrabold text-purple-700 text-base mb-3 text-center">📊 Your Progress</h3>
          <div className="flex justify-center gap-8 mb-4">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-purple-800">{totalQuizzes}</p>
              <p className="text-xs font-semibold text-purple-500">Quizzes taken</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-purple-800">{avgScore}%</p>
              <p className="text-xs font-semibold text-purple-500">Avg score</p>
            </div>
          </div>

          {/* Recent attempts */}
          <p className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-2">Recent results</p>
          <div className="space-y-1.5">
            {history.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2 text-sm">
                <span className="font-semibold text-purple-700 truncate max-w-[160px]">{a.questionSet}</span>
                <span className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-purple-600 font-bold">{a.score}/{a.total}</span>
                  <ScoreBadge value={pct(a)} />
                  <span className="text-purple-300 text-xs">{formatDate(a.date)}</span>
                </span>
              </div>
            ))}
          </div>

          {/* See all link */}
          <div className="mt-3 text-center">
            <Link href="/profile" className="text-sm font-bold text-purple-500 hover:text-purple-700 hover:underline transition-colors">
              See full history →
            </Link>
          </div>

          {/* Clear data */}
          <div className="mt-3 text-center">
            {confirmClear ? (
              <div className="flex gap-2 justify-center items-center flex-wrap">
                <span className="text-sm font-bold text-red-600">Clear all saved data?</span>
                <button onClick={() => { clearData(); setConfirmClear(false); }}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full transition-all">
                  Yes, clear 🗑️
                </button>
                <button onClick={() => setConfirmClear(false)} className="text-purple-400 hover:underline text-sm">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmClear(true)}
                className="text-xs text-purple-300 hover:text-red-400 transition-colors">
                🗑️ Clear my data
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
