import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import { currentLeaderboardWeekStart } from "@/app/lib/leaderboardWindow";

/**
 * Distinct question sets with scores in the current leaderboard week,
 * including ones no longer present in the question bank — so a quiz type
 * that gets removed/renamed still shows its leaderboard until the weekly
 * reset ages the old entries out.
 */
export async function GET() {
  const weekStart = currentLeaderboardWeekStart().toISOString();

  const rows = await sql`
    SELECT DISTINCT question_set
    FROM leaderboard_entries
    WHERE created_at >= ${weekStart}
  `;

  const sets: string[] = rows.map((r) => r.question_set);

  return NextResponse.json({ sets });
}
