import { Suspense } from 'react';
import LeaderboardView from './LeaderboardView';

export default function LeaderboardPage() {
  return (
    <Suspense fallback={null}>
      <LeaderboardView />
    </Suspense>
  );
}
