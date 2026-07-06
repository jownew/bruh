"use client";

import Link from "next/link";
import { useState } from "react";
import { useUserData, type QuizAttempt } from "../hooks/useUserData";
import { checkNameForProfanity } from "../lib/profanityActions";

function pct(a: QuizAttempt) { return Math.round((a.score / a.total) * 100); }
function scoreColor(v: number) { return v >= 80 ? "text-green-600" : v >= 50 ? "text-yellow-600" : "text-red-500"; }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ProfilePage() {
  const { name, history, loaded, setName, clearData } = useUserData();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [nameError, setNameError] = useState("");

  if (!loaded) return null;

  const submitName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    if (await checkNameForProfanity(trimmed)) {
      setNameError("Please choose a friendlier name 😊");
      return;
    }
    setName(trimmed);
    setInput("");
    setNameError("");
    setEditing(false);
  };

  const totalQuizzes = history.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(history.reduce((s, a) => s + pct(a), 0) / totalQuizzes) : 0;

  const setStats: Record<string, { best: number; count: number }> = {};
  for (const a of history) {
    if (!setStats[a.questionSet]) setStats[a.questionSet] = { best: 0, count: 0 };
    setStats[a.questionSet].best = Math.max(setStats[a.questionSet].best, pct(a));
    setStats[a.questionSet].count++;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-yellow-100 to-pink-200 p-4">
      <div className="max-w-lg mx-auto">

        {/* Top nav */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="text-purple-600 font-bold hover:underline">← Home</Link>
          {confirmClear ? (
            <div className="flex gap-2 items-center">
              <span className="text-sm font-bold text-red-600">Clear all data?</span>
              <button onClick={() => { clearData(); setConfirmClear(false); }}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                Yes 🗑️
              </button>
              <button onClick={() => setConfirmClear(false)} className="text-purple-400 text-sm hover:underline">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)}
              className="text-xs text-purple-300 hover:text-red-400 transition-colors">
              🗑️ Clear data
            </button>
          )}
        </div>

        {/* Name / avatar */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">👤</div>
          {!name || editing ? (
            <div>
              <form onSubmit={submitName} className="flex gap-2 justify-center flex-wrap">
                <input autoFocus value={input} onChange={(e) => { setInput(e.target.value); setNameError(""); }}
                  placeholder="Your name" maxLength={30}
                  className="border-2 border-purple-300 rounded-full px-4 py-2 text-purple-800 font-bold focus:outline-none focus:border-purple-500 bg-white/80" />
                <button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-full">Save 🌟</button>
                {name && <button type="button" onClick={() => { setEditing(false); setNameError(""); }} className="text-purple-400 hover:underline text-sm self-center">Cancel</button>}
              </form>
              {nameError && (
                <p className="text-red-500 font-bold text-sm mt-2">{nameError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h1 className="text-3xl font-extrabold text-purple-800">{name}</h1>
              <button onClick={() => { setEditing(true); setInput(name); }} title="Edit name"
                className="flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-sm px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition-all">
                ✏️ Edit
              </button>
            </div>
          )}
        </div>

        {totalQuizzes === 0 ? (
          <div className="bg-white/60 rounded-2xl p-8 text-center border-2 border-purple-100">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-purple-600 font-semibold mb-4">No quizzes completed yet.</p>
            <Link href="/quiz" className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold px-6 py-3 rounded-full shadow hover:scale-105 transition-all">
              🚀 Start a Quiz!
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary stats */}
            <div className="flex gap-4">
              <div className="flex-1 bg-white/70 rounded-2xl p-4 text-center border-2 border-purple-100">
                <p className="text-4xl font-extrabold text-purple-800">{totalQuizzes}</p>
                <p className="text-xs font-semibold text-purple-500 mt-1">Quizzes taken</p>
              </div>
              <div className="flex-1 bg-white/70 rounded-2xl p-4 text-center border-2 border-purple-100">
                <p className={`text-4xl font-extrabold ${scoreColor(avgScore)}`}>{avgScore}%</p>
                <p className="text-xs font-semibold text-purple-500 mt-1">Avg score</p>
              </div>
            </div>

            {/* Per-set best */}
            <div className="bg-white/60 rounded-2xl p-4 border-2 border-purple-100">
              <h2 className="font-extrabold text-purple-700 text-xs uppercase tracking-wide mb-3">Best per quiz</h2>
              <div className="space-y-2">
                {Object.entries(setStats).map(([set, s]) => (
                  <div key={set} className="flex items-center justify-between">
                    <span className="font-semibold text-purple-700 text-sm truncate max-w-[180px]">{set}</span>
                    <span className="flex gap-3 text-sm shrink-0 ml-2">
                      <span className={`font-extrabold ${scoreColor(s.best)}`}>Best {s.best}%</span>
                      <span className="text-purple-400">{s.count} attempt{s.count !== 1 ? "s" : ""}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Full history */}
            <div className="bg-white/60 rounded-2xl p-4 border-2 border-purple-100">
              <h2 className="font-extrabold text-purple-700 text-xs uppercase tracking-wide mb-3">
                Full history ({totalQuizzes})
              </h2>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {history.map((a, i) => (
                  <div key={a.id} className="flex items-center bg-white/70 rounded-xl px-3 py-2 text-sm gap-2">
                    <span className="text-purple-300 text-xs w-5 shrink-0 text-right">{i + 1}</span>
                    <span className="font-semibold text-purple-700 truncate flex-1">{a.questionSet}</span>
                    <span className="text-purple-600 font-bold shrink-0">{a.score}/{a.total}</span>
                    <span className={`font-extrabold shrink-0 ${scoreColor(pct(a))}`}>{pct(a)}%</span>
                    <span className="text-purple-300 text-xs shrink-0">{formatDate(a.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
