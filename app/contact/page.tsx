"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitContact, type ContactState } from "./actions";

const initialState: ContactState = { status: "idle", message: "" };

export default function ContactPage() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-200 via-yellow-100 to-pink-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-green-200">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-3xl font-extrabold text-purple-800 mb-3">Message Sent!</h2>
          <p className="text-lg text-purple-600 font-semibold mb-6">{state.message}</p>
          <Link href="/" className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-lg px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-all">
            🏠 Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-yellow-100 to-pink-200 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">💌</div>
          <h1 className="text-4xl font-extrabold text-purple-800 mb-1">Contact Us</h1>
          <p className="text-purple-600 font-semibold">Got feedback or questions? We&apos;d love to hear from you!</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-purple-200">
          <form action={formAction} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block font-bold text-purple-700 mb-1" htmlFor="name">Your Name ⭐</label>
              <input
                id="name" name="name" type="text" required
                placeholder="e.g. Aisha"
                className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 text-purple-900 font-semibold focus:outline-none focus:border-purple-400 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-bold text-purple-700 mb-1" htmlFor="email">Email Address 📧</label>
              <input
                id="email" name="email" type="email" required
                placeholder="e.g. parent@example.com"
                className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 text-purple-900 font-semibold focus:outline-none focus:border-purple-400 transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-bold text-purple-700 mb-1" htmlFor="category">Category 🎯</label>
              <select
                id="category" name="category"
                className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 text-purple-900 font-semibold focus:outline-none focus:border-purple-400 transition-all bg-white"
              >
                <option value="Feedback">💬 Feedback</option>
                <option value="Bug Report">🐛 Bug Report</option>
                <option value="Question">🤔 Question</option>
                <option value="Other">✨ Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block font-bold text-purple-700 mb-1" htmlFor="message">Message 📝</label>
              <textarea
                id="message" name="message" required rows={4}
                placeholder="Write your message here..."
                className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 text-purple-900 font-semibold focus:outline-none focus:border-purple-400 transition-all resize-none"
              />
            </div>

            {/* Error */}
            {state.status === "error" && (
              <p className="text-red-600 font-bold text-center bg-red-50 rounded-2xl px-4 py-2 border-2 border-red-200">
                ⚠️ {state.message}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={pending}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-xl py-4 rounded-full shadow-lg hover:scale-105 transition-all disabled:opacity-60 disabled:scale-100"
            >
              {pending ? "Sending... ⏳" : "Send Message 🚀"}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center mt-4">
          <Link href="/" className="text-purple-600 font-bold hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
