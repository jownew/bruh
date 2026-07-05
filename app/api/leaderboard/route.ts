import { NextResponse } from "next/server";
import { sql } from "@/app/lib/db";
import { currentLeaderboardWeekStart } from "@/app/lib/leaderboardWindow";

export interface LeaderboardEntry {
  id: number;
  name: string;
  questionSet: string;
  score: number;
  total: number;
  elapsedSeconds: number | null;
  createdAt: string;
}

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;
const MAX_NAME_LENGTH = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const questionSet = searchParams.get("questionSet");
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get("limit") ?? "", 10) || DEFAULT_LIMIT),
  );

  if (!questionSet) {
    return NextResponse.json(
      { error: "questionSet query param is required" },
      { status: 400 },
    );
  }

  const weekStart = currentLeaderboardWeekStart().toISOString();

  const rows = await sql`
    SELECT id, name, question_set, score, total, elapsed_seconds, created_at
    FROM leaderboard_entries
    WHERE question_set = ${questionSet} AND created_at >= ${weekStart}
    ORDER BY score DESC, elapsed_seconds ASC NULLS LAST, total ASC, created_at ASC
    LIMIT ${limit}
  `;

  const entries: LeaderboardEntry[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    questionSet: r.question_set,
    score: r.score,
    total: r.total,
    elapsedSeconds: r.elapsed_seconds,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const questionSet =
    typeof body?.questionSet === "string" ? body.questionSet.trim() : "";
  const score = Number(body?.score);
  const total = Number(body?.total);
  const elapsedSeconds =
    body?.elapsedSeconds === undefined || body?.elapsedSeconds === null
      ? null
      : Number(body.elapsedSeconds);

  if (!name || name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: `name is required (max ${MAX_NAME_LENGTH} chars)` },
      { status: 400 },
    );
  }
  if (!questionSet) {
    return NextResponse.json(
      { error: "questionSet is required" },
      { status: 400 },
    );
  }
  if (
    !Number.isInteger(score) ||
    !Number.isInteger(total) ||
    total <= 0 ||
    score < 0 ||
    score > total
  ) {
    return NextResponse.json(
      { error: "score/total must be integers with 0 <= score <= total" },
      { status: 400 },
    );
  }
  if (elapsedSeconds !== null && (!Number.isInteger(elapsedSeconds) || elapsedSeconds < 0)) {
    return NextResponse.json(
      { error: "elapsedSeconds must be a non-negative integer" },
      { status: 400 },
    );
  }

  const [row] = await sql`
    INSERT INTO leaderboard_entries (name, question_set, score, total, elapsed_seconds)
    VALUES (${name}, ${questionSet}, ${score}, ${total}, ${elapsedSeconds})
    RETURNING id, name, question_set, score, total, elapsed_seconds, created_at
  `;

  const entry: LeaderboardEntry = {
    id: row.id,
    name: row.name,
    questionSet: row.question_set,
    score: row.score,
    total: row.total,
    elapsedSeconds: row.elapsed_seconds,
    createdAt: row.created_at,
  };

  return NextResponse.json({ entry }, { status: 201 });
}
