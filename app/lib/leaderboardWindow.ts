const UTC_PLUS_8_OFFSET_MS = 8 * 60 * 60 * 1000;

/**
 * Start of the current leaderboard week: the most recent Monday 00:00 in
 * UTC+8, expressed as the equivalent UTC instant. Entries older than this
 * are excluded, so the leaderboard "resets" the moment the boundary passes
 * without ever deleting data.
 */
export function currentLeaderboardWeekStart(now: Date = new Date()): Date {
  const shifted = new Date(now.getTime() + UTC_PLUS_8_OFFSET_MS);
  const day = shifted.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  const daysSinceMonday = (day + 6) % 7;
  const mondayInShiftedClock = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate() - daysSinceMonday,
    0, 0, 0, 0,
  );
  return new Date(mondayInShiftedClock - UTC_PLUS_8_OFFSET_MS);
}
