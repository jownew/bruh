import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    question_set TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    elapsed_seconds INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

// Idempotent for databases migrated before elapsed_seconds existed.
await sql`
  ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS elapsed_seconds INTEGER
`;

await sql`
  DROP INDEX IF EXISTS leaderboard_entries_ranking_idx
`;

await sql`
  CREATE INDEX IF NOT EXISTS leaderboard_entries_ranking_idx
  ON leaderboard_entries (question_set, score DESC, elapsed_seconds ASC NULLS LAST, total ASC, created_at ASC)
`;

console.log("Migration complete: leaderboard_entries table is ready.");
