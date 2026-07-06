# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Important: non-standard Next.js version

This repo pins `next@16.2.9`, a version ahead of this model's training data — App Router APIs, conventions, and file structure may differ from what you expect. Per `AGENTS.md`, consult `node_modules/next/dist/docs/` (after `npm install`) before writing framework-touching code, and pay attention to deprecation notices.

## Keep the changelog updated

`app/changelog/page.tsx` is a hand-written changelog shown to players/parents at `/changelog`. **Whenever you implement a notable user-facing change** (new feature, visible behavior change, meaningful fix), add an entry to the top of its `ENTRIES` array (newest first, use today's date). Write each entry the way you'd explain it to a non-developer: plain language, one short sentence, no jargon (no "API", "backend", "refactor", "endpoint", "component") — match the tone of existing entries. Skip purely internal changes (dependency bumps, docs, config, refactors with no visible effect, lint fixes).

## Commands

- `npm run dev` — start the dev server (Turbopack, per Next 16 default)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint via `eslint.config.mjs` (flat config, extends `eslint-config-next` core-web-vitals + typescript)

There is no test runner configured in this project.

## Environment

Copy `.env.example` to `.env.local`. Required vars for the contact form to send email (via Resend):
- `RESEND_API_KEY`
- `RESEND_FROM`
- `CONTACT_TO`

If unset, `submitContact` (`app/contact/actions.ts`) fails gracefully with a user-facing error rather than throwing.

`DATABASE_URL` (a Neon Postgres connection string) is required for the leaderboard. After setting it, run `npm run db:migrate` once to create the `leaderboard_entries` table.

## Architecture

This is a single-purpose kids' quiz app (App Router, all client components except the contact server action).

- **Question data lives in a CSV, not a database.** `data/structured_question_bank.csv` is the source of truth for all quiz content. `app/api/questions/route.ts` reads and hand-parses this file (custom `parseCSVLine`, no library) on every request, groups rows by `QuestionSet`, and serves `{ questions, sets }` as JSON. `GET /api/questions?questionSet=X` filters to one set. The `Question` interface exported from this route file is imported directly by `app/quiz/page.tsx` as the shared type — there's no separate types module.
- **User identity and history are entirely client-side.** `app/hooks/useUserData.ts` persists `{ name, history }` to `localStorage` under key `bruh_user_data` (capped at 50 attempts) via a module-level `useSyncExternalStore` store (chosen over `useState`+`useEffect` to avoid the `react-hooks/set-state-in-effect` lint rule — see git history). There is no backend user store or auth. If a player has never set a name, `loadFromStorage()` assigns one via `app/lib/kidSafeName.ts`'s `generateKidSafeName()` (e.g. `"SparklyPanda42"`) and persists it immediately, so `name` is effectively never empty once `loaded` is true — editable later via the pencil icon in `UserProfile.tsx`/`profile/page.tsx`. Manually-entered names are checked against `app/lib/profanityFilter.ts`'s `containsProfanity()` (wraps the `bad-words` package, augmented with `data/custom_profanity.csv` — a two-column `type,word` file with `block`/`allow` rows, read once at module load; `allow` rows un-flag words the default list gets wrong). This module uses `fs`/`path`, so it's **server-only**: the leaderboard `POST` handler imports it directly, but the client name-editing forms (`UserProfile.tsx`/`profile/page.tsx`) go through `app/lib/profanityActions.ts`'s `"use server"` action instead, the same server-action pattern `app/contact/actions.ts` uses. The server-side check is the one that actually matters — it's the only surface visible to other players, since client-side checks alone can be bypassed via devtools. This also means `app/quiz/page.tsx`'s `if (playerName)` leaderboard-submission gate now fires for virtually every completed quiz, not just ones with a manually-entered name. Both `app/components/UserProfile.tsx` (home page widget) and `app/profile/page.tsx` (full history page) read from this same hook independently — keep them in sync manually if the data shape changes. Components using this hook render `null` until `loaded` is true to avoid SSR/localStorage hydration mismatches.
- **Sound effects are synthesized, not sampled.** `app/hooks/useAudio.ts` builds tones/melodies at runtime via the Web Audio API (`OscillatorNode`/`GainNode`) — there are no audio asset files. Background music is a self-rescheduling `setTimeout` loop; mute state is tracked in both a ref (for the audio callbacks) and React state (for UI).
- **Quiz flow is one large stateful component.** `app/quiz/page.tsx` fetches sets, then questions for the chosen set, shuffles them client-side, and drives selection → answer → feedback → next through local `useState`, saving the final attempt via `useUserData().saveAttempt` on completion. `SetSelector` and `ResultScreen` are defined in the same file rather than split out.
- **Leaderboard is the one piece of server-side persistence, in Neon Postgres.** `app/lib/db.ts` exports a lazily-instantiated `sql` tagged-template client (`@neondatabase/serverless`) so importing it doesn't throw at build time when `DATABASE_URL` is unset. `scripts/migrate.mjs` (run via `npm run db:migrate`) creates the `leaderboard_entries` table and is written to be idempotent (`ADD COLUMN IF NOT EXISTS`, etc.) — there's no migration framework, so schema changes mean hand-editing that script and re-running it, including against already-migrated databases. `app/api/leaderboard/route.ts` exposes `GET ?questionSet=&limit=` (top scores ranked by `score DESC, elapsed_seconds ASC NULLS LAST` — i.e. correctness first, speed as the tiebreak) and `POST` (insert one entry). **The leaderboard resets weekly without deleting anything**: `app/lib/leaderboardWindow.ts`'s `currentLeaderboardWeekStart()` computes the most recent Monday 00:00 UTC+8 as a UTC instant, and `GET` filters to `created_at >= ` that boundary — so old rows just age out of view once the boundary passes, and stay in the table for history/analytics. There's no cron job; the window is recomputed on every request. `app/quiz/page.tsx` times each attempt (`startTimeRef` set in `startQuiz`, read when the quiz finishes) and fires the `POST` best-effort when the player has set a name; `elapsedSeconds` is `null` for entries where timing wasn't captured (e.g. rows from before this column existed). `app/leaderboard/LeaderboardView.tsx` (wrapped in `Suspense` by `page.tsx` since it uses `useSearchParams`) renders the `GET` results. **Note:** the submitted score/time is trusted from the client, not recomputed server-side — fine for a casual kids' app, but anyone could POST a fake score via devtools; add server-side answer validation if that becomes a concern.
- **Styling is Tailwind v4** via `@tailwindcss/postcss` (no `tailwind.config.*` — v4 uses CSS-based config in `app/globals.css`). UI is heavily gradient/emoji-driven; color mappings per quiz part live in `PART_COLORS`/`OPTION_COLORS` constants in `quiz/page.tsx`.
- Path alias `@/*` maps to the repo root (`tsconfig.json`).
